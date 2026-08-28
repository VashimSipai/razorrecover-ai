import pytest
from app.core.models import Transaction, PolicyConfig
from app.engine.policy_gate import policy_gate

def test_policy_gate_max_retries_block():
    txn = Transaction(
        id="txn_test_limit",
        razorpay_payment_id="pay_limit",
        customer_name="Test",
        customer_email="test@test.com",
        customer_phone="+919999999999",
        amount_paise=100000,
        payment_method="upi",
        error_code="GATEWAY_ERROR",
        attempts_count=3,
        recovery_probability=0.75
    )
    res = policy_gate.evaluate(txn, "smart_retry")
    assert res.approved is False
    assert res.status == "blocked"
    assert "maximum allowed retry attempts" in res.reason

def test_policy_gate_blocked_error_code():
    txn = Transaction(
        id="txn_test_fraud",
        razorpay_payment_id="pay_fraud",
        customer_name="Test",
        customer_email="test@test.com",
        customer_phone="+919999999999",
        amount_paise=100000,
        payment_method="card",
        error_code="BAD_REQUEST_CARD_INVALID",
        attempts_count=0,
        recovery_probability=0.08
    )
    res = policy_gate.evaluate(txn, "smart_retry")
    assert res.approved is False
    assert res.status == "blocked"
    assert "permanently blocked" in res.reason

def test_policy_gate_high_value_hitl():
    txn = Transaction(
        id="txn_test_hv",
        razorpay_payment_id="pay_hv",
        customer_name="Test",
        customer_email="test@test.com",
        customer_phone="+919999999999",
        amount_paise=7500000,  # ₹75,000
        payment_method="card",
        error_code="GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED",
        attempts_count=0,
        recovery_probability=0.60
    )
    res = policy_gate.evaluate(txn, "payment_link", hitl_approved=False)
    assert res.approved is False
    assert res.status == "paused_hitl"
    assert res.requires_hitl is True

    # If approved by human operator
    res_approved = policy_gate.evaluate(txn, "payment_link", hitl_approved=True)
    assert res_approved.approved is True
    assert res_approved.status == "approved"
