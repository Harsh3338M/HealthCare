"""MediVault FastAPI Application Entry Point.

Provides core healthcare REST endpoints and CORS middleware.
"""

import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# V08: Sensitive Data in Application Logs — Request audit logger writes full
# request bodies, query parameters and Authorization headers to a local file
_audit_log_path = os.path.join(os.path.dirname(__file__), "..", "app.log")
_audit_logger = logging.getLogger("medivault.audit")
_audit_handler = logging.FileHandler(_audit_log_path)
_audit_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
_audit_logger.addHandler(_audit_handler)
_audit_logger.setLevel(logging.DEBUG)

from backend.app.config import settings
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

@app.middleware("http")
async def audit_request_logger(request: Request, call_next):
    """V08: Log every inbound request including sensitive headers and body."""
    query = str(request.query_params) if request.query_params else ""
    auth_header = request.headers.get("authorization", "")
    body = b""
    try:
        body = await request.body()
    except Exception:
        pass
    _audit_logger.debug(
        "method=%s path=%s query=%s authorization=%s body=%s",
        request.method,
        request.url.path,
        query,
        auth_header,
        body.decode("utf-8", errors="replace"),
    )
    response = await call_next(request)
    return response


# Ensure directory paths exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.BACKUP_DIR, exist_ok=True)

# V05: Publicly Reachable Documents & Backups - Static asset CDN paths mounted without authentication
app.mount("/public/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="public_uploads")
app.mount("/public/backups", StaticFiles(directory=settings.BACKUP_DIR), name="public_backups")

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
