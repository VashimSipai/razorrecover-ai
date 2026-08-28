from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    # App config
    PROJECT_NAME: str = "RazorRecover AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./recovery.db"
    SYNC_DATABASE_URL: str = "sqlite:///./recovery.db"
    
    # Razorpay Test API
    RAZORPAY_KEY_ID: str = "rzp_test_mock_key"
    RAZORPAY_KEY_SECRET: str = "mock_secret"
    RAZORPAY_WEBHOOK_SECRET: str = "mock_webhook_secret"
    
    # Google Gemini AI
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # LangSmith Tracing
    LANGSMITH_TRACING: bool = False
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "razorrecover-ai"
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"
    
    # Policy Guardrails Defaults
    MAX_RETRIES_PER_TXN: int = 3
    COOLDOWN_HOURS: int = 24
    HIGH_VALUE_HITL_THRESHOLD_INR: int = 50000
    MIN_RECOVERY_PROBABILITY: float = 0.15
    MAX_DISCOUNT_PERCENT: int = 5
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
