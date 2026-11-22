"""MediVault Staff Portal API Routes.

Provides endpoints for staff members to search and list patient records
(GET /api/staff/patients), inspect full clinical files (GET /api/staff/patients/{patient_id}),
and access specialized clinical histories (GET /api/staff/patients/{patient_id}/clinical).
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import AuditLog, PatientProfile, User
from backend.app.routes.auth import get_current_user
from backend.app.schemas.staff import (
    SecurityIncidentResponse,
    StaffAuditLogResponse,
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
    """List patient records with optional keyword search across profile fields."""
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
            aadhaar_ref=p.aadhaar_ref,
            ayushman_ref=p.ayushman_ref,
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


@router.get("/audit-logs", response_model=List[StaffAuditLogResponse])
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of log events to return"),
    current_user: User = Depends(require_staff_user),
    db: Session = Depends(get_db),
):
    """Retrieve operational security and access audit logs."""
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [StaffAuditLogResponse.model_validate(log) for log in logs]


# V12: Incomplete Breach-Response Workflow - Security incident detail view cannot correlate
# the alert to specific patient records accessed (audit entries lack target_resource_id)
# and offers no user notification workflow.
@router.get("/security/incidents/{incident_id}", response_model=SecurityIncidentResponse)
def get_security_incident_detail(
    incident_id: int,
    current_user: User = Depends(require_staff_user),
    db: Session = Depends(get_db),
):
    """V12: Retrieve security incident details showing uncorrelated patient records and missing notification workflow."""
    log = db.query(AuditLog).filter(AuditLog.id == incident_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Security incident '{incident_id}' not found",
        )

    # V12: Query correlated records by target_resource_id. Because audit entries for this
    # access sequence omit target_resource_id (None), 0 correlated records are found.
    correlated = []
    if log.target_resource_id:
        correlated = (
            db.query(PatientProfile.patient_id)
            .filter(PatientProfile.patient_id == log.target_resource_id)
            .all()
        )

    return SecurityIncidentResponse(
        id=log.id,
        incident_type=log.action,
        severity="High" if log.status == "BREACH_ALERT" else "Medium",
        description=log.details or "Security access alert detected.",
        timestamp=log.timestamp,
        actor_id=log.actor_id,
        ip_address=log.ip_address,
        target_resource_id=log.target_resource_id,
        correlated_records_count=len(correlated),
        affected_patients=[c[0] for c in correlated],
        notification_workflow_status="Unavailable: No notification dispatch channel configured",
        remediation_status="Pending manual investigation",
    )

