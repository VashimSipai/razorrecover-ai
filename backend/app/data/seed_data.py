import os
import sys
from datetime import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.database import sync_engine, Base, SyncSessionLocal
from app.core.models import Transaction, PolicyConfig, ApprovalQueue, AuditLog, RecoveryAction
from app.data.synthetic_generator import generate_synthetic_transactions

def seed_database(txn_count: int = 300):
    print("Creating database schema...")
    Base.metadata.create_all(bind=sync_engine)
    
    session = SyncSessionLocal()
    try:
        # Check if already seeded
        existing_count = session.query(Transaction).count()
        if existing_count >= txn_count:
            print(f"Database already seeded with {existing_count} transactions.")
            return

        print("Seeding default merchant policy config...")
        policy = session.query(PolicyConfig).filter_by(id="default_policy").first()
        if not policy:
            policy = PolicyConfig(
                id="default_policy",
                max_retries_per_transaction=3,
                cooldown_hours=24,
                max_discount_percent=5,
                max_recovery_amount_paise=10000000,
                min_recovery_probability=0.15,
                high_value_hitl_threshold_paise=5000000,  # ₹50,000 in paise
                blocked_error_codes=[
                    "BAD_REQUEST_CARD_INVALID",
                    "GATEWAY_ERROR_CARD_BLOCKED",
                    "BAD_REQUEST_PAYMENT_DECLINED_BY_BANK_DUE_TO_RISK"
                ],
                allow_whatsapp_notifications=True,
                allow_smart_discounting=True
            )
            session.add(policy)
            session.commit()
            print("PolicyConfig created.")

        print(f"Generating {txn_count} realistic Indian payment failure transactions...")
        synthetic_txns = generate_synthetic_transactions(count=txn_count, seed=42)
        
        for item in synthetic_txns:
            # Check if exists
            exists = session.query(Transaction).filter_by(razorpay_payment_id=item["razorpay_payment_id"]).first()
            if exists:
                continue
                
            txn = Transaction(
                id=item["id"],
                razorpay_payment_id=item["razorpay_payment_id"],
                customer_name=item["customer_name"],
                customer_email=item["customer_email"],
                customer_phone=item["customer_phone"],
                amount_paise=item["amount_paise"],
                currency=item["currency"],
                payment_method=item["payment_method"],
                status="failed",
                error_code=item["error_code"],
                error_source=item["error_source"],
                error_reason=item["error_reason"],
                failure_category=item["failure_category"],
                recovery_probability=item["recovery_probability"],
                original_failure_at=datetime.fromisoformat(item["original_failure_at"]),
                created_at=datetime.fromisoformat(item["created_at"])
            )
            session.add(txn)
            
            # Initial Audit Log entry
            audit = AuditLog(
                transaction_id=txn.id,
                event_type="failure_ingested",
                event_payload={
                    "error_code": item["error_code"],
                    "error_source": item["error_source"],
                    "amount_paise": item["amount_paise"],
                    "category": item["failure_category"]
                },
                agent_thought_trace=f"Ingested payment failure {txn.razorpay_payment_id}. Category: {item['failure_category']}.",
                actor="system"
            )
            session.add(audit)
            
            # Seed 5 transactions directly into ApprovalQueue for instant demo of HITL
            if item["amount_paise"] >= 5000000 and session.query(ApprovalQueue).count() < 5:
                hitl_item = ApprovalQueue(
                    transaction_id=txn.id,
                    thread_id=f"thread_{txn.id}",
                    proposed_strategy="payment_link_split",
                    proposed_amount_paise=txn.amount_paise,
                    risk_reason="High Value Transaction (> ₹50,000) requires human sign-off before dispatch",
                    agent_recommendation=f"Generate 2 split links for {txn.customer_name} to avoid card velocity limits.",
                    status="pending"
                )
                session.add(hitl_item)

        session.commit()
        print(f"Successfully seeded database with {session.query(Transaction).count()} transactions and {session.query(ApprovalQueue).count()} HITL queue items!")
    except Exception as e:
        session.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        session.close()

if __name__ == "__main__":
    seed_database()
