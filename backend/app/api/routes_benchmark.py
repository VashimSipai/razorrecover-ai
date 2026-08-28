from fastapi import APIRouter, Depends, BackgroundTasks
from typing import Dict, Any
from app.data.benchmark_eval import evaluator

router = APIRouter(prefix="/benchmark", tags=["Benchmark & Empirical Evaluation"])

# In-memory benchmark cache for fast access
LATEST_BENCHMARK_CACHE = None

@router.post("/run", response_model=Dict[str, Any])
async def execute_benchmark_run(count: int = 2500):
    """
    Executes the comprehensive empirical recovery benchmark over 2,500 transactions.
    """
    global LATEST_BENCHMARK_CACHE
    eval_instance = evaluator if count == 2500 else evaluator.__class__(count=count)
    results = eval_instance.run_benchmark()
    LATEST_BENCHMARK_CACHE = results
    return results

@router.get("/results", response_model=Dict[str, Any])
async def get_latest_benchmark_results():
    """
    Returns the latest benchmark evaluation results (or runs a fresh batch if empty).
    """
    global LATEST_BENCHMARK_CACHE
    if not LATEST_BENCHMARK_CACHE:
        LATEST_BENCHMARK_CACHE = evaluator.run_benchmark()
    return LATEST_BENCHMARK_CACHE
