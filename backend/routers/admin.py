"""Admin-only catalog management (batteries, vehicles/applications) and quote inbox."""

from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import require_admin
from lib.db import db
from models.catalog import Battery, BatteryIn, Vehicle, VehicleIn, vehicle_search_text
from models.quote import Quote, QuoteStatusUpdate

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# ---------- batteries ----------
@router.get("/batteries", response_model=list[Battery])
async def list_batteries():
    docs = await db.batteries.find({}, {"_id": 0}).sort([("ah", 1), ("code", 1)]).to_list(1000)
    return [Battery(**d) for d in docs]


@router.post("/batteries", response_model=Battery, status_code=201)
async def create_battery(body: BatteryIn):
    if await db.batteries.find_one({"code": body.code}):
        raise HTTPException(status_code=409, detail="Já existe uma bateria com esse código")
    battery = Battery(**body.model_dump())
    await db.batteries.insert_one(battery.model_dump())
    return battery


@router.put("/batteries/{battery_id}", response_model=Battery)
async def update_battery(battery_id: str, body: BatteryIn):
    clash = await db.batteries.find_one({"code": body.code, "id": {"$ne": battery_id}})
    if clash:
        raise HTTPException(status_code=409, detail="Já existe uma bateria com esse código")
    res = await db.batteries.update_one({"id": battery_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bateria não encontrada")
    return Battery(id=battery_id, **body.model_dump())


@router.delete("/batteries/{battery_id}")
async def delete_battery(battery_id: str):
    res = await db.batteries.delete_one({"id": battery_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bateria não encontrada")
    await db.vehicles.update_many({}, {"$pull": {"battery_ids": battery_id}})
    return {"ok": True}


# ---------- vehicles / applications ----------
@router.get("/vehicles", response_model=list[Vehicle])
async def list_vehicles():
    docs = await db.vehicles.find({}, {"_id": 0}).sort([("make", 1), ("model", 1), ("year_from", 1)]).to_list(5000)
    return [Vehicle(**d) for d in docs]


@router.post("/vehicles", response_model=Vehicle, status_code=201)
async def create_vehicle(body: VehicleIn):
    vehicle = Vehicle(**body.model_dump())
    await db.vehicles.insert_one({**vehicle.model_dump(), "search_text": vehicle_search_text(body)})
    return vehicle


@router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, body: VehicleIn):
    res = await db.vehicles.update_one(
        {"id": vehicle_id}, {"$set": {**body.model_dump(), "search_text": vehicle_search_text(body)}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return Vehicle(id=vehicle_id, **body.model_dump())


@router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    res = await db.vehicles.delete_one({"id": vehicle_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return {"ok": True}


# ---------- quotes ----------
@router.get("/quotes", response_model=list[Quote])
async def list_quotes():
    docs = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if d["created_at"].tzinfo is None:
            d["created_at"] = d["created_at"].replace(tzinfo=timezone.utc)
    return [Quote(**d) for d in docs]


@router.patch("/quotes/{quote_id}", response_model=Quote)
async def update_quote(quote_id: str, body: QuoteStatusUpdate):
    res = await db.quotes.update_one({"id": quote_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    doc = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if doc["created_at"].tzinfo is None:
        doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
    return Quote(**doc)
