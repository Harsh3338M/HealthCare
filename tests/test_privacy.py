"""Automated tests for MediVault Privacy, Consent, and Data Rights API routes."""

import pytest


def get_token(client, email: str = "patient01@example.test", password: str = "Password123!") -> str:
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200, f"Login failed for {email}: {login_resp.text}"
    return login_resp.json()["access_token"]


def test_get_and_update_consent_preferences(client):
    """Verify patient can retrieve and update granular consent preferences."""
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET initial consents (should initialize defaults)
    resp = client.get("/api/privacy/consent", headers=headers)
    assert resp.status_code == 200
    consents = resp.json()
    assert isinstance(consents, list)
    assert len(consents) >= 4

    purposes = {c["purpose"]: c["is_granted"] for c in consents}
    assert "clinical_care" in purposes
    assert "third_party_sharing" in purposes
    assert purposes["clinical_care"] is True
    assert purposes["third_party_sharing"] is False

    # 2. POST update consent for third_party_sharing to True
    update_resp = client.post(
        "/api/privacy/consent",
        headers=headers,
        json={"purpose": "third_party_sharing", "is_granted": True},
    )
    assert update_resp.status_code == 200
    updated_consents = update_resp.json()
    updated_map = {c["purpose"]: c["is_granted"] for c in updated_consents}
    assert updated_map["third_party_sharing"] is True


def test_submit_rights_request_export_success(client):
    """Verify data rights request for 'export' returns 200 OK acknowledging request."""
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/privacy/rights-request",
        headers=headers,
        json={"request_type": "export", "details": "Full health summary and diagnostic records"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "received"
    assert data["request_type"] == "export"
    assert "recorded" in data["message"].lower() or "submitted" in data["message"].lower()


def test_submit_grievance_success(client):
    """Verify grievance submission to Data Protection Officer returns 200 OK."""
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/privacy/grievance",
        headers=headers,
        json={
            "subject": "Inquiry regarding data processing policy",
            "description": "Requesting confirmation on retention period for inactive profile.",
            "contact_email": "patient01@example.test",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "received"
    assert "registered" in data["message"].lower() or "grievance" in data["message"].lower()


def test_unauthenticated_privacy_requests_rejected(client):
    """Verify unauthenticated requests to privacy endpoints are rejected."""
    resp1 = client.get("/api/privacy/consent")
    assert resp1.status_code == 401

    resp2 = client.post("/api/privacy/rights-request", json={"request_type": "export"})
    assert resp2.status_code == 401
