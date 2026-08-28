from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.core.models import ApprovalQueue, Transaction, AuditLog
from app.schemas.recovery import HITLApprovalAction
from app.engine.dispatcher import dispatcher

router = APIRouter(prefix="/approvals", tags=["Human-in-the-Loop Approvals"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_pending_approvals(db: AsyncSession = Depends(get_db)):
    """
    Lists all high-value or high-risk recovery actions currently paused by LangGraph for human sign-off.
    """
    stmt = select(ApprovalQueue).filter_by(status="pending").order_by(ApprovalQueue.created_at.desc())
    res = await db.execute(stmt)
    items = res.scalars().all()

    response_list = []
    for item in items:
        txn_stmt = select(Transaction).filter_by(id=item.transaction_id)
        txn_res = await db.execute(txn_stmt)
        txn = txn_res.scalar_one_or_none()
        
        response_list.append({
            "id": item.id,
            "transaction_id": item.transaction_id,
            "customer_name": txn.customer_name if txn else "Unknown",
            "customer_email": txn.customer_email if txn else "",
            "customer_phone": txn.customer_phone if txn else "",
            "amount_paise": item.proposed_amount_paise,
            "payment_method": txn.payment_method if txn else "upi",
            "error_code": txn.error_code if txn else "UNKNOWN",
            "error_reason": txn.error_reason if txn else "",
            "failure_category": txn.failure_category if txn else "transient",
            "recovery_probability": txn.recovery_probability if txn else 0.5,
            "proposed_strategy": item.proposed_strategy,
            "risk_reason": item.risk_reason,
            "agent_recommendation": item.agent_recommendation,
            "status": item.status,
            "created_at": item.created_at
        })
    return response_list

@router.post("/{queue_id}/decision", response_model=Dict[str, Any])
async def handle_approval_decision(
    queue_id: str,
    payload: HITLApprovalAction,
    db: AsyncSession = Depends(get_db)
):
    """
    Resumes or rejects a paused LangGraph recovery action.
    Action options: 'approve', 'modify', 'reject'.
    """
    stmt = select(ApprovalQueue).filter_by(id=queue_id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail=f"Approval queue item '{queue_id}' not found.")

    txn_stmt = select(Transaction).filter_by(id=item.transaction_id)
    txn_res = await db.execute(txn_stmt)
    txn = txn_res.scalar_one_or_none()

    if not txn:
        raise HTTPException(status_code=404, detail="Underlying transaction not found.")

    item.status = payload.action.lower()
    item.reviewed_by = "Human Operator (Demo Panel)"
    item.reviewed_at = datetime.utcnow()
    item.review_notes = payload.reviewer_notes

    if payload.action.lower() == "approve":
        # Resume execution through dispatcher with HITL approved flag
        action, updated_txn = await dispatcher.process_recovery(
            db=db,
            transaction=txn,
            force_strategy=item.proposed_strategy,
            hitl_approved=True
        )
        return {
            "success": True,
            "decision": "approved",
            "transaction_status": updated_txn.status,
            "action_id": action.id,
            "payment_url": action.payment_url
        }

    elif payload.action.lower() == "modify":
        modified_strat = payload.modified_strategy or item.proposed_strategy
        modified_amt = payload.modified_amount_paise or item.proposed_amount_paise
        action, updated_txn = await dispatcher.process_recovery(
            db=db,
            transaction=txn,
            force_strategy=modified_strat,
            hitl_approved=True,
            hitl_modified_amount=modified_amt
        )
        return {
            "success": True,
            "decision": "modified",
            "modified_strategy": modified_strat,
            "transaction_status": updated_txn.status,
            "action_id": action.id
        }

    else:
        # Rejected
        txn.status = "unrecoverable"
        audit = AuditLog(
            transaction_id=txn.id,
            event_type="hitl_rejected",
            event_payload={"queue_id": queue_id, "notes": payload.reviewer_notes},
            agent_thought_trace="Human operator rejected automated recovery intervention.",
            actor="human_operator"
        )
        db.add(audit)
        await db.commit()
        return {
            "success": True,
            "decision": "rejected",
            "transaction_status": "unrecoverable"
        }
