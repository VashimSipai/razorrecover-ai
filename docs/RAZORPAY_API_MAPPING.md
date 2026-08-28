# Razorpay API Integration & Error Code Mapping 💳

## 1. Test Mode Integration
All API operations utilize Razorpay Test Mode (`rzp_test_` keys).

```python
import razorpay

client = razorpay.Client(auth=("rzp_test_YOUR_KEY", "rzp_test_YOUR_SECRET"))
```

---

## 2. API Endpoints Used

| Razorpay Resource | Method | SDK Function | Purpose in Recovery Pipeline |
|---|---|---|---|
| **Payment Links** | `POST` | `client.payment_link.create(data)` | 1-Click Alternate Payment Method link with WhatsApp nudge |
| **Payments** | `GET` | `client.payment.fetch(payment_id)` | Diagnostic fetch of error codes and customer context |
| **Orders** | `POST` | `client.order.create(data)` | Smart Retry order creation after cooldown window |
| **Webhooks** | `POST` | FastAPI `/api/webhooks/razorpay` | Real-time `payment.failed` event listener |

---

## 3. Real Razorpay Error Codes Supported

| Error Code | Source | Diagnostic Category | Optimal Recovery Action |
|---|---|---|---|
| `BAD_REQUEST_PAYMENT_TIMED_OUT` | gateway | `transient` | Smart Retry Order (4h delay) |
| `GATEWAY_ERROR` | gateway | `transient` | Smart Retry Order (4h delay) |
| `GATEWAY_ERROR_INSUFFICIENT_FUNDS` | customer | `soft_decline` | Payment Link (Alternate Account) |
| `GATEWAY_ERROR_TRANSACTION_LIMIT_EXCEEDED` | customer | `soft_decline` | Payment Link (Split or Card change) |
| `AUTHENTICATION_FAILED_3DS` | customer | `auth_failure` | 1-Click Payment Link Nudge |
| `BAD_REQUEST_PAYMENT_CANCELLED_BY_CUSTOMER` | customer | `auth_failure` | Payment Link with 5% Discount |
| `GATEWAY_ERROR_CARD_BLOCKED` | customer | `hard_decline` | Permanent Retry Block (Escalate) |
| `BAD_REQUEST_CARD_INVALID` | customer | `hard_decline` | Permanent Retry Block (Escalate) |
| `MANDATE_EXECUTION_FAILED` | gateway | `mandate` | Mandate Retry Presentation (48h delay) |
