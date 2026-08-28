from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.models import Transaction, RecoveryAction
from app.schemas.recovery import RecoveryRequest, RecoveryActionResponse
from app.schemas.transaction import TransactionResponse
from app.engine.dispatcher import dispatcher

router = APIRouter(prefix="/recover", tags=["Recovery Engine"])

@router.post("/{txn_id}", response_model=Dict[str, Any])
async def recover_single_transaction(
    txn_id: str,
    payload: RecoveryRequest = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger autonomous agent recovery pipeline for a specific failed payment.
    """
    stmt = select(Transaction).filter_by(id=txn_id)
    res = await db.execute(stmt)
    transaction = res.scalar_one_or_none()

    if not transaction:
        raise HTTPException(status_code=404, detail=f"Transaction '{txn_id}' not found.")

    force_strategy = payload.force_strategy if payload else None
    action, updated_txn = await dispatcher.process_recovery(
        db=db,
        transaction=transaction,
        force_strategy=force_strategy
    )

    return {
        "success": True,
        "transaction_id": updated_txn.id,
        "status": updated_txn.status,
        "failure_category": updated_txn.failure_category,
        "recovery_probability": updated_txn.recovery_probability,
        "strategy": action.strategy,
        "policy_result": action.policy_gate_result,
        "policy_reason": action.policy_gate_reason,
        "payment_url": action.payment_url,
        "execution_engine": action.execution_engine,
        "action_id": action.id
    }

@router.post("/batch/process", response_model=Dict[str, Any])
async def recover_batch_transactions(
    limit: int = 25,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger recovery across a batch of pending failed transactions.
    """
    stmt = select(Transaction).filter_by(status="failed").limit(limit)
    res = await db.execute(stmt)
    transactions = res.scalars().all()

    recovered_count = 0
    paused_hitl_count = 0
    blocked_count = 0

    for txn in transactions:
        action, updated_txn = await dispatcher.process_recovery(db=db, transaction=txn)
        if action.policy_gate_result == "approved":
            recovered_count += 1
        elif action.policy_gate_result == "paused_hitl":
            paused_hitl_count += 1
        else:
            blocked_count += 1

    return {
        "success": True,
        "batch_size": len(transactions),
        "executed": recovered_count,
        "paused_hitl": paused_hitl_count,
        "blocked": blocked_count
    }
