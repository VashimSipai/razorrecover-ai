from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class RecoveryState(TypedDict):
    # Chat / Thought messages
    messages: Annotated[List[BaseMessage], add_messages]
    
    # Transaction Context
    transaction_id: str
    razorpay_payment_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    amount_paise: int
    payment_method: str
    error_code: str
    error_source: str
    error_reason: Optional[str]
    attempt_count: int
    hours_since_failure: float
    
    # Specialist Outputs
    failure_category: Optional[str]
    recovery_probability: Optional[float]
    probability_factors: List[str]
    proposed_strategy: Optional[str]
    agent_reasoning: Optional[str]
    recommended_delay_hours: int
    
    # Policy Guardrails & HITL
    policy_approved: bool
    policy_result: str  # approved, modified, blocked, paused_hitl
    policy_reason: Optional[str]
    requires_hitl: bool
    hitl_decision: Optional[str]  # approve, modify, reject
    
    # Dispatch & Outcomes
    executed_resource_id: Optional[str]
    payment_url: Optional[str]
    action_status: str  # pending, executed, blocked, paused_hitl
    execution_engine: str  # langgraph_primary, raw_gemini_fallback, deterministic_rule
    audit_trace: List[Dict[str, Any]]
