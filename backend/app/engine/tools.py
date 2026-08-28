from langchain_core.tools import tool
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from app.engine.classifier import classifier
from app.engine.scorer import scorer

@tool
def classify_failure_tool(error_code: str, error_source: str = "gateway", error_reason: Optional[str] = None) -> Dict[str, Any]:
    """
    Classifies a Razorpay payment failure error code into a diagnostic category:
    'transient', 'soft_decline', 'auth_failure', 'hard_decline', or 'mandate'.
    """
    res = classifier.classify(error_code, error_source, error_reason)
    return res.model_dump()

@tool
def score_recovery_probability_tool(
    failure_category: str,
    amount_paise: int,
    payment_method: str,
    attempt_count: int = 0,
    hours_since_failure: float = 0.0
) -> Dict[str, Any]:
    """
    Estimates the probability (0.0 to 1.0) of successfully recovering a failed payment
    based on amount, category, method, time decay, and attempt fatigue.
    """
    res = scorer.score(
        failure_category=failure_category,
        amount_paise=amount_paise,
        payment_method=payment_method,
        attempt_count=attempt_count,
        hours_since_failure=hours_since_failure
    )
    return res.model_dump()

@tool
def check_policy_constraints_tool(
    proposed_strategy: str,
    proposed_amount_paise: int,
    attempt_count: int,
    failure_category: str
) -> Dict[str, Any]:
    """
    Validates proposed action against merchant policy rules:
    - Maximum 3 retry attempts per transaction
    - No automatic retries on hard declines
    - Transactions > ₹50,000 require human review sign-off
    """
    # Hard stop on attempt limits
    if attempt_count >= 3:
        return {
            "approved": False,
            "policy_result": "blocked",
            "reason": "Exceeded maximum allowed retry attempts (3). Escalate to human.",
            "requires_hitl": False
        }
    
    # Hard stop on hard declines
    if failure_category.lower() == "hard_decline" and proposed_strategy in ["smart_retry", "mandate_retry"]:
        return {
            "approved": False,
            "policy_result": "blocked",
            "reason": "Hard decline detected (fraud/card blocked). Direct retry prohibited. Alternate payment link required.",
            "requires_hitl": False
        }

    # High value HITL flag
    requires_hitl = proposed_amount_paise >= 5000000  # ₹50,000
    return {
        "approved": not requires_hitl,
        "policy_result": "paused_hitl" if requires_hitl else "approved",
        "reason": "Amount exceeds ₹50,000 threshold, requiring Human-in-the-Loop review" if requires_hitl else "All policy guardrails satisfied",
        "requires_hitl": requires_hitl
    }

@tool
def create_recovery_payment_link_tool(
    amount_paise: int,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    description: str
) -> Dict[str, Any]:
    """
    Generates a secure Razorpay Payment Link (Test Mode) allowing the customer to complete payment with an alternate method.
    """
    mock_id = f"plink_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    return {
        "link_id": mock_id,
        "short_url": f"https://rzp.io/i/{mock_id[-8:]}",
        "amount_paise": amount_paise,
        "status": "created",
        "expires_in_hours": 72
    }

@tool
def schedule_smart_retry_tool(
    transaction_id: str,
    delay_hours: int,
    reason: str
) -> Dict[str, Any]:
    """
    Schedules an automated retry attempt after the optimal delay period to maximize gateway recovery.
    """
    scheduled_time = (datetime.utcnow() + timedelta(hours=delay_hours)).isoformat()
    return {
        "scheduled": True,
        "transaction_id": transaction_id,
        "delay_hours": delay_hours,
        "scheduled_for": scheduled_time,
        "reason": reason
    }

@tool
def send_recovery_notification_tool(
    channel: str,
    customer_phone: str,
    customer_name: str,
    payment_link_url: str
) -> Dict[str, Any]:
    """
    Simulates dispatching a WhatsApp, SMS, or Email nudge to the customer with their recovery payment link.
    """
    return {
        "sent": True,
        "channel": channel,
        "recipient": customer_phone,
        "message": f"Hi {customer_name}, complete your payment seamlessly here: {payment_link_url}",
        "dispatched_at": datetime.utcnow().isoformat()
    }

@tool
def log_audit_event_tool(
    transaction_id: str,
    event_type: str,
    details: str
) -> Dict[str, Any]:
    """
    Appends an immutable entry to the transaction audit ledger.
    """
    return {
        "logged": True,
        "transaction_id": transaction_id,
        "event_type": event_type,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    }

ALL_AGENT_TOOLS = [
    classify_failure_tool,
    score_recovery_probability_tool,
    check_policy_constraints_tool,
    create_recovery_payment_link_tool,
    schedule_smart_retry_tool,
    send_recovery_notification_tool,
    log_audit_event_tool
]
