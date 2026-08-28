from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.config import settings
from app.core.models import Transaction, AuditLog
from app.integrations.razorpay_client import razorpay_wrapper
from app.engine.dispatcher import dispatcher

router = APIRouter(prefix="/store", tags=["Live Merchant Store Demo"])

class CreateStoreOrderRequest(BaseModel):
    product_name: str
    amount_inr: float
    customer_name: str
    customer_email: str
    customer_phone: str

class StoreFailureEventRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    amount_inr: float
    payment_method: str = "upi"
    error_code: str = "BAD_REQUEST_PAYMENT_TIMED_OUT"
    error_source: str = "gateway"
    error_reason: str = "Payment failed during customer checkout"

@router.post("/order", response_model=Dict[str, Any])
async def create_store_order(payload: CreateStoreOrderRequest):
    """
    Creates a real Razorpay Order for live Checkout.js integration.
    """
    amount_paise = int(payload.amount_inr * 100)
    receipt = f"rec_store_{int(datetime.utcnow().timestamp())}"
    
    order = razorpay_wrapper.create_order(
        amount_paise=amount_paise,
        receipt=receipt,
        notes={
            "product": payload.product_name,
            "customer_name": payload.customer_name
        }
    )

    return {
        "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_mock_key",
        "order_id": order["id"],
        "amount_paise": amount_paise,
        "amount_inr": payload.amount_inr,
        "currency": "INR",
        "product_name": payload.product_name
    }

@router.post("/payment-failure", response_model=Dict[str, Any])
async def handle_live_payment_failure(
    payload: StoreFailureEventRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Called when a live payment fails in the Razorpay Checkout modal.
    Immediately triggers the autonomous LangGraph recovery pipeline!
    """
    amount_paise = int(payload.amount_inr * 100)

    # 1. Ingest Transaction
    txn = Transaction(
        razorpay_payment_id=payload.razorpay_payment_id,
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

    # 2. Trigger Recovery
    action, updated_txn = await dispatcher.process_recovery(db=db, transaction=txn)

    notification_text = None
    if action.payment_url:
        notification_text = (
            f"Hi {payload.customer_name}, your payment of ₹{payload.amount_inr:,.2f} "
            f"for {payload.razorpay_payment_id} was interrupted. Tap here to complete securely via UPI or Card: {action.payment_url}"
        )
    elif action.strategy in ["smart_retry", "mandate_retry"]:
        notification_text = (
            f"Hi {payload.customer_name}, temporary bank gateway timeout on ₹{payload.amount_inr:,.2f}. "
            f"Automated smart retry scheduled for your order."
        )

    return {
        "success": True,
        "transaction_id": txn.id,
        "status": updated_txn.status,
        "strategy": action.strategy,
        "policy_result": action.policy_gate_result,
        "policy_reason": action.policy_gate_reason,
        "payment_url": action.payment_url,
        "notification_message": notification_text,
        "razorpay_resource_id": action.razorpay_resource_id,
        "execution_engine": action.execution_engine,
        "recovery_probability": updated_txn.recovery_probability
    }
