"""MediVault FastAPI Application Entry Point.

Provides core healthcare REST endpoints and CORS middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.auth import router as auth_router
from backend.app.routes.patients import router as patients_router
from backend.app.routes.privacy import router as privacy_router
from backend.app.routes.reports import router as reports_router
from backend.app.routes.staff import router as staff_router

app = FastAPI(
    title="MediVault Patient Portal API",
    description="MediVault Healthcare Patient & Staff Portal REST API",
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
app.include_router(privacy_router)
app.include_router(reports_router)
app.include_router(staff_router)


@app.get("/")
def root():
    """Root metadata endpoint."""
    return {
        "service": "MediVault Patient Portal API",
        "status": "online",
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint indicating API availability."""
    return {
        "status": "ok",
    }
