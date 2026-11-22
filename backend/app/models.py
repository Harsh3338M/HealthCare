from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.app.database import Base


class User(Base):
    """User account model for authentication, role-based access, and identity tracking."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="patient")  # patient, staff_basic, staff_clinical, admin_dpo
    patient_id = Column(String(50), unique=True, index=True, nullable=True)  # PAT-100001 or staff reference
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reports = relationship("MedicalReport", back_populates="user", cascade="all, delete-orphan")
    consents = relationship("ConsentRecord", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}' role='{self.role}'>"


class PatientProfile(Base):
    """Healthcare profile storing patient vitals, identity references, and clinical notes."""
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. PAT-100001
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=True)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    blood_group = Column(String(10), nullable=True)
    allergies = Column(Text, nullable=True)
    conditions = Column(Text, nullable=True)
    medications = Column(Text, nullable=True)
    medical_notes = Column(Text, nullable=True)  # Doctor/clinical notes (V02/V04 target)
    aadhaar_ref = Column(String(100), nullable=True)  # Aadhaar reference
    ayushman_ref = Column(String(100), nullable=True)  # Ayushman reference
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    identity_records = relationship("IdentityRecord", back_populates="patient_profile", cascade="all, delete-orphan")
    reports = relationship("MedicalReport", back_populates="patient_profile", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<PatientProfile patient_id='{self.patient_id}' name='{self.full_name}'>"


class IdentityRecord(Base):
    """Identity scheme metadata (Aadhaar / Ayushman Bharat PM-JAY identifiers)."""
    __tablename__ = "identity_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_profile_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=True)
    patient_id = Column(String(50), index=True, nullable=False)
    scheme_name = Column(String(100), nullable=False)  # e.g. "Aadhaar Card", "Ayushman Bharat PM-JAY"
    aadhaar_ref = Column(String(100), nullable=True)
    ayushman_ref = Column(String(100), nullable=True)
    document_filename = Column(String(255), nullable=True)
    verification_status = Column(String(50), default="verified", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="identity_records")

    def __repr__(self) -> str:
        return f"<IdentityRecord patient_id='{self.patient_id}' scheme='{self.scheme_name}'>"


class MedicalReport(Base):
    """Medical reports, lab documents, and prescriptions stored on the filesystem."""
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), index=True, nullable=False)  # Associated patient identifier
    patient_profile_id = Column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False)  # Lab Report, Prescription, Radiology, Clinical Summary
    doctor_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=False)  # Path relative to workspace or lab-data/uploads/
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)  # in bytes
    mime_type = Column(String(100), nullable=True)  # application/pdf, etc.
    is_sensitive = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
    patient_profile = relationship("PatientProfile", back_populates="reports")

    def __repr__(self) -> str:
        return f"<MedicalReport id={self.id} patient_id='{self.patient_id}' title='{self.title}'>"


class ConsentRecord(Base):
    """Granular consent preferences and audit history."""
    __tablename__ = "consent_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    patient_id = Column(String(50), index=True, nullable=False)
    purpose = Column(String(100), nullable=False)  # clinical_care, third_party_sharing, analytics_research, marketing
    description = Column(Text, nullable=True)
    is_granted = Column(Boolean, default=True, nullable=False)
    version = Column(String(20), default="1.0", nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="consents")

    def __repr__(self) -> str:
        return f"<ConsentRecord patient_id='{self.patient_id}' purpose='{self.purpose}' granted={self.is_granted}>"


class AuditLog(Base):
    """System access logs for compliance auditing, unauthorized access alerts, and breach response."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(String(100), index=True, nullable=True)  # Email or user id of actor
    actor_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # LOGIN, VIEW_PATIENT, UPLOAD_REPORT, EXPORT_DATA, etc.
    endpoint = Column(String(255), nullable=True)  # API endpoint accessed
    target_resource_id = Column(String(100), index=True, nullable=True)  # ID of target entity (e.g. PAT-100002)
    ip_address = Column(String(100), nullable=True)
    status = Column(String(50), default="SUCCESS", nullable=False)  # SUCCESS, FAILED, UNAUTHORIZED, BREACH_ALERT
    status_code = Column(Integer, nullable=True)
    request_payload = Column(Text, nullable=True)  # Captured HTTP request payload string
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} actor='{self.actor_id}' action='{self.action}' target='{self.target_resource_id}'>"
