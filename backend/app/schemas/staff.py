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
    aadhaar_ref: Optional[str] = None
    ayushman_ref: Optional[str] = None
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
    aadhaar_ref: Optional[str] = None
    ayushman_ref: Optional[str] = None
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
    aadhaar_ref: Optional[str] = None
    ayushman_ref: Optional[str] = None
    reports: List[MedicalReportResponse] = []

    model_config = {"from_attributes": True}


class StaffAuditLogResponse(BaseModel):
    """System and staff audit activity event."""
    id: int
    actor_id: Optional[str] = None
    actor_email: Optional[str] = None
    action: str
    endpoint: Optional[str] = None
    target_resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    status: str
    status_code: Optional[int] = None
    details: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}


class SecurityIncidentResponse(BaseModel):
    """V12: Security incident details illustrating incomplete breach-response workflow."""
    id: int
    incident_type: str
    severity: str
    description: str
    timestamp: datetime
    actor_id: Optional[str] = None
    ip_address: Optional[str] = None
    target_resource_id: Optional[str] = None
    correlated_records_count: int = 0
    affected_patients: List[str] = []
    notification_workflow_status: str = "Unavailable: No notification dispatch channel configured"
    remediation_status: str = "Pending manual investigation"

    model_config = {"from_attributes": True}

