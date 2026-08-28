import pytest
from app.data.synthetic_generator import generate_synthetic_transactions, load_taxonomy

def test_load_taxonomy_structure():
    tax = load_taxonomy()
    assert "categories" in tax
    categories = tax["categories"]
    
    expected_categories = ["TRANSIENT", "SOFT_DECLINE", "AUTHENTICATION_FAILURE", "HARD_DECLINE", "MANDATE_FAILURE"]
    for cat in expected_categories:
        assert cat in categories
        cat_data = categories[cat]
        assert "name" in cat_data
        assert "description" in cat_data
        assert "codes" in cat_data
        assert "retry_safe" in cat_data
        assert "base_recovery_probability" in cat_data
        assert 0.0 <= cat_data["base_recovery_probability"] <= 1.0
        assert len(cat_data["codes"]) > 0

def test_generate_synthetic_transactions_count():
    count = 100
    transactions = generate_synthetic_transactions(count=count, seed=123)
    assert len(transactions) == count
    
    # Check schema on sample
    sample = transactions[0]
    required_keys = [
        "id", "razorpay_payment_id", "customer_name", "customer_email",
        "customer_phone", "amount_paise", "currency", "payment_method",
        "status", "error_code", "error_source", "failure_category",
        "recovery_probability", "optimal_strategy", "original_failure_at"
    ]
    for key in required_keys:
        assert key in sample
        
    assert sample["status"] == "failed"
    assert sample["amount_paise"] > 0
    assert 0.0 <= sample["recovery_probability"] <= 1.0

def test_synthetic_indian_payment_methods():
    transactions = generate_synthetic_transactions(count=500, seed=42)
    methods = {t["payment_method"] for t in transactions}
    assert "upi" in methods
    assert "card" in methods
    assert "mandate" in methods
    
    # Verify high value HITL cases exist (> ₹50,000 / 5,000,000 paise)
    high_value = [t for t in transactions if t["amount_paise"] >= 5000000]
    assert len(high_value) > 0
