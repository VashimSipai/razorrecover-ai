from pydantic import BaseModel, Field
from typing import List, Optional

class FailureClassificationResult(BaseModel):
    category: str = Field(description="transient, soft_decline, hard_decline, auth_failure, mandate")
    retry_safe: bool = Field(description="Whether the transaction is safe to retry")
    root_cause_summary: str = Field(description="Concise diagnostic explanation of why the payment failed")
    error_severity: str = Field(default="medium", description="low, medium, high, critical")

class RecoveryScoreResult(BaseModel):
    probability: float = Field(ge=0.0, le=1.0, description="Estimated probability of successful recovery")
    confidence: str = Field(description="low, medium, high")
    key_factors: List[str] = Field(description="List of contextual factors influencing the score")

class StrategyRecommendation(BaseModel):
    strategy: str = Field(description="smart_retry, payment_link, invoice, mandate_retry, notification, escalation")
    reasoning: str = Field(description="Detailed ReAct reasoning explaining why this strategy was chosen")
    recommended_delay_hours: int = Field(default=0, ge=0)
    requires_human_approval: bool = Field(default=False, description="True if amount > ₹50,000 or high risk")
    risk_notes: Optional[str] = None
