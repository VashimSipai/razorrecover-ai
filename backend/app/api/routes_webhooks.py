import logging
from datetime import datetime
from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.models import Transaction, AuditLog
from app.engine.dispatcher import dispatcher

logger = logging.getLogger("razorrecover.webhooks")
router = APIRouter(prefix="/webhooks", tags=["Razorpay Webhooks"])

@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Razorpay Webhook listener endpoint.
    Handles real-time payment events (e.g. payment.failed, payment_link.paid).
    """
    payload = await request.json()
    event_type = payload.get("event")
    event_payload = payload.get("payload", {})
    
    logger.info(f"Received Razorpay Webhook Event: {event_type}")

    if event_type == "payment.failed":
        payment_entity = event_payload.get("payment", {}).get("entity", {})
        payment_id = payment_entity.get("id", f"pay_wh_{int(datetime.utcnow().timestamp())}")
        
        # Check if transaction already exists
        stmt = select(Transaction).filter_by(razorpay_payment_id=payment_id)
        res = await db.execute(stmt)
        existing_txn = res.scalar_one_or_none()

        if not existing_txn:
            # Ingest new failed payment from webhook
            error_code = payment_entity.get("error_code", "GATEWAY_ERROR")
            error_desc = payment_entity.get("error_description", "Payment failed via gateway")
            amount_paise = payment_entity.get("amount", 250000)
            
            new_txn = Transaction(
                razorpay_payment_id=payment_id,
                customer_name=payment_entity.get("notes", {}).get("name", "Customer"),
                customer_email=payment_entity.get("email", "customer@example.com"),
                customer_phone=payment_entity.get("contact", "+919876543210"),
                amount_paise=amount_paise,
                payment_method=payment_entity.get("method", "upi"),
                status="failed",
                error_code=error_code,
                error_source=payment_entity.get("error_source", "gateway"),
                error_reason=error_desc,
                original_failure_at=datetime.utcnow()
            )
            db.add(new_txn)
            await db.commit()
            await db.refresh(new_txn)

            # Trigger autonomous recovery in background
            background_tasks.add_task(dispatcher.process_recovery, db, new_txn)
            return {"status": "ingested", "action": "recovery_initiated", "transaction_id": new_txn.id}

    elif event_type in ["payment_link.paid", "payment.captured"]:
        # Mark payment as successfully recovered
        link_entity = event_payload.get("payment_link", {}).get("entity", {})
        link_id = link_entity.get("id")
        
        # Find transaction associated with this resource
        # Update status to 'recovered'
        return {"status": "acknowledged", "event": event_type}

    return {"status": "ignored", "event": event_type}
