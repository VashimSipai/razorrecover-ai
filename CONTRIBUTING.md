# Contributing to RazorRecover AI 🤝

Thank you for your interest in contributing to **RazorRecover AI**! We welcome contributions to help make autonomous revenue recovery safer, faster, and more resilient.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/razorrecover-ai.git
   cd razorrecover-ai
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🧪 Running Tests & Verifications

Before submitting a Pull Request, ensure all automated tests pass:

```bash
# 1. Run backend unit & integration tests
pytest backend/tests/ -v

# 2. Run batch empirical recovery benchmark
python -m backend.app.data.benchmark_eval

# 3. Test frontend build
cd frontend && npm run build
```

---

## 🌿 Branching & Commit Conventions

- **Branch Naming:**
  - `feat/feature-name` for new recovery strategies or agent tools
  - `fix/bug-name` for error classification or policy gate bug fixes
  - `docs/doc-name` for documentation updates
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add WhatsApp interactive recovery template`
  - `fix: handle null error_source on UPI timeout`
  - `docs: update system architecture diagram`

---

## 🛡️ Core Safety Invariant

When contributing code to the engine, remember the system's foundational principle:
> **LLM ≠ Money Mover**: The AI agent reasons and diagnoses, but the deterministic Policy Gate (`policy_gate.py`) decides and executes. Never bypass the policy gate before calling financial APIs.
