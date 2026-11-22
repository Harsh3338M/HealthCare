"""MediVault Privacy & Consent Management API Routes.

Provides endpoints for managing patient consent preferences (GET/POST /api/privacy/consent),
submitting data principal rights requests (POST /api/privacy/rights-request), and
filing privacy grievances with the Data Protection Officer (POST /api/privacy/grievance).
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import AuditLog, ConsentRecord, PatientProfile, User
from backend.app.routes.auth import get_current_user
from backend.app.schemas.privacy import (
    AccountDeletionResponse,
    ConsentItemResponse,
    ConsentUpdateRequest,
    GrievancePayload,
    GrievanceResponse,
    RightsRequestPayload,
    RightsRequestResponse,
)

router = APIRouter(prefix="/api/privacy", tags=["Privacy & Consent"])

DEFAULT_CONSENT_PURPOSES = [
    {
        "purpose": "clinical_care",
        "description": "Consent to store and process health data for medical care delivery and diagnostic consultations",
        "is_granted": True,
    },
    {
        "purpose": "third_party_sharing",
        "description": "Consent to share diagnostic records with accredited laboratory and hospital networks",
        "is_granted": False,
    },
    {
        "purpose": "analytics_research",
        "description": "Consent to process de-identified health metrics for clinical quality improvement and healthcare analysis",
        "is_granted": False,
    },
    {
        "purpose": "telehealth_communications",
        "description": "Consent to receive electronic clinical notices, appointment reminders, and care follow-ups",
        "is_granted": True,
    },
]


def _ensure_default_consents(db: Session, user: User, patient_id: str) -> List[ConsentRecord]:
    """Ensure baseline consent choices are initialized for the patient if none exist."""
    existing = (
        db.query(ConsentRecord)
        .filter(ConsentRecord.patient_id == patient_id)
        .all()
    )
    if existing:
        return existing

    new_records = []
    for default in DEFAULT_CONSENT_PURPOSES:
        record = ConsentRecord(
            user_id=user.id,
            patient_id=patient_id,
            purpose=default["purpose"],
            description=default["description"],
            is_granted=default["is_granted"],
            version="1.0",
            granted_at=datetime.utcnow(),
        )
        db.add(record)
        new_records.append(record)

    db.commit()
    for r in new_records:
        db.refresh(r)
    return new_records


@router.get("/consent", response_model=List[ConsentItemResponse])
def get_consent_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve patient consent preferences and data processing choices."""
    patient_id = current_user.patient_id or f"USR-{current_user.id}"
    consents = _ensure_default_consents(db, current_user, patient_id)
    return [ConsentItemResponse.model_validate(c) for c in consents]


@router.post("/consent", response_model=List[ConsentItemResponse])
def update_consent_preference(
    payload: ConsentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update or toggle a specific patient consent preference."""
    patient_id = current_user.patient_id or f"USR-{current_user.id}"
    _ensure_default_consents(db, current_user, patient_id)

    record = (
        db.query(ConsentRecord)
        .filter(
            ConsentRecord.patient_id == patient_id,
            ConsentRecord.purpose == payload.purpose,
        )
        .first()
    )

    if record:
        record.is_granted = payload.is_granted
        if payload.description:
            record.description = payload.description
        if not payload.is_granted:
            record.revoked_at = datetime.utcnow()
        else:
            record.revoked_at = None
            record.granted_at = datetime.utcnow()
    else:
        record = ConsentRecord(
            user_id=current_user.id,
            patient_id=patient_id,
            purpose=payload.purpose,
            description=payload.description or f"Consent for {payload.purpose}",
            is_granted=payload.is_granted,
            version="1.0",
            granted_at=datetime.utcnow() if payload.is_granted else datetime.utcnow(),
            revoked_at=datetime.utcnow() if not payload.is_granted else None,
        )
        db.add(record)

    # Log audit event
    audit = AuditLog(
        actor_id=patient_id,
        actor_email=current_user.email,
        action="UPDATE_CONSENT",
        endpoint="/api/privacy/consent",
        target_resource_id=payload.purpose,
        status="SUCCESS",
        details=f"Consent '{payload.purpose}' updated to granted={payload.is_granted}",
    )
    db.add(audit)
    db.commit()

    # Return refreshed preferences
    all_consents = (
        db.query(ConsentRecord)
        .filter(ConsentRecord.patient_id == patient_id)
        .order_by(ConsentRecord.id.asc())
        .all()
    )
    return [ConsentItemResponse.model_validate(c) for c in all_consents]


# V11: Missing Rights & Grievance Workflow - Handlers return generic acknowledgement
# with no tracking ID, no ticket persistence, no database storage, and no downstream follow-up
@router.post("/rights-request", response_model=RightsRequestResponse, status_code=status.HTTP_200_OK)
def submit_rights_request(
    payload: RightsRequestPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """V11: Dead-end rights request handler with no tracking ID or workflow storage."""
    patient_id = current_user.patient_id or f"USR-{current_user.id}"

    # V11: Writes an audit row but creates no ticket, no request record, and issues no tracking ID
    audit = AuditLog(
        actor_id=patient_id,
        actor_email=current_user.email,
        action=f"RIGHTS_REQUEST_{payload.request_type.upper()}",
        endpoint="/api/privacy/rights-request",
        target_resource_id=patient_id,
        status="SUCCESS",
        status_code=200,
        details=f"Data principal rights request received for type '{payload.request_type}'.",
    )
    db.add(audit)
    db.commit()

    # V11: Generic acknowledgement with no tracking ID, no storage, no follow-up
    return RightsRequestResponse(
        status="received",
        request_type=payload.request_type,
        message=f"Your data rights request for '{payload.request_type}' has been recorded and submitted to the privacy administration team for review.",
    )


@router.post("/grievance", response_model=GrievanceResponse, status_code=status.HTTP_200_OK)
def submit_grievance(
    payload: GrievancePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """V11: Dead-end grievance submission with no ticket generation, storage, or follow-up."""
    patient_id = current_user.patient_id or f"USR-{current_user.id}"

    # V11: Writes an audit row but generates no grievance ticket and dispatches no alert
    audit = AuditLog(
        actor_id=patient_id,
        actor_email=payload.contact_email or current_user.email,
        action="GRIEVANCE_FILED",
        endpoint="/api/privacy/grievance",
        target_resource_id="DPO",
        status="SUCCESS",
        status_code=200,
        details=f"Privacy grievance submitted with subject: '{payload.subject}'.",
    )
    db.add(audit)
    db.commit()

    # V11: Generic acknowledgement with no tracking ID, no follow-up
    return GrievanceResponse(
        status="received",
        message="Your privacy grievance has been registered with the Data Protection Officer. You will receive an acknowledgment notice regarding your inquiry.",
    )


# V09: Excessive / Undefined Data Retention - Account deletion only marks is_active=False
# Patient rows, identity records, medical reports, and filesystem files are never purged
@router.delete("/account", response_model=AccountDeletionResponse)
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """V09: Soft-delete account by marking is_active=False without purging DB records or files."""
    current_user.is_active = False

    patient_id = current_user.patient_id or f"USR-{current_user.id}"
    profile = (
        db.query(PatientProfile)
        .filter((PatientProfile.user_id == current_user.id) | (PatientProfile.patient_id == patient_id))
        .first()
    )
    if profile:
        profile.is_active = False

    audit = AuditLog(
        actor_id=patient_id,
        actor_email=current_user.email,
        action="DELETE_ACCOUNT",
        endpoint="/api/privacy/account",
        target_resource_id=patient_id,
        status="SUCCESS",
        status_code=200,
        details="User account deletion requested. Account set to inactive; medical records and files retained.",
    )
    db.add(audit)
    db.commit()

    return AccountDeletionResponse(
        status="deactivated",
        message="Your account has been deactivated and scheduled for deletion.",
    )

