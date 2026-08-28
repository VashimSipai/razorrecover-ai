import pytest
from datetime import datetime
from app.engine.scorer import scorer

def test_score_transient_baseline():
    result = scorer.score("transient", 250000, "upi", attempt_count=0, hours_since_failure=1.0)
    assert result.probability >= 0.80
    assert result.confidence == "high"

def test_score_time_decay():
    fresh_score = scorer.score("transient", 250000, "upi", attempt_count=0, hours_since_failure=1.0)
    stale_score = scorer.score("transient", 250000, "upi", attempt_count=0, hours_since_failure=80.0)
    assert fresh_score.probability > stale_score.probability

def test_score_attempt_fatigue():
    first_try = scorer.score("soft_decline", 100000, "card", attempt_count=0)
    third_try = scorer.score("soft_decline", 100000, "card", attempt_count=2)
    assert first_try.probability > third_try.probability

def test_score_salary_day_boost():
    salary_date = datetime(2026, 9, 1, 10, 0, 0)
    mid_month_date = datetime(2026, 9, 15, 10, 0, 0)
    
    salary_score = scorer.score("soft_decline", 300000, "upi", failure_timestamp=salary_date)
    mid_month_score = scorer.score("soft_decline", 300000, "upi", failure_timestamp=mid_month_date)
    assert salary_score.probability > mid_month_score.probability

def test_score_hard_decline_low_probability():
    result = scorer.score("hard_decline", 250000, "card")
    assert result.probability < 0.20
