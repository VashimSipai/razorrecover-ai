from datetime import datetime
from typing import Dict, Any

class NotificationMock:
    def send_recovery_nudge(
        self,
        channel: str,
        customer_name: str,
        customer_phone: str,
        amount_inr: float,
        payment_link: str,
        reason: str = "Payment Retry"
    ) -> Dict[str, Any]:
        """
        Simulates customer engagement notification dispatch across WhatsApp, SMS, or Email.
        """
        if channel.lower() == "whatsapp":
            message = (
                f"Hi {customer_name}, your payment of ₹{amount_inr:,.2f} for order #{reason} "
                f"could not be processed. Don't worry! You can complete it securely with 1 click: {payment_link}"
            )
        elif channel.lower() == "sms":
            message = f"Razorpay: Complete your pending payment of ₹{amount_inr:,.2f} here: {payment_link}"
        else:
            message = f"Invoice payment recovery link for ₹{amount_inr:,.2f}: {payment_link}"

        return {
            "success": True,
            "channel": channel,
            "recipient": customer_phone,
            "message": message,
            "sent_at": datetime.utcnow().isoformat()
        }

notification_service = NotificationMock()
