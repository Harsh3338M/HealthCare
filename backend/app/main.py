"""MediVault FastAPI Application Entry Point.

Provides core healthcare REST endpoints, CORS middleware, and dynamic
mode inspection/toggling (LAB_VULNERABLE vs. LAB_REMEDIATED).
"""

from typing import Literal, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.app.config import settings
from backend.app.routes.auth import router as auth_router
from backend.app.routes.patients import router as patients_router
from backend.app.routes.reports import router as reports_router
from backend.app.routes.staff import router as staff_router

app = FastAPI(
    title="MediVault Healthcare API",
    description="Educational Healthcare Privacy & Security Lab Prototype (Synthetic Data Only)",
    version="1.0.0",
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(reports_router)
app.include_router(staff_router)


class ModeToggleRequest(BaseModel):
    mode: Optional[Literal["LAB_VULNERABLE", "LAB_REMEDIATED"]] = None
    app_mode: Optional[Literal["LAB_VULNERABLE", "LAB_REMEDIATED"]] = None


@app.get("/")
def root():
    """Root metadata endpoint."""
    return {
        "service": "MediVault Healthcare API",
        "status": "online",
        "app_mode": settings.APP_MODE,
        "disclaimer": "Synthetic Hackathon Demonstration Only",
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint indicating API availability and current lab mode."""
    return {
        "status": "ok",
        "app_mode": settings.APP_MODE,
    }


@app.get("/api/mode")
def get_lab_mode():
    """Retrieve current security and privacy lab mode."""
    return {
        "status": "ok",
        "app_mode": settings.APP_MODE,
    }


@app.post("/api/mode")
def set_or_toggle_lab_mode(payload: Optional[ModeToggleRequest] = None):
    """Toggle or explicitly set the active lab mode between LAB_VULNERABLE and LAB_REMEDIATED."""
    target_mode = None
    if payload:
        target_mode = payload.mode or payload.app_mode

    if target_mode:
        if target_mode not in ("LAB_VULNERABLE", "LAB_REMEDIATED"):
            raise HTTPException(status_code=400, detail="Invalid mode specified.")
        settings.APP_MODE = target_mode
    else:
        # Toggle between modes
        settings.APP_MODE = (
            "LAB_REMEDIATED" if settings.APP_MODE == "LAB_VULNERABLE" else "LAB_VULNERABLE"
        )

    return {
        "status": "ok",
        "app_mode": settings.APP_MODE,
    }
