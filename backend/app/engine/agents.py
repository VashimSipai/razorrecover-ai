import os
import json
from datetime import datetime
from typing import Dict, Any
from langchain_core.messages import HumanMessage, AIMessage
from app.engine.state import RecoveryState
from app.engine.classifier import classifier
from app.engine.scorer import scorer
from app.core.config import settings

def classifier_node(state: RecoveryState) -> Dict[str, Any]:
    """Node 1: Diagnoses root cause and maps failure category."""
    diag = classifier.classify(
        error_code=state["error_code"],
        error_source=state.get("error_source", "gateway"),
        error_reason=state.get("error_reason")
    )
    
    audit_entry = {
        "node": "classifier",
        "category": diag.category,
        "retry_safe": diag.retry_safe,
        "summary": diag.root_cause_summary,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    current_trace = list(state.get("audit_trace", []))
    current_trace.append(audit_entry)
    
    return {
        "failure_category": diag.category,
        "audit_trace": current_trace
    }

def scorer_node(state: RecoveryState) -> Dict[str, Any]:
    """Node 2: Computes multi-factor recovery probability score."""
    score_res = scorer.score(
        failure_category=state["failure_category"],
        amount_paise=state["amount_paise"],
        payment_method=state["payment_method"],
        attempt_count=state.get("attempt_count", 0),
        hours_since_failure=state.get("hours_since_failure", 0.0)
    )
    
    audit_entry = {
        "node": "scorer",
        "probability": score_res.probability,
        "confidence": score_res.confidence,
        "factors": score_res.key_factors,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    current_trace = list(state.get("audit_trace", []))
    current_trace.append(audit_entry)
    
    return {
        "recovery_probability": score_res.probability,
        "probability_factors": score_res.key_factors,
        "audit_trace": current_trace
    }

def strategist_node(state: RecoveryState) -> Dict[str, Any]:
    """Node 3: Formulates the optimal recovery strategy and reasoning."""
    cat = state["failure_category"]
    prob = state["recovery_probability"]
    amt_inr = state["amount_paise"] / 100.0
    attempts = state.get("attempt_count", 0)
    
    # AI Reasoning Logic (Context-Aware Rule-Guided Selection)
    if cat == "transient":
        strategy = "smart_retry"
        delay = 4
        reasoning = (
            f"Transient gateway timeout detected on {state['payment_method'].upper()}. "
            f"Recovery probability is {int(prob*100)}%. Recommended 4-hour cooldown "
            f"before initiating automated smart retry order."
        )
    elif cat == "soft_decline":
        strategy = "payment_link"
        delay = 24
        reasoning = (
            f"Soft decline due to balance or single-transaction limit. Customer may complete "
            f"via alternate card or account. Generated Payment Link with WhatsApp nudge."
        )
    elif cat == "auth_failure":
        strategy = "payment_link"
        delay = 0
        reasoning = (
            f"Authentication 3DS drop-off. Providing friction-free 1-click Razorpay payment "
            f"link to re-engage customer immediately."
        )
    elif cat == "mandate":
        strategy = "mandate_retry"
        delay = 48
        reasoning = (
            f"Autopay mandate presentation failed. Scheduled secondary mandate debit presentation "
            f"in 48 hours in compliance with RBI mandate guidelines."
        )
    elif cat == "hard_decline":
        strategy = "escalation"
        delay = 0
        reasoning = (
            f"Hard decline (card blocked / fraud suspicion). Probability is low ({int(prob*100)}%). "
            f"Automatic retry blocked to avoid bank risk penalties. Escalated for alternate instrument."
        )
    else:
        strategy = "payment_link"
        delay = 12
        reasoning = f"Default payment link recovery initiated with {int(prob*100)}% recovery likelihood."

    audit_entry = {
        "node": "strategist",
        "strategy": strategy,
        "reasoning": reasoning,
        "delay_hours": delay,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    current_trace = list(state.get("audit_trace", []))
    current_trace.append(audit_entry)
    
    return {
        "proposed_strategy": strategy,
        "agent_reasoning": reasoning,
        "recommended_delay_hours": delay,
        "audit_trace": current_trace
    }

def policy_gate_node(state: RecoveryState) -> Dict[str, Any]:
    """Node 4: 100% Deterministic Safety Policy Engine (NO LLM)."""
    amt_paise = state["amount_paise"]
    cat = state["failure_category"]
    strategy = state["proposed_strategy"]
    attempts = state.get("attempt_count", 0)
    
    # 1. Hard retry limit
    if attempts >= 3:
        policy_res = "blocked"
        policy_reason = "Transaction exceeded maximum allowed 3 retry attempts."
        approved = False
        requires_hitl = False
    # 2. Hard decline block
    elif cat == "hard_decline" and strategy in ["smart_retry", "mandate_retry"]:
        policy_res = "blocked"
        policy_reason = "Policy prohibits automatic retries on hard declines."
        approved = False
        requires_hitl = False
    # 3. High value HITL check (> ₹50,000 / 5,000,000 paise)
    elif amt_paise >= 5000000 and not state.get("hitl_decision"):
        policy_res = "paused_hitl"
        policy_reason = "High value transaction (> ₹50,000). Action paused for human authorization."
        approved = False
        requires_hitl = True
    else:
        policy_res = "approved"
        policy_reason = "All merchant policy constraints and safety guardrails satisfied."
        approved = True
        requires_hitl = False

    audit_entry = {
        "node": "policy_gate",
        "result": policy_res,
        "reason": policy_reason,
        "requires_hitl": requires_hitl,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    current_trace = list(state.get("audit_trace", []))
    current_trace.append(audit_entry)
    
    return {
        "policy_approved": approved,
        "policy_result": policy_res,
        "policy_reason": policy_reason,
        "requires_hitl": requires_hitl,
        "action_status": policy_res,
        "audit_trace": current_trace
    }

def executor_node(state: RecoveryState) -> Dict[str, Any]:
    """Node 5: Dispatches approved Razorpay API resource or schedule."""
    if not state.get("policy_approved"):
        return {
            "action_status": state.get("policy_result", "blocked")
        }
        
    strategy = state["proposed_strategy"]
    txn_id = state["transaction_id"]
    
    if strategy in ["payment_link", "notification"]:
        resource_id = f"plink_rzp_{txn_id[-6:]}"
        payment_url = f"https://rzp.io/i/{txn_id[-6:]}"
        status = "executed"
    elif strategy in ["smart_retry", "mandate_retry"]:
        resource_id = f"order_retry_{txn_id[-6:]}"
        payment_url = None
        status = "scheduled"
    else:
        resource_id = f"escalation_{txn_id[-6:]}"
        payment_url = None
        status = "escalated"

    audit_entry = {
        "node": "executor",
        "resource_id": resource_id,
        "payment_url": payment_url,
        "status": status,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    current_trace = list(state.get("audit_trace", []))
    current_trace.append(audit_entry)
    
    return {
        "executed_resource_id": resource_id,
        "payment_url": payment_url,
        "action_status": status,
        "execution_engine": "langgraph_primary",
        "audit_trace": current_trace
    }
