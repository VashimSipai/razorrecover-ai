# RazorRecover AI — Autonomous Revenue Recovery Engine 🚀

> **Official Razorpay AI Buildathon Submission (Track 03: AI Revenue Recovery)**  
> **Author:** Mohamadvashim Manjurhushen Sipai (Vashim Sipai)  
> Stack: **FastAPI + LangGraph State Machines + Gemini 2.5 Flash + React (Vite) + Razorpay SDK**

[![CI & Evaluation](https://github.com/vashimsipai/razorrecover-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/vashimsipai/razorrecover-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-State_Machines-blue.svg)](https://langchain-ai.github.io/langgraph/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test_Mode_API-02042B.svg?logo=razorpay&logoColor=0C2340)](https://razorpay.com)

---

## 🎯 The Problem & The Bar

> *"Find revenue that's slipping away and win it back."* — **Razorpay Buildathon**

Revenue loss in modern digital commerce rarely happens in one clean step. A payment degrades due to gateway timeouts, an OTP drops off, card velocity limits are exceeded, or an autopay mandate fails. 

**Our Solution:** **RazorRecover AI** is an autonomous revenue recovery engine that intercepts failed payments, diagnoses the root cause using a multi-agent supervisor state machine, and executes bounded, policy-gated recovery interventions with full auditability.

---

## 🛡️ Key Architectural Highlights

1. **Safety-Gated LLM Architecture (LLM ≠ Money Mover):**
   - The LLM acts solely as the diagnostic and strategic *brain*.
   - A 100% deterministic **Policy Gate** enforces hard regulatory limits (max 3 retries, 24h cooldowns, ₹1,00,000 caps) before executing any Razorpay API call.
2. **LangGraph State Machine with Durable Checkpointers:**
   - Survives server reboots and network drops. Recovers state at the exact node where execution stopped.
3. **Interactive Human-in-the-Loop (HITL) Center:**
   - Transactions exceeding ₹50,000 or marked high-risk trigger an `interrupt()` node, presenting an **Approval Queue** on the merchant dashboard to *Approve*, *Modify*, or *Reject*.
4. **Dual-Model Circuit Breaker:**
   - 3.0s latency guard: If upstream LLM APIs experience rate limits, execution instantly falls back to deterministic heuristics for 99.99% uptime.
5. **Realistic Indian Payment Ecosystem Modeling:**
   - Benchmark evaluation over 2,500+ synthetic failures incorporating UPI peak evening traffic (7-10 PM), month-end salary credit shifts, and bank maintenance downtime windows.

---

## 🏗️ System Architecture

```
                                    ┌────────────────────────┐
                                    │ 🔴 Failed Payment Event │
                                    └───────────┬────────────┘
                                                │
                                                ▼
                                    ┌────────────────────────┐
                                    │ Failure Ingestion      │
                                    └───────────┬────────────┘
                                                │
                                                ▼
                                ┌────────────────────────────────┐
                                │ 🧠 Multi-Agent Supervisor       │
                                │   • Diagnostic Classifier Agent │
                                │   • Recovery Scorer Agent       │
                                │   • Strategy Recommender Agent  │
                                └────────────────┬───────────────┘
                                                │
                                                ▼
                                ┌────────────────────────────────┐
                                │ 🛡️ Deterministic Policy Gate   │
                                │    (Caps, Cooldowns, Limits)   │
                                └────────┬───────────────┬───────┘
                                         │               │
                             High Value (≥₹50k)          Approved
                                         │               │
                                         ▼               ▼
                                ┌────────────────┐ ┌────────────────┐
                                │ ⏸️ HITL Modal   │ │ ⚡ Dispatcher │
                                │ (Manual Review)│ │ (Razorpay SDK) │
                                └────────────────┘ └────────────────┘
```

---

## 📚 Technical Documentation

- 📘 [**System Architecture Blueprint**](docs/ARCHITECTURE.md) — Multi-agent supervisor pattern, sequence flows, and database models.
- 🧠 [**AI Agent Design & Safety Model**](docs/AI_AGENT_DESIGN.md) — Specialized agent roles, ReAct reasoning loops, and deterministic guardrails.
- 🔌 [**Razorpay API Mapping & Taxonomy**](docs/RAZORPAY_API_MAPPING.md) — 20+ Razorpay error codes mapped to recovery strategies.
- 📊 [**2,500 Empirical Benchmark Report**](docs/BENCHMARK_REPORT.md) — Measured ₹1.78 Cr won back, 52.51% net win rate, and 28,628x Net ROI.
- ❓ [**Technical Design Decisions & FAQ**](docs/FAQ.md) — Comprehensive architectural Q&A.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+
- Razorpay Test Account ([dashboard.razorpay.com](https://dashboard.razorpay.com))
- Google AI Studio Key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Configure
```bash
git clone https://github.com/vashimsipai/razorrecover-ai.git
cd razorrecover-ai

# Copy environment template
cp backend/.env.example backend/.env
# Add your optional RAZORPAY_KEY_ID and GOOGLE_API_KEY to backend/.env
```

### 2. Setup & Seed Database
```bash
make setup
make seed
```

### 3. Run Development Servers
```bash
# Terminal 1: FastAPI Backend
make dev-backend
# → API & Interactive Swagger Docs: http://localhost:8000/docs

# Terminal 2: React Vite Frontend
make dev-frontend
# → React Command Center: http://localhost:5173
```

---

### 🐳 Run with Docker (One-Command Launch)

You can spin up the entire system with Docker Compose:

```bash
docker compose up --build
```
- **React Frontend:** [`http://localhost:5173`](http://localhost:5173)
- **FastAPI Backend & Interactive Swagger API Docs:** [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

## 📊 Evaluation & Empirical Benchmarks

Run the benchmark evaluation over 2,500 transactions:
```bash
make benchmark
```
Outputs precision, recall, false-intervention rates, and net ₹ recovered across all recovery strategies.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
