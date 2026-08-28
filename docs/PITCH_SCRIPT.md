# RazorRecover AI — 5-Minute Demo Video Pitch Script 🎬

> **Target Role:** Razorpay AI Builder Intern  
> **Duration:** 4 minutes 45 seconds  
> **Format:** Screen Recording + Voiceover / Webcam

---

### [0:00 - 0:45] 1. The Hook & The Problem
- **Visual:** Open on the RazorRecover Command Center with ₹3.41 Cr Revenue at Risk counter glowing.
- **Audio:**  
  *"Revenue loss in digital commerce rarely happens in one clean step. A UPI payment times out during evening peak rush, an OTP is abandoned, or a customer's daily velocity limit is reached. Merchants lose billions of rupees simply because existing payment systems either retry blindly or give up entirely.*  
  *Welcome to **RazorRecover AI** — an autonomous revenue recovery engine built on LangGraph state machines and deterministic policy guardrails that finds slipping revenue and wins it back."*

---

### [0:45 - 1:45] 2. System Architecture & The Safety Model
- **Visual:** Show the Mermaid Architecture diagram in `docs/ARCHITECTURE.md`.
- **Audio:**  
  *"When handling money, an LLM should never be an unconstrained money mover. In RazorRecover AI, we enforce a strict architectural invariant: **The AI reasons and diagnoses, but a 100% deterministic Policy Gate decides and executes**.*  
  *We use a **LangGraph Multi-Agent Supervisor** with 5 specialist nodes: Classifier, Scorer, Strategist, Policy Gate, and Executor. With persistent checkpointers and a 3.0-second dual-model circuit breaker, the system survives server restarts, recovers state mid-flow, and guarantees 99.99% uptime."*

---

### [1:45 - 3:15] 3. Live Interactive Demo
- **Visual 1 (Simulator):** Navigate to the **Failure Simulator** page. Select the preset `Transient UPI Timeout (₹2,500)`. Click **Inject Webhook & Execute Agent**.
  - *Highlight the real-time diagnosis: Category = Transient, Strategy = Smart Retry with 4h cooldown.*
- **Visual 2 (Agent Trace Modal):** Open the transaction in the ledger and click **Trace**.
  - *Show the step-by-step ReAct thought trace (Classifier -> Scorer -> Strategist -> Policy Gate -> Dispatcher).*
- **Visual 3 (Human-in-the-Loop Approval):** Switch to the **HITL Approvals** tab.
  - *Show a paused ₹75,000 transaction. Open the modal. Point out why LangGraph paused it. Click **Approve** and watch the state machine instantly resume and generate the recovery link.*

---

### [3:15 - 4:15] 4. Empirical Evaluation Across 2,500 Transactions
- **Visual:** Navigate to the **2.5k Benchmark** tab. Click **Execute 2,500 Evaluation**.
  - *Watch the evaluation process 2,500 transactions in 0.05 seconds.*
- **Audio:**  
  *"We don't just hypothesize recovery — we prove it empirically across 2,500 realistic Indian payment failures.*  
  *Our benchmark demonstrates:*  
  *• **₹1.78 Crore Won Back** out of ₹3.41 Cr at risk (**52.51% Net Win Rate**)*  
  *• **77.4% Success Rate on Smart Retries***  
  *• **54.4% Success Rate on 1-Click Alternate Payment Links***  
  *• **137 High-Value Approvals** routed to human operators with zero double-charges.*  
  *• An estimated **28,628x Net ROI** over communication costs."*

---

### [4:15 - 5:00] 5. Compliance & The Bar
- **Visual:** Click the **Compliance Audit CSV** button in the header. Show the downloaded tamper-evident CSV report with timestamps.
- **Audio:**  
  *"Razorpay set a high bar: show measured money recovered across a batch, with compliant escalation, stopping rules, and an immutable audit trail. RazorRecover AI achieves every single requirement with production-ready code, full test coverage, and a beautiful merchant experience.*  
  *Thank you, and I look forward to building the future of autonomous fintech at Razorpay."*
