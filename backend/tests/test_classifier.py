import pytest
from app.engine.classifier import classifier

def test_classify_transient_error():
    result = classifier.classify("BAD_REQUEST_PAYMENT_TIMED_OUT", "gateway")
    assert result.category == "transient"
    assert result.retry_safe is True
    assert result.error_severity in ["low", "medium"]

def test_classify_soft_decline():
    result = classifier.classify("GATEWAY_ERROR_INSUFFICIENT_FUNDS", "customer")
    assert result.category == "soft_decline"
    assert result.retry_safe is True

def test_classify_auth_failure():
    result = classifier.classify("AUTHENTICATION_FAILED_3DS", "customer")
    assert result.category == "auth_failure"
    assert result.retry_safe is False

def test_classify_hard_decline():
    result = classifier.classify("GATEWAY_ERROR_CARD_BLOCKED", "customer")
    assert result.category == "hard_decline"
    assert result.retry_safe is False
    assert result.error_severity == "high"

def test_classify_mandate_failure():
    result = classifier.classify("MANDATE_EXECUTION_FAILED", "gateway")
    assert result.category == "mandate"
    assert result.retry_safe is True

def test_classify_unmapped_heuristic_fallback():
    result = classifier.classify("CUSTOM_BANK_504_TIMEOUT_ERROR", "gateway")
    assert result.category == "transient"
    assert result.retry_safe is True
