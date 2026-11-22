"""MediVault Shared Pytest Configuration and Test Fixtures.

Provides an isolated test SQLite database and TestClient with get_db override
and standard synthetic test accounts seeded for each test.
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.models import IdentityRecord, PatientProfile, User
from backend.app.routes.auth import hash_password

TEST_DB_FILE = "./test_medivault.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_app():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass


@pytest.fixture(autouse=True)
def reset_db_data():
    """Reset database tables and seed baseline test users before every test."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Seed patient01
    user1 = User(
        email="patient01@example.test",
        password_hash=hash_password("Password123!"),
        full_name="Aarav Sharma",
        role="patient",
        patient_id="PAT-DEMO-001",
        is_active=True,
    )
    db.add(user1)
    db.flush()

    profile1 = PatientProfile(
        patient_id="PAT-DEMO-001",
        user_id=user1.id,
        full_name="Aarav Sharma",
        date_of_birth="1988-06-15",
        gender="Male",
        phone="+91-98765-43210",
        email="patient01@example.test",
        address="402 Palm Grove Enclave, Sector 14, Gurgaon, HR",
        emergency_contact="Sunita Sharma (+91-98765-43219)",
        blood_group="B+",
        allergies="Penicillin",
        conditions="Type-2 Diabetes",
        medications="Metformin 500mg",
        aadhaar_demo_ref="DEMO-AADHAAR-0001",
        ayushman_demo_ref="DEMO-PM-JAY-0001",
        is_active=True,
    )
    db.add(profile1)
    db.flush()

    id_rec = IdentityRecord(
        patient_profile_id=profile1.id,
        patient_id="PAT-DEMO-001",
        scheme_name="Synthetic Aadhaar",
        aadhaar_demo_ref="DEMO-AADHAAR-0001",
        verification_status="verified",
    )
    db.add(id_rec)

    # Seed patient02
    user2 = User(
        email="patient02@example.test",
        password_hash=hash_password("Password123!"),
        full_name="Priya Patel",
        role="patient",
        patient_id="PAT-DEMO-002",
        is_active=True,
    )
    db.add(user2)
    db.flush()

    profile2 = PatientProfile(
        patient_id="PAT-DEMO-002",
        user_id=user2.id,
        full_name="Priya Patel",
        date_of_birth="1994-09-21",
        gender="Female",
        phone="+91-98765-43211",
        email="patient02@example.test",
        blood_group="O+",
        allergies="Peanuts",
        conditions="Asthma",
        medications="Salbutamol Inhaler",
        aadhaar_demo_ref="DEMO-AADHAAR-0002",
        is_active=True,
    )
    db.add(profile2)

    db.commit()
    db.close()
    yield


@pytest.fixture
def client():
    return TestClient(app)
