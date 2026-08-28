## 📋 Description of Changes
Please provide a brief summary of the changes introduced in this pull request and the rationale behind them.

## 🛡️ Safety & Policy Containment Check
- [ ] Confirmed that all financial actions route through `policy_gate.py` (`LLM ≠ Money Mover`).
- [ ] Confirmed that hard declines remain non-retryable.
- [ ] Confirmed that max 3 retries and cooldown limits are respected.

## 🧪 Verification & Testing
- [ ] Ran `pytest backend/tests/ -v` (All automated tests pass).
- [ ] Ran `python -m backend.app.data.benchmark_eval` (Benchmark passes).
- [ ] Tested frontend production build (`npm run build`).

## 📸 Screenshots / Diagrams (if applicable)
Add screenshots of UI changes or Mermaid flow diagrams if applicable.
