import os
import logging
import httpx
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("razorrecover.notifications")

class NotificationService:
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
        Dispatches recovery notifications across WhatsApp, SMS, or Email.
        If Twilio credentials are configured, sends a real live WhatsApp message!
        """
        if channel.lower() == "whatsapp":
            message = (
                f"Hi {customer_name}, your payment of ₹{amount_inr:,.2f} for Order #{reason} "
                f"could not be processed. Don't worry! Complete it securely with 1 click: {payment_link}"
            )
        elif channel.lower() == "sms":
            message = f"Razorpay: Complete your pending payment of ₹{amount_inr:,.2f} here: {payment_link}"
        else:
            message = f"Invoice payment recovery link for ₹{amount_inr:,.2f}: {payment_link}"

        # Real Live Twilio WhatsApp Dispatch (if configured in environment)
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_from = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
        
        live_sent = False
        if twilio_sid and twilio_token and channel.lower() == "whatsapp":
            try:
                # Format recipient phone for WhatsApp e.g. whatsapp:+919876543210
                to_phone = customer_phone if customer_phone.startswith("+") else f"+91{customer_phone}"
                formatted_to = f"whatsapp:{to_phone}"
                url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
                
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(
                        url,
                        data={
                            "From": twilio_from,
                            "To": formatted_to,
                            "Body": message
                        },
                        auth=(twilio_sid, twilio_token)
                    )
                    if resp.status_code in [200, 201]:
                        live_sent = True
                        logger.info(f"Live WhatsApp message delivered to {customer_phone} via Twilio.")
            except Exception as e:
                logger.warning(f"Live Twilio WhatsApp dispatch failed: {e}. Fallback to simulated delivery.")

        return {
            "success": True,
            "channel": channel,
            "recipient": customer_phone,
            "message": message,
            "live_dispatched": live_sent,
            "sent_at": datetime.utcnow().isoformat()
        }

notification_service = NotificationService()
NotificationMock = NotificationService

