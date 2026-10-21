"""Quote form submission: POST /api/quotes happy path + validation failure."""


def test_create_quote_success(client):
    payload = {
        "name": "tscheck-quote QA",
        "phone": "21999998888",
        "vehicle": "Chevrolet Onix 2022",
        "neighborhood": "tscheck-bairro",
        "need": "Troca de bateria",
        "message": "tscheck automated test",
        "source": "site",
    }
    resp = client.post("/quotes", json=payload)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["name"] == payload["name"]
    assert body["status"] == "novo"
    assert "id" in body


def test_create_quote_validation_error():
    import httpx

    with httpx.Client(base_url="http://localhost:8001/api", timeout=30.0) as c:
        resp = c.post("/quotes", json={"name": "a", "phone": "123", "vehicle": "", "neighborhood": "", "need": ""})
    assert resp.status_code == 422, resp.text
