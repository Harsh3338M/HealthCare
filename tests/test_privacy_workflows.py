"""MediVault Exploit Verification Tests: Privacy Workflows (V09–V12).

Asserts reproducible exploits for:
- V09: Excessive / Undefined Data Retention
- V10: Dark-Pattern Privacy Notice & Consent UX
- V11: Missing Rights & Grievance Workflow
- V12: Incomplete Breach-Response Workflow
"""

import os
import pytest
from sqlalchemy import inspect

from backend.app.database import get_db
from backend.app.main import app
from backend.app.models import IdentityRecord, PatientProfile, User


def get_token(client, email: str = "patient01@example.test", password: str = "Password123!") -> str:
    """Helper to authenticate and retrieve access token."""
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200, f"Authentication failed for {email}: {login_resp.text}"
    return login_resp.json()["access_token"]


# ============================================================================
# V09: Excessive / Undefined Data Retention
# ============================================================================
def test_exploit_v09_soft_delete_retention(client):
    """V09 Exploit: Account deletion only soft-deletes (is_active=False);

    patient rows, identity records, and files are retained indefinitely with no retention policy.
    """
    token_p2 = get_token(client, email="patient02@example.test")
    headers_p2 = {"Authorization": f"Bearer {token_p2}"}

    # Execute account deletion request
    del_resp = client.delete("/api/privacy/account", headers=headers_p2)
    assert del_resp.status_code == 200, f"Delete failed: {del_resp.status_code}"
    del_data = del_resp.json()
    assert del_data["status"] == "deactivated"

    # Query the database to verify records were NOT purged
    db = next(app.dependency_overrides[get_db]())
    try:
        user = db.query(User).filter(User.email == "patient02@example.test").first()
        assert user is not None, "User row was purged instead of soft-deleted"
        assert user.is_active is False, "User is_active was not set to False"

        profile = db.query(PatientProfile).filter(PatientProfile.patient_id == "PAT-DEMO-002").first()
        assert profile is not None, "PatientProfile row was purged"
        assert profile.is_active is False, "Profile is_active was not set to False"
        assert profile.aadhaar_ref == "DEMO-AADHAAR-0002", "PII was wiped"
        assert profile.medical_notes is not None, "Clinical notes were purged"
    finally:
        db.close()

    # Subsequent access with deactivated token is rejected (403), leaving data orphaned
    me_resp = client.get("/api/patients/me", headers=headers_p2)
    assert me_resp.status_code == 403


# ============================================================================
# V10: Dark-Pattern Privacy Notice & Consent UX
# ============================================================================
def test_exploit_v10_dark_pattern_bundled_consent_ux(client):
    """V10 Exploit: Registration presents bundled, pre-checked consent checkboxes

    with vague purpose descriptions and a buried, non-functional revoke link.
    """
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    auth_path = os.path.join(repo_root, "frontend", "src", "pages", "Auth.jsx")
    modal_path = os.path.join(repo_root, "frontend", "src", "components", "ConsentModal.jsx")

    assert os.path.exists(auth_path), f"Auth.jsx missing: {auth_path}"
    assert os.path.exists(modal_path), f"ConsentModal.jsx missing: {modal_path}"

    with open(auth_path, "r", encoding="utf-8") as f:
        auth_src = f.read()

    with open(modal_path, "r", encoding="utf-8") as f:
        modal_src = f.read()

    # Verify bundled pre-checked state
    assert 'id="bundled-consent"' in auth_src, "Bundled consent checkbox missing from Auth.jsx"
    assert 'id="third-party-consent"' in auth_src, "Third-party sharing checkbox missing from Auth.jsx"
    assert "setConsentsBundled(true)" in auth_src or "useState(true)" in auth_src

    # Verify low-contrast buried revoke control and non-functional handler
    assert "text-[10px] text-slate-300" in auth_src, "Low contrast revoke control missing from Auth.jsx"
    assert "e.preventDefault()" in auth_src, "Non-functional revoke handler missing from Auth.jsx"
    assert "text-[10px] text-slate-300" in modal_src, "Low contrast revoke control missing from ConsentModal.jsx"
    assert "e.preventDefault()" in modal_src, "Non-functional revoke handler missing from ConsentModal.jsx"


# ============================================================================
# V11: Missing Rights & Grievance Workflow
# ============================================================================
def test_exploit_v11_missing_rights_and_grievance_workflow(client):
    """V11 Exploit: Rights requests and grievances return generic acknowledgments

    with NO tracking IDs, NO tickets, and NO persistent database workflow tables.
    """
    token_p1 = get_token(client, email="patient01@example.test")
    headers_p1 = {"Authorization": f"Bearer {token_p1}"}

    # Exploit 1: Export request returns 200 with no tracking ID
    export_resp = client.post(
        "/api/privacy/rights-request",
        headers=headers_p1,
        json={"request_type": "export", "details": "Full health summary export"},
    )
    assert export_resp.status_code == 200
    export_data = export_resp.json()
    assert export_data["status"] == "received"
    assert "tracking_id" not in export_data
    assert "ticket_id" not in export_data
    assert "request_id" not in export_data

    # Exploit 2: Grievance submission returns 200 with no tracking ID
    grievance_resp = client.post(
        "/api/privacy/grievance",
        headers=headers_p1,
        json={
            "subject": "Data retention inquiry",
            "description": "How long are diagnostic reports stored?",
            "contact_email": "patient01@example.test",
        },
    )
    assert grievance_resp.status_code == 200
    grievance_data = grievance_resp.json()
    assert grievance_data["status"] == "received"
    assert "tracking_id" not in grievance_data
    assert "ticket_id" not in grievance_data
    assert "grievance_id" not in grievance_data

    # Exploit 3: Database lacks dedicated rights/grievance tracking tables
    db = next(app.dependency_overrides[get_db]())
    try:
        inspector = inspect(db.get_bind())
        tables = inspector.get_table_names()
        assert "rights_requests" not in tables
        assert "grievances" not in tables
        assert "tickets" not in tables
    finally:
        db.close()


# ============================================================================
# V12: Incomplete Breach-Response Workflow
# ============================================================================
def test_exploit_v12_incomplete_breach_response_workflow(client):
    """V12 Exploit: Incident investigation returns 0 correlated patient records

    due to missing telemetry (target_resource_id=None) and provides no notification workflow.
    """
    token_dpo = get_token(client, email="privacy@example.test")
    headers_dpo = {"Authorization": f"Bearer {token_dpo}"}

    # Retrieve audit logs and locate seeded breach alert
    logs_resp = client.get("/api/staff/audit-logs", headers=headers_dpo)
    assert logs_resp.status_code == 200
    logs = logs_resp.json()
    breach_alert = next((l for l in logs if l.get("status") == "BREACH_ALERT"), None)
    assert breach_alert is not None, "BREACH_ALERT event missing from audit logs"

    # Query incident investigation details
    incident_resp = client.get(
        f"/api/staff/security/incidents/{breach_alert['id']}",
        headers=headers_dpo,
    )
    assert incident_resp.status_code == 200
    incident = incident_resp.json()

    # Assert 0 correlated records and missing telemetry
    assert incident["correlated_records_count"] == 0
    assert len(incident["affected_patients"]) == 0
    assert incident["target_resource_id"] is None
    assert "unavailable" in incident["notification_workflow_status"].lower()

    # Confirm StaffDashboard presents 0 correlated records without notification mechanism
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dashboard_path = os.path.join(repo_root, "frontend", "src", "pages", "StaffDashboard.jsx")
    assert os.path.exists(dashboard_path)
    with open(dashboard_path, "r", encoding="utf-8") as f:
        src = f.read()

    assert "0 correlated patient records" in src
    assert "Unusual access detected" in src
