from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.core.models import Transaction, AuditLog, RecoveryAction
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["Transactions & Audit Trails"])

@router.get("", response_model=Dict[str, Any])
async def get_transactions(
    status: Optional[str] = None,
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated, filterable list of transactions.
    """
    query = select(Transaction)
    
    if status:
        query = query.filter(Transaction.status == status)
    if category:
        query = query.filter(Transaction.failure_category == category)
    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Transaction.customer_name.ilike(search_pattern)) |
            (Transaction.customer_email.ilike(search_pattern)) |
            (Transaction.razorpay_payment_id.ilike(search_pattern)) |
            (Transaction.error_code.ilike(search_pattern))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total_count = total_res.scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    query = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit)
    res = await db.execute(query)
    items = res.scalars().all()

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "items": [TransactionResponse.model_validate(item).model_dump() for item in items]
    }

@router.get("/{txn_id}", response_model=Dict[str, Any])
async def get_transaction_detail(txn_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get detailed information for a single transaction including actions and audit log.
    """
    stmt = select(Transaction).filter_by(id=txn_id)
    res = await db.execute(stmt)
    txn = res.scalar_one_or_none()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    # Fetch actions
    act_stmt = select(RecoveryAction).filter_by(transaction_id=txn_id).order_by(RecoveryAction.created_at.desc())
    act_res = await db.execute(act_stmt)
    actions = act_res.scalars().all()

    # Fetch audit logs
    aud_stmt = select(AuditLog).filter_by(transaction_id=txn_id).order_by(AuditLog.created_at.asc())
    aud_res = await db.execute(aud_stmt)
    logs = aud_res.scalars().all()

    return {
        "transaction": TransactionResponse.model_validate(txn).model_dump(),
        "actions": [
            {
                "id": a.id,
                "strategy": a.strategy,
                "attempt_number": a.attempt_number,
                "policy_gate_result": a.policy_gate_result,
                "policy_gate_reason": a.policy_gate_reason,
                "action_status": a.action_status,
                "payment_url": a.payment_url,
                "agent_reasoning": a.agent_reasoning,
                "created_at": a.created_at
            }
            for a in actions
        ],
        "audit_logs": [
            {
                "id": l.id,
                "event_type": l.event_type,
                "event_payload": l.event_payload,
                "agent_thought_trace": l.agent_thought_trace,
                "actor": l.actor,
                "created_at": l.created_at
            }
            for l in logs
        ]
    }
