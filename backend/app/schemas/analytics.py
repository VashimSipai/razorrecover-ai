from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MetricsSummary(BaseModel):
    total_failed_revenue_paise: int
    total_recovered_revenue_paise: int
    recovery_rate_percent: float
    total_failed_count: int
    total_recovered_count: int
    active_recovery_count: int
    pending_hitl_count: int
    average_recovery_time_hours: float
    net_roi_multiple: float

class FunnelStage(BaseModel):
    stage: str
    count: int
    amount_paise: int
    conversion_rate: float

class CategoryBreakdownItem(BaseModel):
    category: str
    count: int
    amount_paise: int
    recovered_count: int
    recovered_amount_paise: int
    recovery_rate: float

class StrategyPerformanceItem(BaseModel):
    strategy: str
    attempts: int
    success_count: int
    success_rate: float
    recovered_amount_paise: int
