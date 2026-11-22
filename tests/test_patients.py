"""Automated tests for MediVault Patient Profile API routes."""

import pytest


def get_patient01_token(client) -> str:
    """Helper to authenticate as patient01 and retrieve JWT access token."""
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@example.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200
    return login_resp.json()["access_token"]


def test_get_patient_me(client):
    token = get_patient01_token(client)
    response = client.get(
        "/api/patients/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "PAT-DEMO-001"
    assert data["full_name"] == "Aarav Sharma"
    assert data["blood_group"] == "B+"
    assert data["conditions"] == "Type-2 Diabetes"
    assert data["aadhaar_demo_ref"] == "DEMO-AADHAAR-0001"
    assert len(data["identity_records"]) == 1


def test_get_patient_by_id(client):
    token = get_patient01_token(client)
    response = client.get(
        "/api/patients/PAT-DEMO-002",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "PAT-DEMO-002"
    assert data["full_name"] == "Priya Patel"
    assert data["conditions"] == "Asthma"


def test_get_nonexistent_patient_returns_404(client):
    token = get_patient01_token(client)
    response = client.get(
        "/api/patients/PAT-UNKNOWN-999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_patient_profile(client):
    token = get_patient01_token(client)
    update_payload = {
        "allergies": "Penicillin, Latex, Pollen",
        "medications": "Metformin 500mg, Lisinopril 10mg",
        "emergency_contact": "Sunita Sharma (+91-98765-43219)",
        "blood_group": "B+",
    }
    response = client.put(
        "/api/patients/PAT-DEMO-001",
        json=update_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["allergies"] == "Penicillin, Latex, Pollen"
    assert data["medications"] == "Metformin 500mg, Lisinopril 10mg"
    assert data["emergency_contact"] == "Sunita Sharma (+91-98765-43219)"


def test_unauthenticated_request_rejected(client):
    response = client.get("/api/patients/me")
    assert response.status_code == 401
