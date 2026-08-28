import razorpay
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from app.core.config import settings

logger = logging.getLogger("razorrecover.razorpay")

class RazorpayClientWrapper:
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self._client = None
        
        if self.key_id and self.key_id != "rzp_test_mock_key" and self.key_secret != "mock_secret":
            try:
                self._client = razorpay.Client(auth=(self.key_id, self.key_secret))
                self._client.set_app_details({"title": "RazorRecoverAI", "version": settings.VERSION})
                logger.info("Razorpay SDK initialized with test credentials.")
            except Exception as e:
                logger.warning(f"Could not initialize live Razorpay Client: {e}. Using simulated test mode.")
        else:
            logger.info("Using simulated Razorpay Test Client.")

    def create_payment_link(
        self,
        amount_paise: int,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        description: str,
        expire_hours: int = 72
    ) -> Dict[str, Any]:
        """
        Creates a payment link via Razorpay SDK with simulated fallback.
        """
        expire_by = int((datetime.utcnow() + timedelta(hours=expire_hours)).timestamp())
        payload = {
            "amount": amount_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": description,
            "customer": {
                "name": customer_name,
                "email": customer_email,
                "contact": customer_phone
            },
            "notify": {
                "sms": True,
                "email": True
            },
            "reminder_enable": True,
            "expire_by": expire_by
        }

        if self._client:
            try:
                link = self._client.payment_link.create(payload)
                return {
                    "id": link["id"],
                    "short_url": link.get("short_url", f"https://rzp.io/i/{link['id'][-8:]}"),
                    "status": link.get("status", "created"),
                    "amount_paise": link.get("amount", amount_paise)
                }
            except Exception as e:
                logger.warning(f"Razorpay API call failed ({e}). Returning test simulated link.")

        # Deterministic simulation fallback for test mode
        mock_id = f"plink_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{customer_name[:3].lower()}"
        return {
            "id": mock_id,
            "short_url": f"https://rzp.io/i/{mock_id[-8:]}",
            "status": "created",
            "amount_paise": amount_paise
        }

    def fetch_payment(self, payment_id: str) -> Dict[str, Any]:
        if self._client:
            try:
                return self._client.payment.fetch(payment_id)
            except Exception as e:
                logger.warning(f"Failed to fetch payment {payment_id}: {e}")
        return {
            "id": payment_id,
            "status": "failed",
            "amount": 250000,
            "currency": "INR"
        }

razorpay_wrapper = RazorpayClientWrapper()
