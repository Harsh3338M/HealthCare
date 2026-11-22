"""V12 Verification: Incomplete Breach-Response Workflow.

Confirms that the seeded security alert ("Unusual access detected") in the
staff portal returns 0 correlated patient records (due to missing target_resource_id
in telemetry) and provides no workflow or dispatch channel to notify affected users.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from backend.app.database import Base, engine
from backend.app.main import app
from backend.app.seed import seed_database


def main():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()

    client = TestClient(app)

    # 1. Login as Data Protection Officer (staff/admin)
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "privacy@medivault.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Query staff audit logs for the seeded breach alert
    logs_resp = client.get("/api/staff/audit-logs", headers=headers)
    assert logs_resp.status_code == 200, f"Failed to fetch audit logs: {logs_resp.status_code}"
    logs = logs_resp.json()

    breach_alert = next((l for l in logs if l.get("status") == "BREACH_ALERT"), None)
    assert breach_alert is not None, "BREACH_ALERT event was not seeded in audit logs"
    print(f"  [PASS] Seeded security alert found: '{breach_alert.get('details')}' (ID: {breach_alert.get('id')})")

    # 3. Retrieve security incident investigation detail
    incident_resp = client.get(f"/api/staff/security/incidents/{breach_alert['id']}", headers=headers)
    assert incident_resp.status_code == 200, f"Incident detail fetch failed: {incident_resp.status_code}"
    incident = incident_resp.json()

    # Assert 0 correlated patient records
    assert incident["correlated_records_count"] == 0, f"Expected 0 correlated records, got {incident['correlated_records_count']}"
    assert len(incident["affected_patients"]) == 0, f"Expected empty affected patients list, got {incident['affected_patients']}"
    assert incident["target_resource_id"] is None, "Expected target_resource_id to be None"
    print("  [PASS] Incident detail confirms 0 correlated patient records (missing telemetry)")

    # Assert notification workflow is unavailable
    assert "unavailable" in incident["notification_workflow_status"].lower(), (
        f"Unexpected notification status: {incident['notification_workflow_status']}"
    )
    print(f"  [PASS] Notification workflow status: {incident['notification_workflow_status']}")

    # 4. Verify frontend StaffDashboard.jsx contains "0 correlated patient records" and no notify path
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dashboard_path = os.path.join(repo_root, "frontend", "src", "pages", "StaffDashboard.jsx")
    assert os.path.exists(dashboard_path), f"StaffDashboard.jsx not found at {dashboard_path}"

    with open(dashboard_path, "r", encoding="utf-8") as f:
        src = f.read()

    assert "0 correlated patient records" in src, "Frontend missing '0 correlated patient records' label"
    assert "Unusual access detected" in src, "Frontend missing 'Unusual access detected' alert label"
    assert "notify" not in src.lower() or "no notification channel" in src.lower(), "Unexpected notify button found"
    print("  [PASS] StaffDashboard.jsx presents '0 correlated patient records' with no notification workflow")

    print("\nV12 PASSED — Incomplete breach-response workflow verified (0 correlated records, no notification workflow).")


if __name__ == "__main__":
    main()
