"""MediVault Medical Reports API Routes.

Provides endpoints for listing reports (GET /api/reports), retrieving report metadata
(GET /api/reports/{report_id}), multipart report upload (POST /api/reports/upload),
and authenticated document streaming (GET /api/reports/{report_id}/download).
"""

from datetime import datetime
import os
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import MedicalReport, PatientProfile, User
from backend.app.routes.auth import get_current_user
from backend.app.schemas.report import MedicalReportResponse

router = APIRouter(prefix="/api/reports", tags=["Medical Reports"])


@router.get("", response_model=List[MedicalReportResponse])
def list_reports(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List medical reports for the current patient or filtered by patient_id."""
    query = db.query(MedicalReport)

    if patient_id:
        query = query.filter(MedicalReport.patient_id == patient_id)
    elif current_user.role == "patient" and current_user.patient_id:
        query = query.filter(MedicalReport.patient_id == current_user.patient_id)

    reports = query.order_by(MedicalReport.created_at.desc()).all()
    return [MedicalReportResponse.model_validate(r) for r in reports]


@router.get("/{report_id}", response_model=MedicalReportResponse)
def get_report_metadata(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve detailed metadata for a specific medical report."""
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found",
        )
    return MedicalReportResponse.model_validate(report)


@router.post("/upload", response_model=MedicalReportResponse, status_code=status.HTTP_201_CREATED)
async def upload_medical_report(
    file: UploadFile = File(...),
    title: str = Form(...),
    report_type: str = Form("Lab Report"),
    doctor_name: Optional[str] = Form(None),
    patient_id: Optional[str] = Form(None),
    is_sensitive: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a synthetic medical report, prescription, or lab document to lab-data/uploads/."""
    target_patient_id = patient_id or current_user.patient_id or "PAT-DEMO-001"

    # Check for linked patient profile
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.patient_id == target_patient_id)
        .first()
    )
    patient_profile_id = profile.id if profile else None

    # Destination directory
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    # Sanitize and unique filename
    raw_name = os.path.basename(file.filename or f"report_{uuid.uuid4().hex[:6]}.pdf")
    unique_prefix = uuid.uuid4().hex[:8]
    stored_filename = f"{unique_prefix}_{raw_name}"
    target_filepath = os.path.join(upload_dir, stored_filename)

    # Read and write file
    content = await file.read()
    file_size = len(content)

    with open(target_filepath, "wb") as f:
        f.write(content)

    # Persist report entity
    report = MedicalReport(
        patient_id=target_patient_id,
        patient_profile_id=patient_profile_id,
        user_id=current_user.id,
        title=title.strip(),
        report_type=report_type.strip(),
        doctor_name=doctor_name.strip() if doctor_name else "MediVault Diagnostics",
        file_path=target_filepath.replace("\\", "/"),
        file_name=raw_name,
        file_size=file_size,
        mime_type=file.content_type or "application/pdf",
        is_sensitive=is_sensitive,
        created_at=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return MedicalReportResponse.model_validate(report)


@router.get("/{report_id}/download")
def download_medical_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Stream stored synthetic medical report file."""
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found",
        )

    if not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stored document file missing from disk",
        )

    return FileResponse(
        path=report.file_path,
        filename=report.file_name,
        media_type=report.mime_type or "application/pdf",
    )
