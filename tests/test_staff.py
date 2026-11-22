"""Automated tests for MediVault Staff Directory and Patient Record API routes."""

import pytest


def get_token(client, email: str = "reception@example.test", password: str = "Password123!") -> str:
    """Helper to authenticate and retrieve a JWT access token for a given user."""
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200, f"Failed to login as {email}: {login_resp.text}"
    return login_resp.json()["access_token"]


def test_staff_list_patients_success(client):
    """Verify staff member can retrieve the synthetic patient directory."""
    token = get_token(client, "reception@example.test")
    response = client.get(
        "/api/staff/patients",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    patients = response.json()
    assert isinstance(patients, list)
    assert len(patients) >= 2

    # Check presence of seeded patients
    patient_ids = [p["patient_id"] for p in patients]
    assert "PAT-DEMO-001" in patient_ids
    assert "PAT-DEMO-002" in patient_ids

    # Validate structure of patient item
    aarav = next(p for p in patients if p["patient_id"] == "PAT-DEMO-001")
    assert aarav["full_name"] == "Aarav Sharma"
    assert aarav["blood_group"] == "B+"
    assert aarav["conditions"] == "Type-2 Diabetes"
    assert "reports_count" in aarav


def test_staff_list_patients_search_filter(client):
    """Verify search parameter filters patient records by name or ID."""
    token = get_token(client, "doctor@example.test")

    # Search by name
    resp = client.get(
        "/api/staff/patients?search=Aarav",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 1
    assert results[0]["patient_id"] == "PAT-DEMO-001"

    # Search by patient ID
    resp2 = client.get(
        "/api/staff/patients?search=PAT-DEMO-002",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp2.status_code == 200
    results2 = resp2.json()
    assert len(results2) == 1
    assert results2[0]["full_name"] == "Priya Patel"

    # Search nonexistent
    resp3 = client.get(
        "/api/staff/patients?search=NonexistentNameXYZ",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp3.status_code == 200
    assert len(resp3.json()) == 0


def test_patient_role_forbidden_from_staff_directory(client):
    """Verify normal patient account cannot access staff patient directory."""
    token = get_token(client, "patient01@example.test")
    response = client.get(
        "/api/staff/patients",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert "Staff privileges required" in response.json()["detail"]


def test_unauthenticated_forbidden_from_staff_directory(client):
    """Verify unauthenticated request is rejected."""
    response = client.get("/api/staff/patients")
    assert response.status_code == 401


def test_staff_inspect_patient_record(client):
    """Verify staff can inspect single patient clinical record and audit log is recorded."""
    token = get_token(client, "reception@example.test")
    response = client.get(
        "/api/staff/patients/PAT-DEMO-001",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "PAT-DEMO-001"
    assert data["full_name"] == "Aarav Sharma"
    assert data["blood_group"] == "B+"
    assert data["conditions"] == "Type-2 Diabetes"
    assert len(data["identity_records"]) == 1
    assert data["identity_records"][0]["scheme_name"] == "Synthetic Aadhaar"


def test_staff_inspect_nonexistent_patient_returns_404(client):
    """Verify 404 returned for nonexistent patient ID."""
    token = get_token(client, "doctor@example.test")
    response = client.get(
        "/api/staff/patients/PAT-UNKNOWN-999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_staff_clinical_record_access(client):
    """Verify clinical history endpoint access across staff roles."""
    # Staff roles (both reception and doctor) can access clinical history
    reception_token = get_token(client, "reception@example.test")
    resp = client.get(
        "/api/staff/patients/PAT-DEMO-002/clinical",
        headers={"Authorization": f"Bearer {reception_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["patient_id"] == "PAT-DEMO-002"
    assert "medical_notes" in data

    doctor_token = get_token(client, "doctor@example.test")
    doctor_resp = client.get(
        "/api/staff/patients/PAT-DEMO-002/clinical",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert doctor_resp.status_code == 200
    assert doctor_resp.json()["patient_id"] == "PAT-DEMO-002"


def test_v12_security_incident_uncorrelated_patients(client):
    """V12: Verify security incident alert returns 0 correlated patient records and unavailable notification workflow."""
    doctor_token = get_token(client, "doctor@example.test")
    headers = {"Authorization": f"Bearer {doctor_token}"}

    # Fetch audit logs to find the breach alert
    logs_resp = client.get("/api/staff/audit-logs", headers=headers)
    assert logs_resp.status_code == 200
    logs = logs_resp.json()
    breach_alert = next((l for l in logs if l["status"] == "BREACH_ALERT"), None)
    assert breach_alert is not None, "BREACH_ALERT not found in audit logs"

    # Inspect incident details
    incident_resp = client.get(f"/api/staff/security/incidents/{breach_alert['id']}", headers=headers)
    assert incident_resp.status_code == 200
    incident = incident_resp.json()
    assert incident["incident_type"] == "UNUSUAL_ACCESS_DETECTED"
    assert incident["correlated_records_count"] == 0
    assert len(incident["affected_patients"]) == 0
    assert "unavailable" in incident["notification_workflow_status"].lower()

