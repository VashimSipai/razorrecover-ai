from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.models import PolicyConfig

router = APIRouter(prefix="/policies", tags=["Merchant Policies & Guardrails"])

class PolicyUpdateRequest(BaseModel):
    max_retries_per_transaction: int = Field(ge=1, le=5)
    cooldown_hours: int = Field(ge=1, le=72)
    max_discount_percent: int = Field(ge=0, le=20)
    high_value_hitl_threshold_paise: int = Field(ge=1000000)
    blocked_error_codes: List[str]
    allow_whatsapp_notifications: bool = True
    allow_smart_discounting: bool = True

@router.get("", response_model=Dict[str, Any])
async def get_merchant_policy(db: AsyncSession = Depends(get_db)):
    """
    Get current merchant safety and recovery policy configuration.
    """
    stmt = select(PolicyConfig).filter_by(id="default_policy")
    res = await db.execute(stmt)
    policy = res.scalar_one_or_none()

    if not policy:
        raise HTTPException(status_code=404, detail="Default policy config not found.")

    return {
        "id": policy.id,
        "max_retries_per_transaction": policy.max_retries_per_transaction,
        "cooldown_hours": policy.cooldown_hours,
        "max_discount_percent": policy.max_discount_percent,
        "max_recovery_amount_paise": policy.max_recovery_amount_paise,
        "min_recovery_probability": policy.min_recovery_probability,
        "high_value_hitl_threshold_paise": policy.high_value_hitl_threshold_paise,
        "blocked_error_codes": policy.blocked_error_codes or [],
        "allow_whatsapp_notifications": policy.allow_whatsapp_notifications,
        "allow_smart_discounting": policy.allow_smart_discounting,
        "updated_at": policy.updated_at
    }

@router.put("", response_model=Dict[str, Any])
async def update_merchant_policy(
    payload: PolicyUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Update merchant safety guardrails dynamically.
    """
    stmt = select(PolicyConfig).filter_by(id="default_policy")
    res = await db.execute(stmt)
    policy = res.scalar_one_or_none()

    if not policy:
        raise HTTPException(status_code=404, detail="Default policy config not found.")

    policy.max_retries_per_transaction = payload.max_retries_per_transaction
    policy.cooldown_hours = payload.cooldown_hours
    policy.max_discount_percent = payload.max_discount_percent
    policy.high_value_hitl_threshold_paise = payload.high_value_hitl_threshold_paise
    policy.blocked_error_codes = payload.blocked_error_codes
    policy.allow_whatsapp_notifications = payload.allow_whatsapp_notifications
    policy.allow_smart_discounting = payload.allow_smart_discounting

    await db.commit()
    await db.refresh(policy)

    return {"success": True, "message": "Policy guardrails updated successfully."}
