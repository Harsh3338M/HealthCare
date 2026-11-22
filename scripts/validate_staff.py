"""In-process validation script for MediVault Staff Endpoints.

Validates all staff API endpoints strictly in-process using FastAPI TestClient
and an isolated in-memory SQLite database. No external sockets or servers.
"""

import os
import sys
import faulthandler
faulthandler.enable()

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.models import AuditLog, IdentityRecord, PatientProfile, User
from backend.app.routes.auth import create_access_token, hash_password

# 1. Setup isolated in-memory SQLite engine
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# 2. Initialize schema & seed test data
Base.metadata.create_all(bind=engine)
db = TestingSessionLocal()

user_doctor = User(
    email="doctor@medivault.test",
    password_hash=hash_password("Password123!"),
    full_name="Dr. Ananya Rao",
    role="staff_clinical",
    patient_id="STF-200002",
    is_active=True,
)
user_reception = User(
    email="reception@medivault.test",
    password_hash=hash_password("Password123!"),
    full_name="Rohan Verma",
    role="staff_basic",
    patient_id="STF-200001",
    is_active=True,
)
user_patient = User(
    email="patient01@medivault.test",
    password_hash=hash_password("Password123!"),
    full_name="Aarav Sharma",
    role="patient",
    patient_id="PAT-100001",
    is_active=True,
)
db.add_all([user_doctor, user_reception, user_patient])
db.flush()

patient1 = PatientProfile(
    patient_id="PAT-100001",
    user_id=user_patient.id,
    full_name="Aarav Sharma",
    date_of_birth="1988-06-15",
    gender="Male",
    phone="+91-98765-43210",
    email="patient01@medivault.test",
    blood_group="B+",
    conditions="Type-2 Diabetes",
    medications="Metformin 500mg",
    medical_notes="Glycemic control stable under current regimen.",
    aadhaar_ref="1002 4471 0001",
    ayushman_ref="PMJAY-0000-0001",
    is_active=True,
)
db.add(patient1)
db.flush()

identity_rec = IdentityRecord(
    patient_profile_id=patient1.id,
    patient_id="PAT-100001",
    scheme_name="Aadhaar",
    aadhaar_ref="1002 4471 0001",
    verification_status="verified",
)
db.add(identity_rec)

audit1 = AuditLog(
    actor_id="STF-200002",
    actor_email="doctor@medivault.test",
    action="INITIAL_SETUP",
    endpoint="/api/staff/patients",
    target_resource_id="PAT-100001",
    status="SUCCESS",
    status_code=200,
    details="Staff environment verified.",
)
db.add(audit1)
db.commit()
db.close()

# 3. In-process validation using TestClient
with TestClient(app) as client:
    doctor_token = create_access_token({"sub": "doctor@medivault.test", "role": "staff_clinical"})
    reception_token = create_access_token({"sub": "reception@medivault.test", "role": "staff_basic"})
    patient_token = create_access_token({"sub": "patient01@medivault.test", "role": "patient"})

    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
    reception_headers = {"Authorization": f"Bearer {reception_token}"}
    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    # Test 1: List Patients (Doctor)
    resp = client.get("/api/staff/patients", headers=doctor_headers)
    assert resp.status_code == 200, f"List patients failed: {resp.status_code} {resp.text}"
    patients = resp.json()
    assert len(patients) == 1
    assert patients[0]["patient_id"] == "PAT-100001"
    assert patients[0]["full_name"] == "Aarav Sharma"
    print("[PASS] 1. GET /api/staff/patients returned patient directory", flush=True)

    # Test 2: Search Patients
    resp = client.get("/api/staff/patients?search=Aarav", headers=reception_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    resp_empty = client.get("/api/staff/patients?search=NonExistentXYZ", headers=reception_headers)
    assert resp_empty.status_code == 200
    assert len(resp_empty.json()) == 0
    print("[PASS] 2. GET /api/staff/patients?search=... filtered records correctly", flush=True)

    # Test 3: Inspect Patient Detail
    resp = client.get("/api/staff/patients/PAT-100001", headers=reception_headers)
    assert resp.status_code == 200
    detail = resp.json()
    assert detail["patient_id"] == "PAT-100001"
    assert detail["aadhaar_ref"] == "1002 4471 0001"
    assert len(detail["identity_records"]) == 1
    print("[PASS] 3. GET /api/staff/patients/{id} returned full record and logged audit", flush=True)

    # Test 4: Inspect Clinical History
    resp = client.get("/api/staff/patients/PAT-100001/clinical", headers=doctor_headers)
    assert resp.status_code == 200
    clinical = resp.json()
    assert clinical["medical_notes"] == "Glycemic control stable under current regimen."
    print("[PASS] 4. GET /api/staff/patients/{id}/clinical returned physician notes", flush=True)

    # Test 5: Operational Audit Logs Feed
    resp = client.get("/api/staff/audit-logs", headers=doctor_headers)
    assert resp.status_code == 200
    logs = resp.json()
    assert len(logs) >= 2  # initial audit + VIEW_PATIENT_RECORD from Test 3
    actions = [l["action"] for l in logs]
    assert "VIEW_PATIENT_RECORD" in actions
    print("[PASS] 5. GET /api/staff/audit-logs returned operational security feed", flush=True)

    # Test 6: RBAC Rejection for Patient Role
    resp = client.get("/api/staff/patients", headers=patient_headers)
    assert resp.status_code == 403
    print("[PASS] 6. GET /api/staff/patients correctly rejects non-staff role (403 Forbidden)", flush=True)

    # Test 7: Unauthenticated Rejection
    resp = client.get("/api/staff/patients")
    assert resp.status_code == 401
    print("[PASS] 7. GET /api/staff/patients correctly rejects unauthenticated call (401 Unauthorized)", flush=True)

app.dependency_overrides.clear()
print("[SUCCESS] All staff portal endpoints verified strictly in-process!", flush=True)
sys.exit(0)
