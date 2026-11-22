"""MediVault Staff Portal API Routes.

Provides endpoints for staff members to search and list synthetic patient records
(GET /api/staff/patients), inspect full clinical files (GET /api/staff/patients/{patient_id}),
and access specialized clinical histories (GET /api/staff/patients/{patient_id}/clinical).
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import AuditLog, PatientProfile, User
from backend.app.routes.auth import get_current_user
from backend.app.schemas.staff import (
    StaffClinicalRecordResponse,
    StaffPatientDetailResponse,
    StaffPatientListItem,
)

router = APIRouter(prefix="/api/staff", tags=["Staff Portal"])

STAFF_ROLES = {"staff_basic", "staff_clinical", "admin_dpo"}


def require_staff_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency ensuring that the authenticated user possesses staff privileges."""
    if current_user.role not in STAFF_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Staff privileges required",
        )
    return current_user


@router.get("/patients", response_model=List[StaffPatientListItem])
def list_patients(
    search: Optional[str] = Query(None, description="Search by name, patient ID, email, or phone"),
    current_user: User = Depends(require_staff_user),
    db: Session = Depends(get_db),
):
    """List synthetic patient records with optional keyword search across profile fields."""
    query = db.query(PatientProfile)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PatientProfile.full_name.ilike(term),
                PatientProfile.patient_id.ilike(term),
                PatientProfile.phone.ilike(term),
                PatientProfile.email.ilike(term),
            )
        )

    patients = query.order_by(PatientProfile.id.asc()).all()

    return [
        StaffPatientListItem(
            id=p.id,
            patient_id=p.patient_id,
            user_id=p.user_id,
            full_name=p.full_name,
            date_of_birth=p.date_of_birth,
            gender=p.gender,
            phone=p.phone,
            email=p.email,
            blood_group=p.blood_group,
            allergies=p.allergies,
            conditions=p.conditions,
            aadhaar_demo_ref=p.aadhaar_demo_ref,
            ayushman_demo_ref=p.ayushman_demo_ref,
            is_active=p.is_active,
            reports_count=len(p.reports) if p.reports else 0,
            created_at=p.created_at,
        )
        for p in patients
    ]


@router.get("/patients/{patient_id}", response_model=StaffPatientDetailResponse)
def get_patient_record(
    patient_id: str,
    current_user: User = Depends(require_staff_user),
    db: Session = Depends(get_db),
):
    """Inspect comprehensive clinical record, vitals, identity references, and reports for a patient."""
    patient = (
        db.query(PatientProfile)
        .filter(PatientProfile.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record '{patient_id}' not found",
        )

    # Record access in AuditLog
    audit = AuditLog(
        actor_id=current_user.patient_id or str(current_user.id),
        actor_email=current_user.email,
        action="VIEW_PATIENT_RECORD",
        endpoint=f"/api/staff/patients/{patient_id}",
        target_resource_id=patient_id,
        status="SUCCESS",
    )
    db.add(audit)
    db.commit()

    return StaffPatientDetailResponse.model_validate(patient)


@router.get("/patients/{patient_id}/clinical", response_model=StaffClinicalRecordResponse)
def get_patient_clinical_history(
    patient_id: str,
    current_user: User = Depends(require_staff_user),
    db: Session = Depends(get_db),
):
    """Retrieve restricted clinical history and confidential physician notes."""
    # In LAB_REMEDIATED mode, enforce strict RBAC: only clinical doctors and DPOs can view
    if settings.APP_MODE == "LAB_REMEDIATED" and current_user.role not in ("staff_clinical", "admin_dpo"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Clinical staff or DPO role required to view confidential clinical notes",
        )

    patient = (
        db.query(PatientProfile)
        .filter(PatientProfile.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record '{patient_id}' not found",
        )

    return StaffClinicalRecordResponse.model_validate(patient)
