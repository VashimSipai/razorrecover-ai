import asyncio
import time
import logging
from typing import Dict, Any, Tuple
from app.engine.graph import recovery_graph
from app.integrations.gemini_raw import raw_gemini_recovery_fallback

logger = logging.getLogger("razorrecover.circuit_breaker")

class CircuitBreaker:
    def __init__(self, timeout_seconds: float = 3.0):
        self.timeout_seconds = timeout_seconds

    async def execute_recovery(self, state_payload: Dict[str, Any], thread_id: str) -> Tuple[Dict[str, Any], str]:
        """
        Executes LangGraph state machine recovery with automatic 3.0s timeout and exception fallback.
        Returns: (result_state, execution_engine_name)
        """
        config = {"configurable": {"thread_id": thread_id}}
        start_time = time.time()
        
        try:
            # Format minimal state
            initial_state = {
                "messages": [],
                "transaction_id": state_payload.get("transaction_id", "txn_demo"),
                "razorpay_payment_id": state_payload.get("razorpay_payment_id", "pay_demo"),
                "customer_name": state_payload.get("customer_name", "Customer"),
                "customer_email": state_payload.get("customer_email", "customer@example.com"),
                "customer_phone": state_payload.get("customer_phone", "+919876543210"),
                "amount_paise": state_payload.get("amount_paise", 10000),
                "payment_method": state_payload.get("payment_method", "upi"),
                "error_code": state_payload.get("error_code", "GATEWAY_ERROR"),
                "error_source": state_payload.get("error_source", "gateway"),
                "error_reason": state_payload.get("error_reason"),
                "attempt_count": state_payload.get("attempt_count", 0),
                "hours_since_failure": state_payload.get("hours_since_failure", 0.0),
                "failure_category": None,
                "recovery_probability": None,
                "probability_factors": [],
                "proposed_strategy": None,
                "agent_reasoning": None,
                "recommended_delay_hours": 0,
                "policy_approved": False,
                "policy_result": "pending",
                "policy_reason": None,
                "requires_hitl": False,
                "hitl_decision": state_payload.get("hitl_decision"),
                "executed_resource_id": None,
                "payment_url": None,
                "action_status": "pending",
                "execution_engine": "langgraph_primary",
                "audit_trace": []
            }

            # 1. Attempt LangGraph Execution with timeout
            result = await asyncio.wait_for(
                recovery_graph.ainvoke(initial_state, config=config),
                timeout=self.timeout_seconds
            )
            elapsed = round((time.time() - start_time) * 1000, 2)
            logger.info(f"LangGraph primary execution completed in {elapsed}ms for {initial_state['transaction_id']}")
            return result, "langgraph_primary"

        except asyncio.TimeoutError:
            logger.warning(f"LangGraph execution timed out (> {self.timeout_seconds}s). Tripping Circuit Breaker -> Raw Fallback.")
            fallback_res = await raw_gemini_recovery_fallback(state_payload)
            return fallback_res, "raw_gemini_fallback"

        except Exception as e:
            logger.error(f"LangGraph execution encountered an error ({e}). Engaging Raw Fallback Engine.")
            fallback_res = await raw_gemini_recovery_fallback(state_payload)
            return fallback_res, "raw_gemini_fallback"

circuit_breaker = CircuitBreaker(timeout_seconds=3.0)
