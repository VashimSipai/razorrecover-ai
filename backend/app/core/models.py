import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("txn_"))
    razorpay_payment_id = Column(String(50), unique=True, index=True, nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(100), nullable=False, index=True)
    customer_phone = Column(String(20), nullable=False)
    amount_paise = Column(Integer, nullable=False)  # in paise
    currency = Column(String(10), default="INR")
    payment_method = Column(String(20), nullable=False)  # upi, card, netbanking, wallet
    
    # Status: failed, recovering, paused_hitl, recovered, unrecoverable
    status = Column(String(30), default="failed", index=True)
    
    # Failure diagnostics
    error_code = Column(String(100), nullable=False, index=True)
    error_source = Column(String(50), default="gateway")
    error_reason = Column(String(255), nullable=True)
    failure_category = Column(String(50), index=True)  # transient, soft_decline, hard_decline, auth_failure, mandate
    recovery_probability = Column(Float, default=0.0)
    
    # Execution metrics
    attempts_count = Column(Integer, default=0)
    recovered_amount_paise = Column(Integer, default=0)
    recovery_strategy_used = Column(String(50), nullable=True)
    
    original_failure_at = Column(DateTime, default=datetime.utcnow)
    recovered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    recovery_actions = relationship("RecoveryAction", back_populates="transaction", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="transaction", cascade="all, delete-orphan")
    approval_items = relationship("ApprovalQueue", back_populates="transaction", cascade="all, delete-orphan")

class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("act_"))
    transaction_id = Column(String(50), ForeignKey("transactions.id"), nullable=False, index=True)
    attempt_number = Column(Integer, default=1)
    
    # Strategy: smart_retry, payment_link, invoice, mandate_retry, notification, escalation
    strategy = Column(String(50), nullable=False)
    agent_reasoning = Column(Text, nullable=True)
    
    # Safety Gate validation
    policy_gate_result = Column(String(20), default="approved")  # approved, modified, blocked
    policy_gate_reason = Column(String(255), nullable=True)
    
    # External API tracking
    razorpay_resource_id = Column(String(100), nullable=True)  # plink_xxx, order_xxx, inv_xxx
    razorpay_resource_type = Column(String(50), nullable=True)
    payment_url = Column(String(255), nullable=True)
    
    # Status: pending, scheduled, executing, succeeded, failed, blocked
    action_status = Column(String(30), default="pending", index=True)
    execution_engine = Column(String(50), default="langgraph_primary")  # langgraph_primary, raw_gemini_fallback, deterministic_rule
    
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    transaction = relationship("Transaction", back_populates="recovery_actions")
    audit_logs = relationship("AuditLog", back_populates="action")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("aud_"))
    transaction_id = Column(String(50), ForeignKey("transactions.id"), nullable=False, index=True)
    action_id = Column(String(50), ForeignKey("recovery_actions.id"), nullable=True)
    
    # Event: classified, scored, agent_reasoned, policy_checked, action_executed, outcome_received, hitl_paused, hitl_resumed
    event_type = Column(String(50), nullable=False, index=True)
    event_payload = Column(JSON, nullable=True)
    agent_thought_trace = Column(Text, nullable=True)
    actor = Column(String(50), default="agent")  # agent, system, human_operator
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    transaction = relationship("Transaction", back_populates="audit_logs")
    action = relationship("RecoveryAction", back_populates="audit_logs")

class ApprovalQueue(Base):
    __tablename__ = "approval_queue"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("hitl_"))
    transaction_id = Column(String(50), ForeignKey("transactions.id"), nullable=False, index=True)
    thread_id = Column(String(100), nullable=False, index=True)  # LangGraph thread_id
    proposed_strategy = Column(String(50), nullable=False)
    proposed_amount_paise = Column(Integer, nullable=False)
    risk_reason = Column(String(255), nullable=False)  # "Amount exceeds ₹50,000" / "High risk card error"
    agent_recommendation = Column(Text, nullable=True)
    
    # Status: pending, approved, modified, rejected
    status = Column(String(20), default="pending", index=True)
    reviewed_by = Column(String(50), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    transaction = relationship("Transaction", back_populates="approval_items")

class PolicyConfig(Base):
    __tablename__ = "policy_configs"

    id = Column(String(50), primary_key=True, default="default_policy")
    max_retries_per_transaction = Column(Integer, default=3)
    cooldown_hours = Column(Integer, default=24)
    max_discount_percent = Column(Integer, default=5)
    max_recovery_amount_paise = Column(Integer, default=10000000)  # ₹1,00,000 in paise
    min_recovery_probability = Column(Float, default=0.15)
    high_value_hitl_threshold_paise = Column(Integer, default=5000000)  # ₹50,000 in paise
    blocked_error_codes = Column(JSON, default=list)
    allow_whatsapp_notifications = Column(Boolean, default=True)
    allow_smart_discounting = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
