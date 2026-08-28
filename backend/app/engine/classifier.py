import os
import json
from typing import Dict, Any, Optional
from app.schemas.agent_output import FailureClassificationResult

class FailureClassifier:
    def __init__(self):
        self._taxonomy = self._load_taxonomy()

    def _load_taxonomy(self) -> Dict[str, Any]:
        tax_path = os.path.join(os.path.dirname(__file__), "../data/failure_taxonomy.json")
        with open(tax_path, "r") as f:
            return json.load(f)

    def _normalize_category(self, raw_cat: str) -> str:
        cat_map = {
            "authentication_failure": "auth_failure",
            "mandate_failure": "mandate",
            "transient": "transient",
            "soft_decline": "soft_decline",
            "hard_decline": "hard_decline"
        }
        return cat_map.get(raw_cat.lower(), raw_cat.lower())

    def classify(self, error_code: str, error_source: str = "gateway", error_reason: Optional[str] = None) -> FailureClassificationResult:
        categories = self._taxonomy.get("categories", {})
        
        # Exact match in taxonomy codes
        for cat_key, cat_data in categories.items():
            for code_entry in cat_data.get("codes", []):
                if code_entry["code"].upper() == error_code.upper():
                    severity = "high" if not cat_data["retry_safe"] else "low" if cat_data["base_recovery_probability"] > 0.7 else "medium"
                    normalized_cat = self._normalize_category(cat_key)
                    return FailureClassificationResult(
                        category=normalized_cat,
                        retry_safe=cat_data["retry_safe"],
                        root_cause_summary=error_reason or code_entry.get("reason", cat_data["description"]),
                        error_severity=severity
                    )

        # Heuristic fallback matching for unmapped or generic error codes
        code_upper = error_code.upper()
        if any(keyword in code_upper for keyword in ["TIMEOUT", "TIMED_OUT", "GATEWAY", "NETWORK", "504", "502"]):
            return FailureClassificationResult(
                category="transient",
                retry_safe=True,
                root_cause_summary=error_reason or "Temporary network latency or gateway timeout",
                error_severity="low"
            )
        elif any(keyword in code_upper for keyword in ["FUNDS", "BALANCE", "LIMIT", "INSUFFICIENT"]):
            return FailureClassificationResult(
                category="soft_decline",
                retry_safe=True,
                root_cause_summary=error_reason or "Customer account balance or transaction velocity limit exceeded",
                error_severity="medium"
            )
        elif any(keyword in code_upper for keyword in ["OTP", "AUTH", "3DS", "CANCELLED", "ABANDONED"]):
            return FailureClassificationResult(
                category="auth_failure",
                retry_safe=False,
                root_cause_summary=error_reason or "Customer authentication friction or checkout abandonment",
                error_severity="medium"
            )
        elif any(keyword in code_upper for keyword in ["CARD", "BLOCKED", "FRAUD", "RISK", "INVALID", "EXPIRED"]):
            return FailureClassificationResult(
                category="hard_decline",
                retry_safe=False,
                root_cause_summary=error_reason or "Instrument security block, expired card, or issuer risk rejection",
                error_severity="high"
            )
        elif any(keyword in code_upper for keyword in ["MANDATE", "AUTOPAY", "RECURRING", "NACH"]):
            return FailureClassificationResult(
                category="mandate",
                retry_safe=True,
                root_cause_summary=error_reason or "Autopay recurring mandate presentation failed",
                error_severity="medium"
            )

        # Default catch-all
        return FailureClassificationResult(
            category="transient",
            retry_safe=True,
            root_cause_summary=error_reason or f"Unclassified error code ({error_code}) - default transient review",
            error_severity="medium"
        )

classifier = FailureClassifier()
