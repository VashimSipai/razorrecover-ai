from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.core.models import PolicyConfig, Transaction

class PolicyGateResult:
    def __init__(self, approved: bool, status: str, reason: str, requires_hitl: bool = False):
        self.approved = approved
        self.status = status  # 'approved', 'blocked', 'paused_hitl', 'modified'
        self.reason = reason
        self.requires_hitl = requires_hitl

    def to_dict(self) -> Dict[str, Any]:
        return {
            "approved": self.approved,
            "status": self.status,
            "reason": self.reason,
            "requires_hitl": self.requires_hitl
        }

class PolicyGate:
    def evaluate(
        self,
        transaction: Transaction,
        proposed_strategy: str,
        policy_config: Optional[PolicyConfig] = None,
        hitl_approved: bool = False
    ) -> PolicyGateResult:
        # Default safety guardrails if policy_config is None
        max_retries = policy_config.max_retries_per_transaction if policy_config else 3
        cooldown_hours = policy_config.cooldown_hours if policy_config else 24
        max_recovery_amount = policy_config.max_recovery_amount_paise if policy_config else 10000000  # ₹1,00,000
        min_prob = policy_config.min_recovery_probability if policy_config else 0.15
        hitl_threshold = policy_config.high_value_hitl_threshold_paise if policy_config else 5000000  # ₹50,000
        blocked_codes = policy_config.blocked_error_codes if policy_config and policy_config.blocked_error_codes else [
            "BAD_REQUEST_CARD_INVALID",
            "GATEWAY_ERROR_CARD_BLOCKED",
            "BAD_REQUEST_PAYMENT_DECLINED_BY_BANK_DUE_TO_RISK"
        ]

        # 1. Rule: Blocked Error Codes (Hard Fraud / Invalid Cards)
        if transaction.error_code in blocked_codes and proposed_strategy in ["smart_retry", "mandate_retry"]:
            return PolicyGateResult(
                approved=False,
                status="blocked",
                reason=f"Policy Block: Error code '{transaction.error_code}' is permanently blocked from automated retries."
            )

        # 2. Rule: Maximum Retry Count
        if transaction.attempts_count >= max_retries:
            return PolicyGateResult(
                approved=False,
                status="blocked",
                reason=f"Policy Block: Transaction has reached the maximum allowed retry attempts ({max_retries})."
            )

        # 3. Rule: Minimum Recovery Probability Threshold
        if transaction.recovery_probability < min_prob and proposed_strategy != "escalation":
            return PolicyGateResult(
                approved=False,
                status="blocked",
                reason=f"Policy Block: Recovery probability ({int(transaction.recovery_probability*100)}%) is below minimum viable threshold ({int(min_prob*100)}%). Escalation required."
            )

        # 4. Rule: Max Transaction Amount Cap
        if transaction.amount_paise > max_recovery_amount:
            return PolicyGateResult(
                approved=False,
                status="blocked",
                reason=f"Policy Block: Transaction amount (₹{transaction.amount_paise/100:,.2f}) exceeds merchant hard ceiling (₹{max_recovery_amount/100:,.2f})."
            )

        # 5. Rule: High Value Human-in-the-Loop Threshold (> ₹50,000)
        if transaction.amount_paise >= hitl_threshold and not hitl_approved:
            return PolicyGateResult(
                approved=False,
                status="paused_hitl",
                reason=f"Policy Gate: High-value transaction (₹{transaction.amount_paise/100:,.2f} >= ₹{hitl_threshold/100:,.2f}) paused for mandatory Human-in-the-Loop sign-off.",
                requires_hitl=True
            )

        # All safety rules passed
        return PolicyGateResult(
            approved=True,
            status="approved",
            reason="All deterministic merchant safety constraints and risk rules satisfied."
        )

policy_gate = PolicyGate()
