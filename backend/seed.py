"""Idempotent seed: reference batteries + popular vehicles (ALL marked validated=False).

These specs are typical market references for each application and MUST be checked by the
Express team in /admin before being marked as validated. Run: cd /app/backend && python seed.py
"""

import asyncio

from lib.auth import ensure_admin_user
from lib.db import db, ensure_indexes
from models.catalog import Battery, Vehicle, VehicleIn, vehicle_search_text

NOTE = "Especificação de referência — aguardando validação técnica da equipe Express."

BATTERIES = [
    # code, ah, cca, tech, polarity, L, W, H
    ("REF-40D", 40, 300, "Convencional", "D", 207, 175, 175),
    ("REF-45D", 45, 330, "Convencional", "D", 212, 175, 175),
    ("REF-50D", 50, 380, "Convencional", "D", 212, 175, 175),
    ("REF-60D", 60, 420, "Convencional", "D", 242, 175, 175),
    ("REF-60E", 60, 420, "Convencional", "E", 242, 175, 175),
    ("REF-60EFB", 60, 520, "EFB", "D", 242, 175, 175),
    ("REF-70D", 70, 480, "Convencional", "D", 278, 175, 175),
    ("REF-70EFB", 70, 640, "EFB", "D", 278, 175, 190),
    ("REF-80AGM", 80, 800, "AGM", "D", 315, 175, 190),
    ("REF-90D", 90, 650, "Convencional", "D", 353, 175, 175),
    ("REF-100D", 100, 750, "Convencional", "D", 330, 172, 240),
]

# make, model, engine, version, from, to, start_stop, [battery codes], popular
VEHICLES = [
    ("Chevrolet", "Onix", "1.0 Flex", "Aspirado", 2020, 2025, False, ["REF-50D", "REF-60D"], True),
    ("Chevrolet", "Onix", "1.0 Turbo Flex", "Turbo", 2020, 2025, False, ["REF-60D"], True),
    ("Chevrolet", "Onix", "1.4 Flex", "", 2013, 2019, False, ["REF-50D", "REF-60D"], True),
    ("Chevrolet", "Tracker", "1.0 Turbo Flex", "", 2021, 2025, False, ["REF-60D"], False),
    ("Chevrolet", "S10", "2.8 Diesel", "", 2012, 2025, False, ["REF-90D", "REF-100D"], False),
    ("Hyundai", "HB20", "1.0 Flex", "Aspirado", 2013, 2025, False, ["REF-50D", "REF-60D"], True),
    ("Hyundai", "HB20", "1.0 Turbo Flex", "TGDI", 2020, 2025, False, ["REF-60D"], True),
    ("Hyundai", "Creta", "1.0 Turbo Flex", "", 2022, 2025, False, ["REF-60D"], False),
    ("Fiat", "Mobi", "1.0 Flex", "", 2017, 2025, False, ["REF-40D", "REF-45D"], False),
    ("Fiat", "Argo", "1.0 Flex", "", 2018, 2025, False, ["REF-50D"], True),
    ("Fiat", "Strada", "1.3 Flex", "", 2021, 2025, False, ["REF-50D", "REF-60D"], True),
    ("Fiat", "Toro", "2.0 Diesel", "", 2016, 2025, False, ["REF-70D", "REF-90D"], False),
    ("Volkswagen", "Gol", "1.0 Flex", "", 2009, 2023, False, ["REF-45D", "REF-50D"], True),
    ("Volkswagen", "Polo", "1.0 TSI Flex", "Start-Stop", 2018, 2025, True, ["REF-60EFB"], True),
    ("Volkswagen", "T-Cross", "1.0 TSI Flex", "Start-Stop", 2020, 2025, True, ["REF-60EFB", "REF-70EFB"], True),
    ("Volkswagen", "Nivus", "1.0 TSI Flex", "Start-Stop", 2021, 2025, True, ["REF-60EFB"], False),
    ("Renault", "Kwid", "1.0 Flex", "", 2018, 2025, False, ["REF-40D"], True),
    ("Renault", "Sandero", "1.0 Flex", "", 2015, 2022, False, ["REF-50D"], False),
    ("Toyota", "Corolla", "2.0 Flex", "", 2020, 2025, False, ["REF-60D"], True),
    ("Toyota", "Corolla Cross", "2.0 Flex", "", 2021, 2025, False, ["REF-60D"], False),
    ("Toyota", "Hilux", "2.8 Diesel", "", 2016, 2025, False, ["REF-90D", "REF-100D"], False),
    ("Honda", "Civic", "2.0 Flex", "", 2017, 2021, False, ["REF-60D"], False),
    ("Honda", "HR-V", "1.8 Flex", "", 2016, 2021, False, ["REF-50D", "REF-60D"], True),
    ("Jeep", "Renegade", "1.3 Turbo Flex", "T270", 2022, 2025, True, ["REF-70EFB"], True),
    ("Jeep", "Compass", "1.3 Turbo Flex", "T270", 2022, 2025, True, ["REF-70EFB", "REF-80AGM"], True),
    ("Jeep", "Compass", "2.0 Diesel", "", 2017, 2025, True, ["REF-80AGM"], False),
    ("Nissan", "Kicks", "1.6 Flex", "", 2017, 2025, False, ["REF-50D", "REF-60D"], True),
    ("Ford", "Ranger", "3.2 Diesel", "", 2013, 2023, False, ["REF-100D"], False),
    ("Ford", "Territory", "1.5 Turbo", "", 2021, 2025, True, ["REF-70EFB"], False),
]


async def main() -> None:
    await ensure_indexes()
    await ensure_admin_user()
    code_to_id: dict[str, str] = {}
    for code, ah, cca, tech, pol, l, w, h in BATTERIES:
        existing = await db.batteries.find_one({"code": code})
        if existing:
            code_to_id[code] = existing["id"]
            continue
        b = Battery(
            code=code, brand="A confirmar", line=f"{tech} {ah}Ah", ah=ah, cca=cca, technology=tech, polarity=pol,
            length_mm=l, width_mm=w, height_mm=h, notes=NOTE,
        )
        await db.batteries.insert_one(b.model_dump())
        code_to_id[code] = b.id

    created = 0
    for make, model, engine, version, y0, y1, ss, codes, popular in VEHICLES:
        if await db.vehicles.find_one({"make": make, "model": model, "engine": engine, "year_from": y0}):
            continue
        vin = VehicleIn(
            make=make, model=model, engine=engine, version=version, year_from=y0, year_to=y1, start_stop=ss,
            battery_ids=[code_to_id[c] for c in codes], validated=False, popular=popular, notes=NOTE,
        )
        v = Vehicle(**vin.model_dump())
        await db.vehicles.insert_one({**v.model_dump(), "search_text": vehicle_search_text(vin)})
        created += 1
    print(f"batteries={len(code_to_id)} vehicles_created={created}")


if __name__ == "__main__":
    asyncio.run(main())
