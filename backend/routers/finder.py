"""Public battery finder: cascading make → model → year → version, free-text search, result."""

import re

from fastapi import APIRouter, HTTPException, Query

from lib.db import db
from models.catalog import Battery, FinderResult, Vehicle

router = APIRouter(prefix="/finder", tags=["finder"])


def _ci(value: str) -> dict:
    return {"$regex": f"^{re.escape(value.strip())}$", "$options": "i"}


@router.get("/makes", response_model=list[str])
async def makes():
    values = await db.vehicles.distinct("make")
    return sorted(values, key=str.lower)


@router.get("/models", response_model=list[str])
async def models(make: str = Query(min_length=1)):
    values = await db.vehicles.distinct("model", {"make": _ci(make)})
    return sorted(values, key=str.lower)


@router.get("/years", response_model=list[int])
async def years(make: str = Query(min_length=1), model: str = Query(min_length=1)):
    docs = await db.vehicles.find({"make": _ci(make), "model": _ci(model)}, {"year_from": 1, "year_to": 1}).to_list(500)
    found: set[int] = set()
    for d in docs:
        found.update(range(d["year_from"], d["year_to"] + 1))
    return sorted(found, reverse=True)


@router.get("/versions", response_model=list[Vehicle])
async def versions(make: str = Query(min_length=1), model: str = Query(min_length=1), year: int = Query(ge=1950, le=2100)):
    docs = await db.vehicles.find(
        {"make": _ci(make), "model": _ci(model), "year_from": {"$lte": year}, "year_to": {"$gte": year}}, {"_id": 0}
    ).to_list(200)
    return [Vehicle(**d) for d in sorted(docs, key=lambda d: (d["engine"], d.get("version", "")))]


@router.get("/search", response_model=list[Vehicle])
async def search(q: str = Query(min_length=1, max_length=80)):
    tokens = [t for t in re.split(r"\s+", q.lower().strip()) if t]
    clauses: list[dict] = []
    for t in tokens:
        if re.fullmatch(r"(19|20)\d{2}", t):
            y = int(t)
            clauses += [{"year_from": {"$lte": y}}, {"year_to": {"$gte": y}}]
        else:
            clauses.append({"search_text": {"$regex": re.escape(t)}})
    if not clauses:
        return []
    docs = await db.vehicles.find({"$and": clauses}, {"_id": 0}).sort([("make", 1), ("model", 1)]).to_list(20)
    return [Vehicle(**d) for d in docs]


@router.get("/popular", response_model=list[Vehicle])
async def popular():
    docs = await db.vehicles.find({"popular": True}, {"_id": 0}).sort([("make", 1), ("model", 1)]).to_list(30)
    # one entry per model so the chips stay distinct
    seen: set[tuple[str, str]] = set()
    out: list[Vehicle] = []
    for d in docs:
        key = (d["make"], d["model"])
        if key not in seen:
            seen.add(key)
            out.append(Vehicle(**d))
    return out


@router.get("/result/{vehicle_id}", response_model=FinderResult)
async def result(vehicle_id: str):
    doc = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Veículo não encontrado no catálogo")
    vehicle = Vehicle(**doc)
    batteries: list[Battery] = []
    if vehicle.battery_ids:
        bdocs = await db.batteries.find({"id": {"$in": vehicle.battery_ids}}, {"_id": 0}).to_list(50)
        by_id = {b["id"]: b for b in bdocs}
        batteries = [Battery(**by_id[i]) for i in vehicle.battery_ids if i in by_id]
    return FinderResult(vehicle=vehicle, batteries=batteries)
