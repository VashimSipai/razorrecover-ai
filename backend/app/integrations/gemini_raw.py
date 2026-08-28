import json
import logging
from typing import Dict, Any
from app.engine.classifier import classifier
from app.engine.scorer import scorer

logger = logging.getLogger(__name__)

async def raw_gemini_recovery_fallback(state_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Zero-dependency direct fallback engine:
    Diagnoses, scores, applies policy rules, and determines strategy without graph overhead.
    """
    logger.info(f"Executing raw recovery fallback for {state_payload.get('transaction_id')}")
    
    error_code = state_payload.get("error_code", "GATEWAY_ERROR")
    error_source = state_payload.get("error_source", "gateway")
    error_reason = state_payload.get("error_reason")
    amount_paise = state_payload.get("amount_paise", 10000)
    payment_method = state_payload.get("payment_method", "upi")
    attempt_count = state_payload.get("attempt_count", 0)
    
    # 1. Classify
    diag = classifier.classify(error_code, error_source, error_reason)
    
    # 2. Score
    score_res = scorer.score(
        failure_category=diag.category,
        amount_paise=amount_paise,
        payment_method=payment_method,
        attempt_count=attempt_count
    )
    
    # 3. Strategy
    if diag.category == "transient":
        strategy = "smart_retry"
    elif diag.category == "hard_decline":
        strategy = "escalation"
    else:
        strategy = "payment_link"
        
    # 4. Policy Gate
    requires_hitl = amount_paise >= 5000000
    if attempt_count >= 3:
        policy_res = "blocked"
        approved = False
    elif diag.category == "hard_decline" and strategy == "smart_retry":
        policy_res = "blocked"
        approved = False
    elif requires_hitl:
        policy_res = "paused_hitl"
        approved = False
    else:
        policy_res = "approved"
        approved = True
        
    # 5. Dispatch
    if approved:
        resource_id = f"plink_fallback_{state_payload.get('transaction_id', '0')[-6:]}"
        payment_url = f"https://rzp.io/i/{state_payload.get('transaction_id', '0')[-6:]}"
        action_status = "executed"
    else:
        resource_id = None
        payment_url = None
        action_status = policy_res

    return {
        "failure_category": diag.category,
        "recovery_probability": score_res.probability,
        "proposed_strategy": strategy,
        "policy_approved": approved,
        "policy_result": policy_res,
        "requires_hitl": requires_hitl,
        "executed_resource_id": resource_id,
        "payment_url": payment_url,
        "action_status": action_status,
        "execution_engine": "raw_gemini_fallback",
        "agent_reasoning": f"[Fallback Engine] {diag.root_cause_summary}. Strategy: {strategy}.",
        "audit_trace": [
            {"node": "fallback_classifier", "category": diag.category},
            {"node": "fallback_policy", "result": policy_res}
        ]
    }
