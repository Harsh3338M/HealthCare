"""MediVault Authentication & User Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserLogin(BaseModel):
    """Payload for user login authentication."""
    email: Optional[str] = None
    username: Optional[str] = None
    password: str = Field(..., min_length=1)


class UserRegister(BaseModel):
    """Payload for user registration."""
    email: str
    password: str = Field(..., min_length=1)
    full_name: str
    role: Optional[str] = "patient"
    patient_id: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class UserResponse(BaseModel):
    """User profile data returned upon authentication or query."""
    id: int
    email: str
    full_name: str
    role: str
    patient_id: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT bearer token and authenticated user payload."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Decoded token claim structure."""
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    patient_id: Optional[str] = None
    user_id: Optional[int] = None
