from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class RecoveryRequest(BaseModel):
    transaction_id: Optional[str] = None
    force_strategy: Optional[str] = None
    allow_discount: bool = True
    discount_percent: int = Field(default=0, ge=0, le=20)

class RecoveryActionResponse(BaseModel):
    id: str
    transaction_id: str
    attempt_number: int
    strategy: str
    agent_reasoning: Optional[str] = None
    policy_gate_result: str
    policy_gate_reason: Optional[str] = None
    razorpay_resource_id: Optional[str] = None
    razorpay_resource_type: Optional[str] = None
    payment_url: Optional[str] = None
    action_status: str
    execution_engine: str
    scheduled_at: datetime
    executed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HITLApprovalAction(BaseModel):
    queue_id: str
    action: str = Field(description="'approve', 'modify', or 'reject'")
    modified_strategy: Optional[str] = None
    modified_amount_paise: Optional[int] = None
    reviewer_notes: Optional[str] = None
