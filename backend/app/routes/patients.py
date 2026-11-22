"""MediVault Patient Profile API Routes.

Provides endpoints for fetching current patient profile (GET /api/patients/me),
retrieving a profile by ID (GET /api/patients/{patient_id}), and updating
patient records (PUT /api/patients/{patient_id}).
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import IdentityRecord, PatientProfile, User
from backend.app.routes.auth import get_current_user
from backend.app.schemas.patient import (
    PatientProfileResponse,
    PatientProfileUpdate,
)

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

    return PatientProfileResponse.model_validate(profile)


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

    return PatientProfileResponse.model_validate(profile)


@router.put("/{patient_id}", response_model=PatientProfileResponse)
def update_patient_profile(
    patient_id: str,
    payload: PatientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update patient vitals, contact details, conditions, or synthetic identity schemes."""
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

    # Keep IdentityRecord in sync if demo references updated
    if "aadhaar_demo_ref" in update_data and update_data["aadhaar_demo_ref"]:
        id_rec = (
            db.query(IdentityRecord)
            .filter(
                IdentityRecord.patient_id == patient_id,
                IdentityRecord.scheme_name == "Synthetic Aadhaar",
            )
            .first()
        )
        if id_rec:
            id_rec.aadhaar_demo_ref = update_data["aadhaar_demo_ref"]
        else:
            db.add(
                IdentityRecord(
                    patient_profile_id=profile.id,
                    patient_id=patient_id,
                    scheme_name="Synthetic Aadhaar",
                    aadhaar_demo_ref=update_data["aadhaar_demo_ref"],
                    verification_status="verified",
                )
            )

    if "ayushman_demo_ref" in update_data and update_data["ayushman_demo_ref"]:
        pm_rec = (
            db.query(IdentityRecord)
            .filter(
                IdentityRecord.patient_id == patient_id,
                IdentityRecord.scheme_name == "Ayushman Bharat PM-JAY",
            )
            .first()
        )
        if pm_rec:
            pm_rec.ayushman_demo_ref = update_data["ayushman_demo_ref"]
        else:
            db.add(
                IdentityRecord(
                    patient_profile_id=profile.id,
                    patient_id=patient_id,
                    scheme_name="Ayushman Bharat PM-JAY",
                    ayushman_demo_ref=update_data["ayushman_demo_ref"],
                    verification_status="verified",
                )
            )

    db.commit()
    db.refresh(profile)

    return PatientProfileResponse.model_validate(profile)
