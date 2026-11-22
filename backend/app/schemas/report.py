"""MediVault Medical Reports Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MedicalReportResponse(BaseModel):
    """Medical report metadata and file reference DTO."""
    id: int
    patient_id: str
    patient_profile_id: Optional[int] = None
    user_id: Optional[int] = None
    title: str
    report_type: str
    doctor_name: Optional[str] = None
    file_path: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    is_sensitive: bool = False
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
