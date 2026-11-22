"""MediVault Patient Profile Schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class IdentityRecordSchema(BaseModel):
    """Identity Scheme Reference Schema."""
    id: Optional[int] = None
    patient_id: str
    scheme_name: str
    aadhaar_ref: Optional[str] = None
    ayushman_ref: Optional[str] = None
    document_filename: Optional[str] = None
    verification_status: str = "verified"
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PatientProfileResponse(BaseModel):
    """Full Patient Profile Data Model."""
    id: int
    patient_id: str
    user_id: Optional[int] = None
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    medical_notes: Optional[str] = None
    aadhaar_ref: Optional[str] = None
    ayushman_ref: Optional[str] = None
    password_hash: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    identity_records: List[IdentityRecordSchema] = []

    model_config = {"from_attributes": True}


class PatientProfileUpdate(BaseModel):
    """Payload for updating patient vitals, clinical conditions, and identity references."""
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    medical_notes: Optional[str] = None
    aadhaar_ref: Optional[str] = None
    ayushman_ref: Optional[str] = None
