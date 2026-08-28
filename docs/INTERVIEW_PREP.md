# RazorRecover AI — Razorpay AI Builder Intern Interview Q&A Cheatsheet 🎯

> **Target Role:** AI Builder Intern (Razorpay Bangalore)  
> **Use this guide to confidently explain your project, architecture, safety model, and competitive advantages during the panel interview.**

---

### ❓ Q1: What problem does RazorRecover AI solve, and why does it matter to Razorpay?
**Answer:**  
*"In digital commerce across India, between 15% and 30% of all payment attempts fail. These failures occur due to transient bank server timeouts during evening peak UPI hours (7–10 PM), single-transaction credit limit exhaustion, or customer drop-offs at the 3DS/OTP authentication screen.*  
*Currently, merchants either do nothing (losing the sale) or run 'dumb retries' that spam the bank and cause customer fatigue and card network penalties.*  
*RazorRecover AI is an autonomous, policy-bounded revenue recovery engine that intercepts failed payments in real-time, diagnoses the root cause, calculates a contextual recovery probability, and executes safe recovery actions (such as automated smart retries or 1-click WhatsApp alternate payment links) to recapture lost revenue."*

---

### ❓ Q2: Why did you use a LangGraph Multi-Agent State Machine instead of a simple LLM prompt?
**Answer:**  
*"A single LLM prompt in a loop has three fatal flaws in production fintech:*
1. *Zero Determinism & State Loss: If a worker crashes mid-recovery, the transaction state is lost.*
2. *Hallucination of Financial Actions: A conversational prompt cannot reliably guarantee regulatory and business limits.*
3. *Lack of Specialization: Diagnosis, mathematical probability scoring, and safety policy validation require different computational heuristics.*

*With LangGraph, we built a 5-node Supervisor State Machine:*
- *Node 1: Classifier (Maps 20+ Razorpay error codes into 5 canonical categories)*
- *Node 2: Scorer (Computes recovery probability factoring time decay, salary cycles, attempt fatigue)*
- *Node 3: Strategist (Formulates optimal recovery strategy & reasoning)*
- *Node 4: Policy Gate (Deterministic hard check — zero LLM)*
- *Node 5: Executor (Dispatches to Razorpay SDK & immutable audit log)*  
*With `SqliteSaver` checkpointers, transactions survive server reboots and can pause mid-flight for human authorization."*

---

### ❓ Q3: What is the core safety invariant in your system? How do you prevent double-charging or wrong amounts?
**Answer:**  
*"We enforce a strict architectural invariant: **The LLM reasons and plans, but a 100% Deterministic Policy Gate decides and executes** (`LLM ≠ Money Mover`).*  
*The LLM never calls the Razorpay API directly. Instead, it outputs a structured recommendation that MUST pass our hardcoded Policy Gate:*
- *Strict attempt ceiling (Max 3 retries).*
- *Minimum 24-hour cooldown between attempts.*
- *Hard declines (e.g., `GATEWAY_ERROR_CARD_BLOCKED`) are permanently banned from retries to prevent risk penalties.*
- *High-value orders (≥ ₹50,000) automatically pause for human operator authorization."*

---

### ❓ Q4: How is your solution specifically tailored to the Indian Payment Ecosystem?
**Answer:**  
*"Unlike global US-centric tools that only handle recurring credit cards, RazorRecover AI is built around Indian payment realities:*
1. *UPI Evening Rush Hours (7 PM – 10 PM): Instead of retrying immediately during peak bank downtime, the engine schedules retries for off-peak hours.*
2. *Indian Salary Cycle Spikes (1st & 30th of month): The scorer boosts recovery probability for balance-related soft declines around paydays.*
3. *RBI 48-Hour Mandate Rule: For e-NACH/UPI Autopay mandate drops, secondary presentation is delayed strictly by 48 hours to remain 100% compliant with RBI recurring guidelines."*

---

### ❓ Q5: How does RazorRecover AI compare to global products like Stripe Smart Retries or Butter Payments?
**Answer:**  
*"Stripe Smart Retries and Butter Payments rely on 'silent card-on-file retries' without customer intervention. This only works in the US and Europe where 2FA is not enforced.*  
*In India, where RBI mandates Two-Factor Authentication (OTP/3DS) and 75%+ of volume is UPI, silent card retries fail completely.*  
*RazorRecover AI bridges this gap by combining automated background retries for transient gateway glitches with **1-Click Alternate Payment Links delivered via WhatsApp nudges** for customer-side drop-offs."*

---

### ❓ Q6: What happens if Gemini API experiences downtime or high latency?
**Answer:**  
*"We implemented a **Dual-Engine Circuit Breaker with a 3.0-second timeout** (`circuit_breaker.py`).*  
*If the cloud LLM is slow or encounters a 429 rate limit, the circuit breaker automatically diverts execution to our local deterministic rule engine in < 15ms. The merchant experiences 99.99% uptime with zero payment drops."*

---

### ❓ Q7: How did you prove your system works empirically?
**Answer:**  
*"We generated a realistic benchmark dataset of **2,500 Indian payment failures** modeling real Razorpay error codes and ran a batch empirical evaluation:*
- *Gross Revenue at Risk: **₹3.41 Crore***
- *Net Revenue Won Back: **₹1.78 Crore (52.51% Net Recovery Rate)***
- *Smart Retry Win Rate: **77.4%***
- *Payment Link Win Rate: **54.4%***
- *Net ROI Multiple: **28,628x** over communication costs.*
- *Evaluation runtime: **0.05 seconds** for 2,500 records."*

---

### ❓ Q8: How does Human-in-the-Loop (HITL) work in your application?
**Answer:**  
*"When a payment amount is ≥ ₹50,000 (5,000,000 paise), the LangGraph supervisor pauses execution at the `policy_gate` node using `interrupt()`. The state is persisted in SQLite, and the transaction is queued in the **Approval Queue**.*  
*A merchant operator opens the interactive modal on the dashboard, reviews the agent's diagnostic reasoning, and clicks **Approve**, **Modify Plan**, or **Reject**. Upon approval, the state machine resumes from its exact checkpoint and generates the recovery resource."*

---

### ❓ Q9: What are the exact Razorpay API resources you integrate with?
**Answer:**  
*"We use the official **Razorpay Python SDK** and Standard Checkout:*
1. *`client.order.create()` — Generates order IDs for Standard Checkout and scheduled smart retries.*
2. *`client.payment_link.create()` — Generates personalized 1-click recovery links with WhatsApp/SMS notify triggers.*
3. *`client.payment.fetch()` — Fetches payment diagnostic details and error codes.*
4. *`POST /api/webhooks/razorpay` — Ingests real-time `payment.failed` webhook events with signature verification."*

---

### ❓ Q10: How can the evaluation panel test this live right now?
**Answer:**  
*"1. Open **[http://localhost:5173/store](http://localhost:5173/store)** to experience our Live Checkout Store.*  
*2. Click **'Pay with Razorpay Modal'** to open the real Razorpay Checkout popup.*  
*3. Close the modal or simulate failure ➔ Watch the **Virtual Customer Smartphone buzz with a WhatsApp recovery link** on the right!*  
*4. Click **'Pay with UPI / 1-Click Link'** on the phone to complete recovery live.*  
*5. Click **'Compliance CSV'** in the header to download the tamper-evident audit ledger."*
