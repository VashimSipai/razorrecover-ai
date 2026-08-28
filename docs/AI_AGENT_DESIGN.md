# RazorRecover AI — AI Agent Design & ReAct Reasoning 🧠

## 1. Multi-Agent Supervisor Pattern
Rather than relying on a monolithic conversational prompt, **RazorRecover AI** employs a **Supervisor Multi-Agent State Machine**:

1. **Classifier Node (`classifier.py`)**: Root-cause diagnostic mapping over 20+ Razorpay error codes into 5 canonical cohorts (`transient`, `soft_decline`, `auth_failure`, `mandate`, `hard_decline`).
2. **Scorer Node (`scorer.py`)**: Computes multi-factor recovery probability factoring time decay curves, attempt fatigue penalties, Indian salary-cycle boosts, and authorization friction.
3. **Strategist Node (`agents.py`)**: Formulates the optimal recovery strategy (`smart_retry`, `payment_link`, `mandate_retry`, `escalation`) and generates explainable reasoning.
4. **Policy Gate Node (`policy_gate.py`)**: Deterministic safety checks (NO LLM) enforcing stopping rules, cooldowns, and flagging high-value HITL pauses.
5. **Executor Node (`agents.py`)**: Dispatches the action via Razorpay SDK and updates the immutable audit log.

---

## 2. Real ReAct Thought Trace Example

```
═══════════════════════════════════════════════════════════
TRANSACTION: txn_00142 | AMOUNT: ₹4,500 | METHOD: UPI
ERROR CODE: BAD_REQUEST_PAYMENT_TIMED_OUT (Gateway)
CUSTOMER: Priya Sharma (+919876543210)
═══════════════════════════════════════════════════════════

STEP 1 — DIAGNOSIS [Node: classifier]
  • Error Category: TRANSIENT
  • Retry Safety: TRUE
  • Root Cause: Payment request timed out at gateway level.

STEP 2 — PROBABILITY SCORING [Node: scorer]
  • Baseline: 82% (Transient Gateway)
  • Time Decay Adjustment: +8% (Failure occurred < 2h ago)
  • Indian UPI Rush Hour Boost: +5% (Evening shopping window)
  • Calculated P(Recovery): 88% (Confidence: HIGH)

STEP 3 — STRATEGY FORMULATION [Node: strategist]
  • Selected Strategy: SMART RETRY (Order Re-presentation)
  • Recommended Delay: 4 Hours
  • Reasoning: "UPI transient gateway timeout on fresh transaction. 
    High recovery likelihood (88%). Recommended 4h cooldown order."

STEP 4 — DETERMINISTIC POLICY CHECK [Node: policy_gate]
  • Max Retries Check: 1 / 3 Attempts (PASSED)
  • Error Ban Check: Safe (PASSED)
  • Amount Threshold Check: ₹4,500 < ₹50,000 HITL ceiling (PASSED)
  • Policy Decision: APPROVED

STEP 5 — DISPATCH & NOTIFICATION [Node: executor]
  • Resource ID: order_retry_00142
  • Action Status: SCHEDULED (2026-08-28 16:00 IST)
  • WhatsApp Nudge: Dispatched to +919876543210
═══════════════════════════════════════════════════════════
```

---

## 3. Resilience & Observability
- **LangSmith Tracing**: Full token, latency, and step-level telemetry recorded on every transition.
- **Circuit Breaker**: 3.0s timeout ensures zero transaction drops even during LLM provider downtime.
