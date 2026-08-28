from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    razorpay_payment_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    amount_paise: int
    currency: str = "INR"
    payment_method: str
    error_code: str
    error_source: str = "gateway"
    error_reason: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    status: str
    failure_category: Optional[str] = None
    recovery_probability: float = 0.0
    attempts_count: int = 0
    recovered_amount_paise: int = 0
    recovery_strategy_used: Optional[str] = None
    original_failure_at: datetime
    recovered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionFilter(BaseModel):
    status: Optional[str] = None
    failure_category: Optional[str] = None
    payment_method: Optional[str] = None
    min_amount_paise: Optional[int] = None
    max_amount_paise: Optional[int] = None
    search: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
