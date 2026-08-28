# Security Policy 🛡️

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## 🔒 Financial Safety & AI Guardrails

RazorRecover AI is designed with deterministic policy boundaries to protect merchant revenue and prevent double-charging or unauthorized API invocations:
- **LLM Containment:** Upstream LLMs cannot trigger Razorpay API calls without passing through the deterministic Policy Gate.
- **Audit Logging:** Every classification, probability score, policy decision, and API action is recorded in an immutable audit ledger.
- **Human-in-the-Loop:** Transactions $\ge$ ₹50,000 automatically pause for manual human authorization.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or bug in the safety policy engine, please follow responsible disclosure guidelines:

1. **Do not create a public issue.**
2. Send an email describing the vulnerability, steps to reproduce, and impact to the maintainer.
3. We will acknowledge receipt within 48 hours and provide an estimated timeline for remediation.
