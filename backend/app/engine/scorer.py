from datetime import datetime
from typing import List
from app.schemas.agent_output import RecoveryScoreResult

class RecoveryScorer:
    def score(
        self,
        failure_category: str,
        amount_paise: int,
        payment_method: str,
        attempt_count: int = 0,
        hours_since_failure: float = 0.0,
        failure_timestamp: datetime = None
    ) -> RecoveryScoreResult:
        factors: List[str] = []
        
        # 1. Category Base Probability
        cat_lower = failure_category.lower()
        if cat_lower == "transient":
            base_prob = 0.82
            factors.append("Transient gateway error has high retry baseline (82%)")
        elif cat_lower == "soft_decline":
            base_prob = 0.58
            factors.append("Soft decline baseline probability (58%)")
        elif cat_lower == "mandate":
            base_prob = 0.68
            factors.append("Mandate autopay retry baseline (68%)")
        elif cat_lower == "auth_failure":
            base_prob = 0.45
            factors.append("Auth/drop-off requires payment link intervention (45%)")
        elif cat_lower == "hard_decline":
            base_prob = 0.08
            factors.append("Hard decline has low recovery expectation (<10%) without card change")
        else:
            base_prob = 0.50
            factors.append("Standard baseline probability applied")

        # 2. Time Decay Factor
        # Immediate (<4 hrs) has best conversion; >48 hrs degrades
        if hours_since_failure <= 4.0:
            base_prob += 0.08
            factors.append("Immediate recovery window (<4h): +8% boost")
        elif hours_since_failure > 72.0:
            base_prob -= 0.15
            factors.append("Stale failure (>72h): -15% decay penalty")
        elif hours_since_failure > 24.0:
            base_prob -= 0.07
            factors.append("Delayed failure (>24h): -7% decay penalty")

        # 3. Attempt Fatigue Penalty
        if attempt_count == 1:
            base_prob -= 0.05
            factors.append("Second attempt: -5% fatigue penalty")
        elif attempt_count >= 2:
            base_prob -= 0.20
            factors.append("Third attempt: -20% severe fatigue penalty")

        # 4. Indian Payment Ecosystem Adjustments
        # Salary credit window (28th-31st and 1st-5th of month)
        check_time = failure_timestamp or datetime.utcnow()
        if check_time.day in [1, 2, 3, 4, 5, 28, 29, 30, 31] and cat_lower == "soft_decline":
            base_prob += 0.15
            factors.append("Indian salary credit cycle window: +15% balance replenishment boost")

        # Amount Friction Penalty
        amount_inr = amount_paise / 100.0
        if amount_inr > 50000:
            base_prob -= 0.12
            factors.append("High transaction value (>₹50,000): -12% velocity & authorization friction")
        elif amount_inr < 1000:
            base_prob += 0.05
            factors.append("Micro-transaction (<₹1,000): +5% frictionless approval")

        # Payment Method Dynamics
        if payment_method.lower() == "upi" and cat_lower == "transient":
            base_prob += 0.05
            factors.append("UPI transient failures exhibit highest automatic recovery rates (+5%)")

        # Bounds clamp [0.02, 0.98]
        final_prob = max(0.02, min(0.98, base_prob))
        final_prob = round(final_prob, 3)

        confidence = "high" if attempt_count == 0 and cat_lower in ["transient", "hard_decline"] else "medium"
        if attempt_count >= 2 or cat_lower == "auth_failure":
            confidence = "medium"

        return RecoveryScoreResult(
            probability=final_prob,
            confidence=confidence,
            key_factors=factors
        )

scorer = RecoveryScorer()
