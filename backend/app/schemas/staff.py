"""MediVault Staff Directory and Clinical Record Schemas.

Defines DTO models for staff patient search, patient directory listings,
and detailed clinical record inspection.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from backend.app.schemas.patient import IdentityRecordSchema
from backend.app.schemas.report import MedicalReportResponse


class StaffPatientListItem(BaseModel):
    """Summary item for staff patient directory view."""
    id: int
    patient_id: str
    user_id: Optional[int] = None
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    aadhaar_demo_ref: Optional[str] = None
    ayushman_demo_ref: Optional[str] = None
    is_active: bool = True
    reports_count: int = 0
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class StaffPatientDetailResponse(BaseModel):
    """Detailed patient clinical record and associated documents for staff inspection."""
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
    aadhaar_demo_ref: Optional[str] = None
    ayushman_demo_ref: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    identity_records: List[IdentityRecordSchema] = []
    reports: List[MedicalReportResponse] = []

    model_config = {"from_attributes": True}


class StaffClinicalRecordResponse(BaseModel):
    """Restricted clinical history view (diagnoses, medications, and confidential clinical notes)."""
    patient_id: str
    full_name: str
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    medical_notes: Optional[str] = None
    reports: List[MedicalReportResponse] = []

    model_config = {"from_attributes": True}
