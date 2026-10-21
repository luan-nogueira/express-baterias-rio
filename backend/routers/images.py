"""Battery product photos: uploaded through /admin, re-encoded to WebP and stored in Mongo."""

import io
import uuid
from datetime import datetime, timezone

from bson import Binary
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image, ImageOps, UnidentifiedImageError

from lib.auth import require_admin
from lib.db import db
from models.catalog import Battery

router = APIRouter(tags=["images"])
MAX_BYTES = 10 * 1024 * 1024
MAX_SIDE = 1000
PREFIX = "/api/images/"


async def delete_image_by_url(url: str | None) -> None:
    if url and url.startswith(PREFIX):
        await db.images.delete_one({"id": url.removeprefix(PREFIX)})


@router.get("/images/{image_id}")
async def get_image(image_id: str):
    doc = await db.images.find_one({"id": image_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Imagem não encontrada")
    return Response(
        content=bytes(doc["data"]),
        media_type=doc.get("content_type", "image/webp"),
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@router.post("/admin/batteries/{battery_id}/image", response_model=Battery, dependencies=[Depends(require_admin)])
async def upload_battery_image(battery_id: str, file: UploadFile = File(...)):
    battery = await db.batteries.find_one({"id": battery_id}, {"_id": 0})
    if not battery:
        raise HTTPException(status_code=404, detail="Bateria não encontrada")
    raw = await file.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Imagem acima de 10 MB")
    try:
        img = ImageOps.exif_transpose(Image.open(io.BytesIO(raw)))
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=422, detail="Formato de imagem não suportado (use JPG, PNG ou WebP)")
    img = img.convert("RGBA") if img.mode in ("RGBA", "LA", "P") else img.convert("RGB")
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, "WEBP", quality=80, method=4)

    image_id = str(uuid.uuid4())
    await db.images.insert_one(
        {"id": image_id, "content_type": "image/webp", "data": Binary(out.getvalue()), "created_at": datetime.now(timezone.utc)}
    )
    await delete_image_by_url(battery.get("image_url"))
    url = f"{PREFIX}{image_id}"
    await db.batteries.update_one({"id": battery_id}, {"$set": {"image_url": url}})
    battery["image_url"] = url
    return Battery(**battery)


@router.delete("/admin/batteries/{battery_id}/image", response_model=Battery, dependencies=[Depends(require_admin)])
async def delete_battery_image(battery_id: str):
    battery = await db.batteries.find_one({"id": battery_id}, {"_id": 0})
    if not battery:
        raise HTTPException(status_code=404, detail="Bateria não encontrada")
    await delete_image_by_url(battery.get("image_url"))
    await db.batteries.update_one({"id": battery_id}, {"$set": {"image_url": None}})
    battery["image_url"] = None
    return Battery(**battery)
