import pytest
import asyncio
from app.engine.circuit_breaker import circuit_breaker
from app.engine.graph import recovery_graph

@pytest.mark.asyncio
async def test_langgraph_primary_execution():
    payload = {
        "transaction_id": "txn_test_001",
        "razorpay_payment_id": "pay_test_001",
        "customer_name": "Priya Sharma",
        "customer_email": "priya@example.com",
        "customer_phone": "+919876543210",
        "amount_paise": 250000,
        "payment_method": "upi",
        "error_code": "BAD_REQUEST_PAYMENT_TIMED_OUT",
        "error_source": "gateway",
        "attempt_count": 0,
        "hours_since_failure": 1.0
    }
    
    result, engine = await circuit_breaker.execute_recovery(payload, thread_id="thread_test_001")
    assert engine == "langgraph_primary"
    assert result["failure_category"] == "transient"
    assert result["recovery_probability"] > 0.70
    assert result["policy_approved"] is True
    assert result["action_status"] == "scheduled"
    assert result["proposed_strategy"] == "smart_retry"
    assert len(result["audit_trace"]) >= 4

@pytest.mark.asyncio
async def test_high_value_hitl_pause_in_graph():
    # Transaction > ₹50,000 (5,000,000 paise)
    payload = {
        "transaction_id": "txn_high_value_001",
        "razorpay_payment_id": "pay_hv_001",
        "customer_name": "Vikram Singhania",
        "customer_email": "vikram@enterprise.in",
        "customer_phone": "+919876500000",
        "amount_paise": 7500000,  # ₹75,000
        "payment_method": "card",
        "error_code": "GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED",
        "error_source": "customer",
        "attempt_count": 0,
        "hours_since_failure": 2.0
    }
    
    result, engine = await circuit_breaker.execute_recovery(payload, thread_id="thread_hv_001")
    assert result["requires_hitl"] is True
    assert result["policy_result"] == "paused_hitl"
    assert result["policy_approved"] is False
