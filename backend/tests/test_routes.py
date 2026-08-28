import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db

@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["circuit_breaker"] == "active"

@pytest.mark.asyncio
async def test_get_policies_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/policies")
        assert response.status_code in [200, 404]

@pytest.mark.asyncio
async def test_simulate_and_recover_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "customer_name": "Kavita Rao",
            "customer_email": "kavita.rao@example.com",
            "customer_phone": "+919876512345",
            "amount_inr": 1500.0,
            "payment_method": "upi",
            "error_code": "BAD_REQUEST_PAYMENT_TIMED_OUT",
            "auto_recover": True
        }
        response = await client.post("/api/simulate/failure", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "transaction_id" in data
        assert data["recovery"] is not None
        assert data["recovery"]["strategy"] == "smart_retry"

@pytest.mark.asyncio
async def test_approvals_list_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/approvals")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
