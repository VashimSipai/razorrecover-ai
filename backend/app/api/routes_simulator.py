from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.models import Transaction, AuditLog
from app.engine.dispatcher import dispatcher

router = APIRouter(prefix="/simulate", tags=["Failure Simulator (Demo Helper)"])

class SimulateFailureRequest(BaseModel):
    customer_name: str = Field(default="Aditi Rao")
    customer_email: str = Field(default="aditi.rao@example.in")
    customer_phone: str = Field(default="+919876543210")
    amount_inr: float = Field(default=2499.00, ge=1.0)
    payment_method: str = Field(default="upi", description="upi, card, mandate, netbanking")
    error_code: str = Field(default="BAD_REQUEST_PAYMENT_TIMED_OUT")
    error_source: str = Field(default="gateway")
    error_reason: Optional[str] = Field(default="UPI payment request timed out at issuing bank")
    auto_recover: bool = Field(default=True, description="Whether to trigger the recovery agent immediately")

@router.post("/failure", response_model=Dict[str, Any])
async def simulate_payment_failure(
    payload: SimulateFailureRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates a live Razorpay payment failure event for interactive testing and live demo pitches.
    """
    payment_id = f"pay_sim_{int(datetime.utcnow().timestamp())}"
    amount_paise = int(payload.amount_inr * 100)

    # 1. Create Transaction
    txn = Transaction(
        razorpay_payment_id=payment_id,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        amount_paise=amount_paise,
        currency="INR",
        payment_method=payload.payment_method,
        status="failed",
        error_code=payload.error_code,
        error_source=payload.error_source,
        error_reason=payload.error_reason,
        original_failure_at=datetime.utcnow()
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)

    # Log ingestion
    audit = AuditLog(
        transaction_id=txn.id,
        event_type="simulation_injected",
        event_payload={"error_code": payload.error_code, "amount_paise": amount_paise},
        agent_thought_trace=f"Simulator injected failure event for {payload.customer_name}. Error: {payload.error_code}",
        actor="system"
    )
    db.add(audit)
    await db.commit()

    # 2. Trigger autonomous recovery if requested
    recovery_data = None
    if payload.auto_recover:
        action, updated_txn = await dispatcher.process_recovery(db=db, transaction=txn)
        
        notification_text = None
        if action.payment_url:
            notification_text = (
                f"Hi {payload.customer_name}, your payment of ₹{payload.amount_inr:,.2f} "
                f"for Order {payment_id} was interrupted. Tap here to complete securely via UPI or Card: {action.payment_url}"
            )
        elif action.strategy in ["smart_retry", "mandate_retry"]:
            notification_text = (
                f"Hi {payload.customer_name}, we noticed a temporary bank gateway timeout for ₹{payload.amount_inr:,.2f}. "
                f"Our system has automatically scheduled an order re-presentation. No action needed!"
            )

        recovery_data = {
            "action_id": action.id,
            "strategy": action.strategy,
            "agent_reasoning": action.agent_reasoning,
            "policy_result": action.policy_gate_result,
            "policy_reason": action.policy_gate_reason,
            "razorpay_resource_id": action.razorpay_resource_id,
            "razorpay_resource_type": action.razorpay_resource_type,
            "payment_url": action.payment_url,
            "notification_message": notification_text,
            "execution_engine": action.execution_engine,
            "status": updated_txn.status,
            "probability": updated_txn.recovery_probability
        }

    return {
        "success": True,
        "simulated_payment_id": payment_id,
        "transaction_id": txn.id,
        "recovery": recovery_data
    }
