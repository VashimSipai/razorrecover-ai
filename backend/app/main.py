from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db

# Import API Routers
from app.api.routes_recovery import router as recovery_router
from app.api.routes_webhooks import router as webhooks_router
from app.api.routes_approvals import router as approvals_router
from app.api.routes_transactions import router as transactions_router
from app.api.routes_policies import router as policies_router
from app.api.routes_simulator import router as simulator_router
from app.api.routes_benchmark import router as benchmark_router
from app.api.routes_analytics import router as analytics_router

# Configure logger
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("razorrecover")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing RazorRecover AI Engine...")
    await init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down RazorRecover AI Engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Revenue Recovery Engine with LangGraph State Machines & Deterministic Guardrails",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(recovery_router, prefix="/api")
app.include_router(webhooks_router, prefix="/api")
app.include_router(approvals_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(policies_router, prefix="/api")
app.include_router(simulator_router, prefix="/api")
app.include_router(benchmark_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "gemini_model": settings.GEMINI_MODEL,
        "circuit_breaker": "active"
    }
