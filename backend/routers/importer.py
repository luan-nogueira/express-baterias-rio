"""Bulk import of the manufacturers' application table (CSV or XLSX), one row per vehicle × battery.

Batteries are upserted by code; vehicles by (make, model, engine, version, year_from, year_to) and
their battery list is replaced by the file's rows, in file order (first row = main indication).
"""

import io
import re
import unicodedata

import pandas as pd
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import ValidationError

from lib.auth import require_admin
from lib.db import db
from models.catalog import Battery, BatteryIn, Vehicle, VehicleIn, vehicle_search_text
from models.store import ImportReport, ImportRowError, ReferenceCleanup
from routers.images import delete_image_by_url

router = APIRouter(prefix="/admin", tags=["import"], dependencies=[Depends(require_admin)])

COLUMNS = [
    "marca_veiculo", "modelo", "motor", "versao", "ano_inicial", "ano_final", "start_stop",
    "codigo_bateria", "marca_bateria", "linha", "ah", "cca", "tecnologia", "polaridade",
    "comprimento_mm", "largura_mm", "altura_mm", "preco", "estoque",
]
ALIASES = {
    "marca": "marca_veiculo", "montadora": "marca_veiculo", "motorizacao": "motor", "ano_de": "ano_inicial",
    "ano_ate": "ano_final", "ano_inicio": "ano_inicial", "ano_fim": "ano_final", "codigo": "codigo_bateria",
    "codigo_produto": "codigo_bateria", "bateria": "codigo_bateria", "capacidade": "ah", "capacidade_ah": "ah",
    "comprimento": "comprimento_mm", "largura": "largura_mm", "altura": "altura_mm", "startstop": "start_stop",
    "versao_veiculo": "versao", "marca_da_bateria": "marca_bateria",
}
REQUIRED = ["marca_veiculo", "modelo", "motor", "ano_inicial", "ano_final", "codigo_bateria"]
MAX_BYTES = 5 * 1024 * 1024
MAX_ROWS = 10000


def _norm(s: object) -> str:
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().strip().lower()
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return ALIASES.get(s, s)


def _cell(v: object) -> str | None:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    s = str(v).strip()
    return None if s == "" or s.lower() == "nan" else s


def _int(v: object, field: str) -> int | None:
    s = _cell(v)
    if s is None:
        return None
    try:
        return int(float(s.replace(",", ".")))
    except ValueError:
        raise ValueError(f"{field}: '{s}' não é um número")


def _price(v: object) -> float | None:
    s = _cell(v)
    if s is None:
        return None
    s = s.replace("R$", "").replace(" ", "")
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        raise ValueError(f"preco: '{v}' inválido")


def _bool(v: object, field: str) -> bool | None:
    s = _cell(v)
    if s is None:
        return None
    s = _norm(s)
    if s in ("sim", "s", "yes", "y", "true", "1", "x", "verdadeiro"):
        return True
    if s in ("nao", "n", "no", "false", "0", "falso"):
        return False
    raise ValueError(f"{field}: use sim ou não")


def _tech(v: object) -> str | None:
    s = _cell(v)
    if s is None:
        return None
    n = _norm(s)
    if "agm" in n:
        return "AGM"
    if "efb" in n:
        return "EFB"
    if n in ("convencional", "sli", "comum", "selada", "chumbo_acido"):
        return "Convencional"
    raise ValueError(f"tecnologia: '{s}' (use Convencional, EFB ou AGM)")


def _pol(v: object) -> str | None:
    s = _cell(v)
    if s is None:
        return None
    n = _norm(s)
    if n in ("d", "direita", "direito", "positivo_direita", "positivo_direito"):
        return "D"
    if n in ("e", "esquerda", "esquerdo", "positivo_esquerda", "positivo_esquerdo"):
        return "E"
    raise ValueError(f"polaridade: '{s}' (use D ou E)")


def _read(filename: str, data: bytes) -> pd.DataFrame:
    name = filename.lower()
    if name.endswith((".xlsx", ".xlsm")):
        return pd.read_excel(io.BytesIO(data), dtype=str)
    if name.endswith(".csv"):
        for enc in ("utf-8-sig", "latin-1"):
            try:
                return pd.read_csv(io.BytesIO(data), sep=None, engine="python", dtype=str, encoding=enc)
            except UnicodeDecodeError:
                continue
    raise HTTPException(status_code=422, detail="Envie um arquivo .xlsx ou .csv")


@router.get("/import/template")
async def import_template():
    csv = ";".join(COLUMNS) + "\n"
    return Response(
        content=csv.encode("utf-8-sig"),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="modelo-importacao-aplicacoes.csv"'},
    )


@router.post("/import", response_model=ImportReport)
async def import_applications(file: UploadFile = File(...), mark_validated: bool = Form(True)):
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Arquivo acima de 5 MB")
    try:
        df = _read(file.filename or "", data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Não foi possível ler a planilha: {exc}")
    df.columns = [_norm(c) for c in df.columns]
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise HTTPException(status_code=422, detail=f"Colunas obrigatórias ausentes: {', '.join(missing)}")
    if len(df) > MAX_ROWS:
        raise HTTPException(status_code=422, detail=f"Máximo de {MAX_ROWS} linhas por arquivo")

    errors: list[ImportRowError] = []
    batteries: dict[str, dict] = {}  # code -> merged fields from the file
    vehicles: dict[tuple, dict] = {}  # key -> {"vin": dict, "codes": [..]}
    get = lambda r, k: r.get(k) if k in r else None  # noqa: E731

    for idx, r in enumerate(df.to_dict("records")):
        row = idx + 2  # header is row 1
        if all(_cell(v) is None for v in r.values()):
            continue
        try:
            for k in REQUIRED:
                if _cell(get(r, k)) is None:
                    raise ValueError(f"{k} é obrigatório")
            code = _cell(get(r, "codigo_bateria")).upper()
            fields = {
                "brand": _cell(get(r, "marca_bateria")),
                "line": _cell(get(r, "linha")),
                "ah": _int(get(r, "ah"), "ah"),
                "cca": _int(get(r, "cca"), "cca"),
                "technology": _tech(get(r, "tecnologia")),
                "polarity": _pol(get(r, "polaridade")),
                "length_mm": _int(get(r, "comprimento_mm"), "comprimento_mm"),
                "width_mm": _int(get(r, "largura_mm"), "largura_mm"),
                "height_mm": _int(get(r, "altura_mm"), "altura_mm"),
                "price": _price(get(r, "preco")),
                "in_stock": _bool(get(r, "estoque"), "estoque"),
            }
            fields = {k: v for k, v in fields.items() if v is not None}
            ss = _bool(get(r, "start_stop"), "start_stop")
            vin = {
                "make": _cell(get(r, "marca_veiculo")),
                "model": _cell(get(r, "modelo")),
                "engine": _cell(get(r, "motor")),
                "version": _cell(get(r, "versao")) or "",
                "year_from": _int(get(r, "ano_inicial"), "ano_inicial"),
                "year_to": _int(get(r, "ano_final"), "ano_final"),
                "start_stop": bool(ss),
            }
            VehicleIn(**vin)  # validates years etc.
        except (ValueError, ValidationError) as exc:
            msg = exc.errors()[0]["msg"] if isinstance(exc, ValidationError) else str(exc)
            errors.append(ImportRowError(row=row, message=msg))
            continue

        batteries.setdefault(code, {}).update(fields)
        key = (vin["make"].lower(), vin["model"].lower(), vin["engine"].lower(), vin["version"].lower(), vin["year_from"], vin["year_to"])
        entry = vehicles.setdefault(key, {"vin": vin, "codes": [], "row": row})
        entry["vin"]["start_stop"] = entry["vin"]["start_stop"] or vin["start_stop"]
        if code not in entry["codes"]:
            entry["codes"].append(code)

    # --- batteries upsert ---
    code_to_id: dict[str, str] = {}
    b_created = b_updated = 0
    bad_codes: set[str] = set()
    for code, fields in batteries.items():
        existing = await db.batteries.find_one({"code": code}, {"_id": 0})
        try:
            if existing:
                merged = BatteryIn(**{**existing, **fields, "code": code})
                await db.batteries.update_one({"id": existing["id"]}, {"$set": merged.model_dump()})
                code_to_id[code] = existing["id"]
                b_updated += 1
            else:
                if "ah" not in fields:
                    raise ValueError("ah é obrigatório para bateria nova")
                b = Battery(**{"brand": "A confirmar", **fields, "code": code})
                await db.batteries.insert_one(b.model_dump())
                code_to_id[code] = b.id
                b_created += 1
        except (ValueError, ValidationError) as exc:
            msg = exc.errors()[0]["msg"] if isinstance(exc, ValidationError) else str(exc)
            errors.append(ImportRowError(row=0, message=f"Bateria {code}: {msg}"))
            bad_codes.add(code)

    # --- vehicles upsert ---
    v_created = v_updated = 0
    for entry in vehicles.values():
        vin = entry["vin"]
        ids = [code_to_id[c] for c in entry["codes"] if c in code_to_id and c not in bad_codes]
        if not ids:
            errors.append(ImportRowError(row=entry["row"], message="Nenhuma bateria válida para este veículo"))
            continue
        query = {
            "make": {"$regex": f"^{re.escape(vin['make'])}$", "$options": "i"},
            "model": {"$regex": f"^{re.escape(vin['model'])}$", "$options": "i"},
            "engine": {"$regex": f"^{re.escape(vin['engine'])}$", "$options": "i"},
            "version": {"$regex": f"^{re.escape(vin['version'])}$", "$options": "i"},
            "year_from": vin["year_from"],
            "year_to": vin["year_to"],
        }
        existing = await db.vehicles.find_one(query, {"_id": 0})
        if existing:
            body = VehicleIn(**{**existing, **vin, "battery_ids": ids, "validated": mark_validated or existing["validated"]})
            await db.vehicles.update_one({"id": existing["id"]}, {"$set": {**body.model_dump(), "search_text": vehicle_search_text(body)}})
            v_updated += 1
        else:
            body = VehicleIn(**vin, battery_ids=ids, validated=mark_validated)
            v = Vehicle(**body.model_dump())
            await db.vehicles.insert_one({**v.model_dump(), "search_text": vehicle_search_text(body)})
            v_created += 1

    return ImportReport(
        rows_read=len(df),
        batteries_created=b_created,
        batteries_updated=b_updated,
        vehicles_created=v_created,
        vehicles_updated=v_updated,
        errors=errors[:200],
    )


@router.delete("/reference-batteries", response_model=ReferenceCleanup)
async def delete_reference_batteries():
    refs = await db.batteries.find({"code": {"$regex": "^REF-"}}, {"_id": 0, "id": 1, "image_url": 1}).to_list(1000)
    ids = [r["id"] for r in refs]
    for r in refs:
        await delete_image_by_url(r.get("image_url"))
    if ids:
        await db.batteries.delete_many({"id": {"$in": ids}})
        await db.vehicles.update_many({}, {"$pull": {"battery_ids": {"$in": ids}}})
    orphans = await db.vehicles.count_documents({"battery_ids": {"$size": 0}})
    return ReferenceCleanup(batteries_deleted=len(ids), vehicles_without_battery=orphans)
