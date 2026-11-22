"""MediVault Privacy, Consent, and Data Rights Schemas.

Defines DTO models for patient consent preferences, data principal
rights requests (export, correction, erasure), and privacy grievances.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ConsentItemResponse(BaseModel):
    """Patient consent preference record."""
    id: Optional[int] = None
    patient_id: str
    purpose: str
    description: Optional[str] = None
    is_granted: bool
    version: str = "1.0"
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConsentUpdateRequest(BaseModel):
    """Payload for updating or recording a consent preference."""
    purpose: str = Field(..., min_length=1, description="Consent purpose identifier (e.g. clinical_care)")
    is_granted: bool = Field(..., description="Whether consent is granted or revoked")
    description: Optional[str] = Field(None, description="Optional description of the processing purpose")


class RightsRequestPayload(BaseModel):
    """Data principal rights request submission (export, correction, erasure)."""
    request_type: str = Field(..., description="Type of rights request (e.g. export, correction, erasure)")
    details: Optional[str] = Field(None, description="Specific details or scope of the request")


class RightsRequestResponse(BaseModel):
    """Acknowledgment response for data principal rights request."""
    status: str
    request_type: str
    message: str


class GrievancePayload(BaseModel):
    """Privacy grievance submission to Data Protection Officer."""
    subject: str = Field(..., min_length=1, description="Subject of the privacy complaint or inquiry")
    description: str = Field(..., min_length=1, description="Detailed description of the privacy concern")
    contact_email: Optional[str] = Field(None, description="Alternative contact email address")


class GrievanceResponse(BaseModel):
    """Acknowledgment response for privacy grievance submission."""
    status: str
    message: str


class AccountDeletionResponse(BaseModel):
    """Acknowledgment response for account deletion request."""
    status: str
    message: str
