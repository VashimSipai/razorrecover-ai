import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.data.benchmark_eval import evaluator
from app.core.database import init_db

def test_benchmark_evaluator_metrics():
    # Run small evaluation batch of 100
    eval_mini = evaluator.__class__(count=100, seed=42)
    res = eval_mini.run_benchmark()
    
    assert res["sample_size"] == 100
    assert "metrics" in res
    metrics = res["metrics"]
    
    assert metrics["total_revenue_at_risk_inr"] > 0
    assert metrics["total_revenue_recovered_inr"] > 0
    assert 0.0 <= metrics["net_recovery_rate_percent"] <= 100.0
    assert 0.0 <= metrics["precision_percent"] <= 100.0
    assert 0.0 <= metrics["false_intervention_rate_percent"] <= 100.0
    assert "category_breakdown" in res
    assert "strategy_breakdown" in res

@pytest.mark.asyncio
async def test_analytics_dashboard_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/analytics/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "revenue_at_risk_inr" in data
        assert "revenue_recovered_inr" in data
        assert "recovery_rate_percent" in data
        assert "pending_hitl_count" in data

@pytest.mark.asyncio
async def test_analytics_funnel_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/analytics/funnel")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert data[0]["stage"] == "Payment Failures Ingested"

@pytest.mark.asyncio
async def test_compliance_export_csv_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/analytics/compliance/export?format=csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        content = response.text
        assert "Audit ID" in content
        assert "Transaction ID" in content
