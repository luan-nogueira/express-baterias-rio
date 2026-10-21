"""Store info (address/hours): public read, admin write. Empty fields stay hidden on the site."""

from fastapi import APIRouter, Depends

from lib.auth import require_admin
from lib.db import db
from models.store import StoreInfo

router = APIRouter(tags=["store"])
STORE_ID = "store"


@router.get("/store", response_model=StoreInfo)
async def get_store():
    doc = await db.settings.find_one({"id": STORE_ID}, {"_id": 0, "id": 0})
    return StoreInfo(**(doc or {}))


@router.put("/admin/store", response_model=StoreInfo, dependencies=[Depends(require_admin)])
async def put_store(body: StoreInfo):
    await db.settings.update_one({"id": STORE_ID}, {"$set": {"id": STORE_ID, **body.model_dump()}}, upsert=True)
    return body
