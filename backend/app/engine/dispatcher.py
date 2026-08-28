import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.models import Transaction, RecoveryAction, AuditLog, ApprovalQueue, PolicyConfig
from app.engine.policy_gate import policy_gate
from app.engine.circuit_breaker import circuit_breaker
from app.integrations.razorpay_client import razorpay_wrapper
from app.integrations.notification_mock import notification_service

logger = logging.getLogger("razorrecover.dispatcher")

class ActionDispatcher:
    async def process_recovery(
        self,
        db: AsyncSession,
        transaction: Transaction,
        force_strategy: str = None,
        hitl_approved: bool = False,
        hitl_modified_amount: int = None
    ) -> Tuple[RecoveryAction, Transaction]:
        """
        Executes the autonomous recovery pipeline for a transaction:
        1. Evaluates via LangGraph State Machine / Circuit Breaker
        2. Enforces deterministic Policy Gate checks
        3. Dispatches Razorpay API calls or pauses for HITL
        4. Writes to immutable AuditLog and updates Transaction status
        """
        txn_id = transaction.id
        thread_id = f"thread_{txn_id}"
        
        # 1. Fetch Policy Config
        stmt = select(PolicyConfig).filter_by(id="default_policy")
        policy_res = await db.execute(stmt)
        policy_config = policy_res.scalar_one_or_none()

        # 2. Prepare payload for LangGraph state machine
        payload = {
            "transaction_id": transaction.id,
            "razorpay_payment_id": transaction.razorpay_payment_id,
            "customer_name": transaction.customer_name,
            "customer_email": transaction.customer_email,
            "customer_phone": transaction.customer_phone,
            "amount_paise": hitl_modified_amount or transaction.amount_paise,
            "payment_method": transaction.payment_method,
            "error_code": transaction.error_code,
            "error_source": transaction.error_source,
            "error_reason": transaction.error_reason,
            "attempt_count": transaction.attempts_count,
            "hours_since_failure": (datetime.utcnow() - transaction.original_failure_at).total_seconds() / 3600.0,
            "hitl_decision": "approved" if hitl_approved else None
        }

        # 3. Execute via Circuit Breaker (LangGraph + Fallback)
        agent_result, engine_name = await circuit_breaker.execute_recovery(payload, thread_id=thread_id)

        strategy = force_strategy or agent_result.get("proposed_strategy", "payment_link")
        category = agent_result.get("failure_category", "transient")
        probability = agent_result.get("recovery_probability", 0.5)

        # Update diagnostic fields on Transaction
        transaction.failure_category = category
        transaction.recovery_probability = probability
        transaction.attempts_count += 1
        transaction.recovery_strategy_used = strategy

        # 4. Policy Gate Safety Verification
        gate_res = policy_gate.evaluate(
            transaction=transaction,
            proposed_strategy=strategy,
            policy_config=policy_config,
            hitl_approved=hitl_approved
        )

        # 5. Handle Action Dispatch based on Policy Result
        action = RecoveryAction(
            transaction_id=transaction.id,
            attempt_number=transaction.attempts_count,
            strategy=strategy,
            agent_reasoning=agent_result.get("agent_reasoning", "Autonomous recovery intervention dispatched."),
            policy_gate_result=gate_res.status,
            policy_gate_reason=gate_res.reason,
            execution_engine=engine_name
        )

        if gate_res.status == "approved":
            transaction.status = "recovering"
            action.action_status = "executed"
            action.executed_at = datetime.utcnow()

            # Execute Razorpay API resource creation
            if strategy in ["payment_link", "notification"]:
                link_obj = razorpay_wrapper.create_payment_link(
                    amount_paise=transaction.amount_paise,
                    customer_name=transaction.customer_name,
                    customer_email=transaction.customer_email,
                    customer_phone=transaction.customer_phone,
                    description=f"Recovery Link for Order {transaction.razorpay_payment_id}"
                )
                action.razorpay_resource_id = link_obj["id"]
                action.razorpay_resource_type = "payment_link"
                action.payment_url = link_obj["short_url"]

                # Send WhatsApp/SMS Nudge
                notification_service.send_recovery_nudge(
                    channel="whatsapp",
                    customer_name=transaction.customer_name,
                    customer_phone=transaction.customer_phone,
                    amount_inr=transaction.amount_paise / 100.0,
                    payment_link=link_obj["short_url"]
                )

            elif strategy in ["smart_retry", "mandate_retry"]:
                action.razorpay_resource_id = f"order_retry_{transaction.razorpay_payment_id[-6:]}"
                action.razorpay_resource_type = "order"
                action.scheduled_at = datetime.utcnow() + timedelta(hours=4)
                action.action_status = "scheduled"

            else:
                action.razorpay_resource_id = f"esc_{transaction.id[-6:]}"
                action.razorpay_resource_type = "escalation"
                action.action_status = "escalated"

        elif gate_res.status == "paused_hitl":
            transaction.status = "paused_hitl"
            action.action_status = "paused_hitl"

            # Create ApprovalQueue item if not already queued
            q_stmt = select(ApprovalQueue).filter_by(transaction_id=transaction.id, status="pending")
            q_res = await db.execute(q_stmt)
            existing_queue = q_res.scalar_one_or_none()

            if not existing_queue:
                hitl_item = ApprovalQueue(
                    transaction_id=transaction.id,
                    thread_id=thread_id,
                    proposed_strategy=strategy,
                    proposed_amount_paise=transaction.amount_paise,
                    risk_reason=gate_res.reason,
                    agent_recommendation=action.agent_reasoning,
                    status="pending"
                )
                db.add(hitl_item)

        else:
            # Blocked
            transaction.status = "unrecoverable"
            action.action_status = "blocked"

        db.add(action)
        await db.flush()

        # 6. Immutable Audit Log Ledger
        audit = AuditLog(
            transaction_id=transaction.id,
            action_id=action.id,
            event_type=f"recovery_{gate_res.status}",
            event_payload={
                "strategy": strategy,
                "category": category,
                "probability": probability,
                "policy_gate_result": gate_res.status,
                "engine": engine_name,
                "resource_id": action.razorpay_resource_id,
                "payment_url": action.payment_url
            },
            agent_thought_trace=action.agent_reasoning,
            actor="human_operator" if hitl_approved else "agent"
        )
        db.add(audit)
        await db.commit()
        await db.refresh(transaction)
        await db.refresh(action)

        return action, transaction

dispatcher = ActionDispatcher()
