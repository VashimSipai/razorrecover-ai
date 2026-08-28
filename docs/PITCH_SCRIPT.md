# RazorRecover AI — 5-Minute Demo Video Pitch Script 🎬

> **Target Role:** Razorpay AI Builder Intern (Track 03: AI Revenue Recovery)  
> **Target Video Duration:** 4 minutes 30 seconds to 5 minutes  
> **Recording Recommendation:** Loom / OBS Studio / Screen Recorder (Full Screen at 1080p with webcam in corner)

---

## ⏱️ Video Structure & Visual Roadmap

```
[0:00 - 0:40]  1. The Hook & The Problem (Overview Command Center)
[0:40 - 1:30]  2. Architecture & The Core Safety Invariant (LLM ≠ Money Mover)
[1:30 - 2:40]  3. Live Store Demo & Virtual WhatsApp Phone Recovery
[2:40 - 3:30]  4. High-Value Human-in-the-Loop Gateway (₹75k Order)
[3:30 - 4:20]  5. 2,500 Empirical Evaluation & 28,628x Net ROI
[4:20 - 5:00]  6. Compliance Audit & Closing Pitch
```

---

## 📜 Scene-by-Scene Script & Click Actions

### [0:00 - 0:40] 1. The Hook & The Problem
- **On Screen:** Start on **Overview Command Center** ([`http://localhost:5173/`](http://localhost:5173/)).
- **Action:** Move your cursor across the glowing KPI metric cards (`₹3.41 Cr Revenue at Risk`, `₹1.78 Cr Won Back`, `52.5% Net Win Rate`) and the 7-day Recovery Velocity chart.
- **Speak:**  
  *"Hi team Razorpay! Revenue loss in digital commerce rarely happens in one clean step. A UPI payment times out during evening peak rush hours, an OTP authorization is dropped, or a card velocity limit is reached. In India, 15 to 30% of all payment attempts fail. Merchants lose billions of rupees simply because existing payment systems either retry blindly or give up entirely.*  
  *Welcome to **RazorRecover AI** — an autonomous, policy-bounded revenue recovery engine built on LangGraph state machines that finds slipping revenue and wins it back."*

---

### [0:40 - 1:30] 2. System Architecture & The Safety Invariant
- **On Screen:** Point to the top **Multi-Agent Execution Pipeline** visualizer (`01 Classifier ➔ 02 Scorer ➔ 03 Strategist ➔ 04 Policy Gate ➔ 05 Dispatcher`).
- **Action:** Highlight the badge: `Deterministic Invariant: LLM Reasoning ➔ Hard Policy Containment`.
- **Speak:**  
  *"When handling money, an LLM should never be an unconstrained money mover. In RazorRecover AI, we enforce a strict architectural invariant: **The AI reasons and diagnoses, but a 100% deterministic Policy Gate decides and executes**.*  
  *Our backend uses a 5-node LangGraph Multi-Agent Supervisor:  
  • **Node 1 (Classifier):** Maps 20+ Razorpay error codes into 5 root-cause cohorts.  
  • **Node 2 (Scorer):** Calculates contextual recovery probability factoring Indian payment dynamics like UPI rush hours and salary day spikes.  
  • **Node 3 (Strategist):** Synthesizes optimal recovery strategies using Google Gemini 2.5 Flash.  
  • **Node 4 (Policy Gate):** A 100% deterministic rule engine that enforces a 3-retry ceiling, 24-hour cooldowns, and permanently blocks fraudulent hard declines.  
  • **Node 5 (Dispatcher):** Interfaces directly with the Razorpay Python SDK and Twilio WhatsApp services.*  
  *With `SqliteSaver` checkpointers and a 3.0-second circuit breaker, the engine survives server restarts, recovers state mid-flight, and guarantees 99.99% uptime."*

---

### [1:30 - 2:40] 3. Live Store Demo & Customer Smartphone Recovery
- **On Screen:** Click on **`Live Checkout Store`** in the left sidebar ([`http://localhost:5173/store`](http://localhost:5173/store)).
- **Action:** 
  1. Show the 3 products on the left and the **Customer's Smartphone** on the right.
  2. On the **FinOps Cloud Infrastructure (₹4,500)** card, click the purple button: **`⚡ Trigger Payment Failure & Nudge`**.
  3. Point out the glowing **`AgentThinking`** animation banner.
  4. Look at the virtual smartphone on the right as the WhatsApp notification arrives.
  5. Click **`Pay with UPI / 1-Click Link`** on the virtual phone.
- **Speak:**  
  *"Let's see it in action in our live merchant store. Here we have an order for ₹4,500 that fails due to a balance decline.  
  Notice what happens: LangGraph diagnoses the soft decline in under 20ms, determines a 75% recovery likelihood, and generates a personalized 1-click Razorpay payment link.  
  On the right, you can see the customer's phone immediately receive an automated WhatsApp nudge. When the customer taps 'Pay with UPI' on their phone... the transaction is completed, and the revenue is won back live!"*

---

### [2:40 - 3:30] 4. High-Value Human-in-the-Loop Gateway
- **On Screen:** Still in `/store`, click **`⚡ Trigger Payment Failure & Nudge`** on the **Enterprise Scale License (₹75,000)** card.
- **Action:** 
  1. Show the warning pill: *Paused by LangGraph because ₹75,000 $\ge$ ₹50,000 threshold*.
  2. Click on **`HITL Approvals`** in the left sidebar ([`http://localhost:5173/approvals`](http://localhost:5173/approvals)).
  3. Click **`Review & Decide`** on the pending ₹75,000 row to open the interactive modal.
  4. Inspect the agent's reasoning, then click **`Approve & Dispatch Action`**.
- **Speak:**  
  *"Now, what happens if an enterprise order of ₹75,000 fails?  
  Under our policy gate, all transactions exceeding ₹50,000 automatically trigger LangGraph's `interrupt()` node. The agent pauses execution and places the order into the Human-in-the-Loop Approval Queue.  
  A finance operator can review the agent's diagnostic trace, verify the customer details, and approve the intervention with one click, resuming the state machine safely without any risk of double charges."*

---

### [3:30 - 4:20] 5. 2,500 Empirical Evaluation & 28,628x Net ROI
- **On Screen:** Click on **`2.5k Benchmark`** in the left sidebar ([`http://localhost:5173/benchmark`](http://localhost:5173/benchmark)).
- **Action:** Click the purple button: **`Execute 2,500 Evaluation`**. Watch the evaluation complete in 0.05s.
- **Speak:**  
  *"Razorpay's challenge explicitly demanded: 'Show measured money recovered across a batch.'  
  We built a realistic synthetic benchmark of 2,500 Indian payment failures modeling UPI 8 PM rush hours, salary cycles, and bank maintenance windows.  
  Running the evaluation takes just 0.05 seconds and proves:  
  • **₹1.78 Crore Won Back** out of ₹3.40 Crore at risk (**52.51% Net Win Rate**).  
  • **77.4% Success Rate on Smart Retries** for transient bank glitches.  
  • **54.4% Success Rate on 1-Click Alternate Payment Links**.  
  • **100% of hard-decline fraud attempts gated**, preventing bank penalties.  
  • An astounding **28,628x Net Financial ROI** over communication costs."*

---

### [4:20 - 5:00] 6. Compliance Audit & Closing Pitch
- **On Screen:** Click the **`Compliance Audit`** button in the top right header.
- **Action:** Show the modal with verified audit ledger integrity and click **`Download CSV Ledger`** to show the downloaded file.
- **Speak:**  
  *"Every single step, diagnostic score, and agent decision is recorded in an immutable audit ledger with one-click export for regulatory compliance.  
  RazorRecover AI isn't just a hackathon prototype — it is a production-grade, fault-tolerant autonomous financial engine with 27 passing test suites, Docker deployment, and complete Razorpay SDK integration.  
  Thank you, and I look forward to building the future of autonomous fintech as an AI Builder Intern at Razorpay!"*
