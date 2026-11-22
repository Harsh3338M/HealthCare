"""MediVault Patient Profile API Routes.

Provides endpoints for fetching current patient profile (GET /api/patients/me),
retrieving a profile by ID (GET /api/patients/{patient_id}), retrieving patient
reports by ID (GET /api/patients/{patient_id}/reports), and updating patient
records (PUT /api/patients/{patient_id}).
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import IdentityRecord, MedicalReport, PatientProfile, User
from backend.app.routes.auth import get_current_user
from backend.app.schemas.patient import (
    PatientProfileResponse,
    PatientProfileUpdate,
)
from backend.app.schemas.report import MedicalReportResponse

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.get("/me", response_model=PatientProfileResponse)
def get_my_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the patient profile for the currently authenticated user."""
    profile = (
        db.query(PatientProfile)
        .filter(
            (PatientProfile.user_id == current_user.id)
            | (PatientProfile.patient_id == current_user.patient_id)
        )
        .first()
    )

    if not profile:
        # If user has a patient_id but profile doesn't exist yet, initialize it
        if current_user.role == "patient" and current_user.patient_id:
            profile = PatientProfile(
                patient_id=current_user.patient_id,
                user_id=current_user.id,
                full_name=current_user.full_name,
                email=current_user.email,
                is_active=True,
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found for this account",
            )

    response_data = PatientProfileResponse.model_validate(profile)
    if profile.user and profile.user.password_hash:
        response_data.password_hash = profile.user.password_hash
    elif profile.user_id:
        user_obj = db.query(User).filter(User.id == profile.user_id).first()
        if user_obj and user_obj.password_hash:
            response_data.password_hash = user_obj.password_hash
    return response_data


@router.get("/{patient_id}", response_model=PatientProfileResponse)
def get_patient_profile_by_id(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve patient profile by patient ID."""
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.patient_id == patient_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' not found",
        )

    response_data = PatientProfileResponse.model_validate(profile)
    if profile.user and profile.user.password_hash:
        response_data.password_hash = profile.user.password_hash
    elif profile.user_id:
        user_obj = db.query(User).filter(User.id == profile.user_id).first()
        if user_obj and user_obj.password_hash:
            response_data.password_hash = user_obj.password_hash
    return response_data


@router.get("/{patient_id}/reports", response_model=List[MedicalReportResponse])
def get_patient_reports_by_id(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve diagnostic reports and medical documents for a specific patient ID."""
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.patient_id == patient_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' not found",
        )

    reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.patient_id == patient_id)
        .order_by(MedicalReport.created_at.desc())
        .all()
    )
    return [MedicalReportResponse.model_validate(r) for r in reports]


@router.put("/{patient_id}", response_model=PatientProfileResponse)
def update_patient_profile(
    patient_id: str,
    payload: PatientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update patient vitals, contact details, conditions, or identity schemes."""
    profile = (
        db.query(PatientProfile)
        .filter(PatientProfile.patient_id == patient_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' not found",
        )

    # V04: Updates persist plaintext PII/PHI directly to database without encryption or masking
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    profile.updated_at = datetime.utcnow()

    # Sync user table full_name and email if changed
    if profile.user:
        if "full_name" in update_data and update_data["full_name"]:
            profile.user.full_name = update_data["full_name"]
        if "email" in update_data and update_data["email"]:
            profile.user.email = update_data["email"]

    # Keep IdentityRecord in sync if references updated
    if "aadhaar_ref" in update_data and update_data["aadhaar_ref"]:
        id_rec = (
            db.query(IdentityRecord)
            .filter(
                IdentityRecord.patient_id == patient_id,
                IdentityRecord.scheme_name == "Aadhaar Card",
            )
            .first()
        )
        if id_rec:
            id_rec.aadhaar_ref = update_data["aadhaar_ref"]
        else:
            db.add(
                IdentityRecord(
                    patient_profile_id=profile.id,
                    patient_id=patient_id,
                    scheme_name="Aadhaar Card",
                    aadhaar_ref=update_data["aadhaar_ref"],
                    verification_status="verified",
                )
            )

    if "ayushman_ref" in update_data and update_data["ayushman_ref"]:
        pm_rec = (
            db.query(IdentityRecord)
            .filter(
                IdentityRecord.patient_id == patient_id,
                IdentityRecord.scheme_name == "Ayushman Bharat PM-JAY",
            )
            .first()
        )
        if pm_rec:
            pm_rec.ayushman_ref = update_data["ayushman_ref"]
        else:
            db.add(
                IdentityRecord(
                    patient_profile_id=profile.id,
                    patient_id=patient_id,
                    scheme_name="Ayushman Bharat PM-JAY",
                    ayushman_ref=update_data["ayushman_ref"],
                    verification_status="verified",
                )
            )

    db.commit()
    db.refresh(profile)

    response_data = PatientProfileResponse.model_validate(profile)
    if profile.user and profile.user.password_hash:
        response_data.password_hash = profile.user.password_hash
    elif profile.user_id:
        user_obj = db.query(User).filter(User.id == profile.user_id).first()
        if user_obj and user_obj.password_hash:
            response_data.password_hash = user_obj.password_hash
    return response_data
