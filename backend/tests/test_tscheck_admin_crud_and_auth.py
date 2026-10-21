"""Admin auth + CRUD on battery/vehicle, validation toggle, quote status change.

Covers: login success/failure, session cookie auth on /admin/* routes, create/update/delete
battery, create/update(validated toggle)/delete vehicle, and quote status patch.
"""

import os
from pathlib import Path

import httpx
import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

ADMIN_EMAIL = "admin@expressbateriasrio.com.br"
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]


@pytest.fixture
def admin_client():
    with httpx.Client(base_url="http://localhost:8001/api", timeout=30.0) as c:
        resp = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200, resp.text
        # cookie is marked Secure; httpx won't auto-forward it over plain http, so set it manually
        token = resp.cookies.get("ebr_session")
        c.cookies.set("ebr_session", token)
        yield c


def test_login_wrong_password_rejected(client):
    resp = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass-123"})
    assert resp.status_code == 401, resp.text


def test_login_success_and_me(admin_client):
    resp = admin_client.get("/auth/me")
    assert resp.status_code == 200, resp.text
    assert resp.json()["email"] == ADMIN_EMAIL


def test_admin_routes_require_auth(client):
    resp = client.get("/admin/batteries")
    assert resp.status_code in (401, 403), resp.text


def test_battery_crud(admin_client):
    code = "tscheck-batt-001"
    create = admin_client.post(
        "/admin/batteries",
        json={"code": code, "ah": 60, "cca": 500, "technology": "EFB", "polarity": "D"},
    )
    assert create.status_code == 201, create.text
    battery_id = create.json()["id"]

    update = admin_client.put(
        f"/admin/batteries/{battery_id}",
        json={"code": code, "ah": 65, "cca": 520, "technology": "EFB", "polarity": "D"},
    )
    assert update.status_code == 200, update.text
    assert update.json()["ah"] == 65

    listing = admin_client.get("/admin/batteries")
    assert any(b["id"] == battery_id for b in listing.json())

    delete = admin_client.delete(f"/admin/batteries/{battery_id}")
    assert delete.status_code == 200, delete.text

    listing_after = admin_client.get("/admin/batteries")
    assert not any(b["id"] == battery_id for b in listing_after.json())


def test_vehicle_crud_and_validation_toggle(admin_client):
    create = admin_client.post(
        "/admin/vehicles",
        json={
            "make": "tscheck-Make",
            "model": "tscheck-Model",
            "engine": "1.0",
            "year_from": 2020,
            "year_to": 2024,
            "validated": False,
        },
    )
    assert create.status_code == 201, create.text
    vehicle_id = create.json()["id"]
    assert create.json()["validated"] is False

    toggle = admin_client.put(
        f"/admin/vehicles/{vehicle_id}",
        json={
            "make": "tscheck-Make",
            "model": "tscheck-Model",
            "engine": "1.0",
            "year_from": 2020,
            "year_to": 2024,
            "validated": True,
        },
    )
    assert toggle.status_code == 200, toggle.text
    assert toggle.json()["validated"] is True

    # public finder result should reflect validated=True
    result = admin_client.get(f"/finder/result/{vehicle_id}")
    assert result.status_code == 200, result.text
    assert result.json()["vehicle"]["validated"] is True

    delete = admin_client.delete(f"/admin/vehicles/{vehicle_id}")
    assert delete.status_code == 200, delete.text


def test_quote_status_change(admin_client):
    create = admin_client.post(
        "/quotes",
        json={
            "name": "tscheck-status QA",
            "phone": "21988887777",
            "vehicle": "Fiat Argo",
            "neighborhood": "tscheck-bairro2",
            "need": "Bateria nova",
        },
    )
    assert create.status_code == 201, create.text
    quote_id = create.json()["id"]

    patch = admin_client.patch(f"/admin/quotes/{quote_id}", json={"status": "em_atendimento"})
    assert patch.status_code == 200, patch.text
    assert patch.json()["status"] == "em_atendimento"

    listing = admin_client.get("/admin/quotes")
    assert any(q["id"] == quote_id and q["status"] == "em_atendimento" for q in listing.json())
