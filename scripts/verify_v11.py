"""V11 Verification: Missing Rights & Grievance Workflow.

Confirms that Data Principal rights submissions (export, correction) and
privacy grievances return generic acknowledgments with NO tracking ID,
NO ticket number, and NO dedicated workflow records persisted in the database.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import inspect

from backend.app.database import Base, engine
from backend.app.main import app
from backend.app.seed import seed_database


def main():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()

    client = TestClient(app)

    # 1. Login as patient01
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@medivault.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Submit Data Rights Request (Download My Data / Export)
    export_resp = client.post(
        "/api/privacy/rights-request",
        headers=headers,
        json={"request_type": "export", "details": "Full health summary and diagnostic documents"},
    )
    assert export_resp.status_code == 200, f"Export request failed: {export_resp.status_code}"
    export_data = export_resp.json()
    assert export_data["status"] == "received"
    assert "tracking_id" not in export_data, "V11 failure: tracking_id was unexpectedly returned"
    assert "ticket_id" not in export_data, "V11 failure: ticket_id was unexpectedly returned"
    assert "request_id" not in export_data, "V11 failure: request_id was unexpectedly returned"
    print("  [PASS] Data export request returns generic ack without tracking ID")

    # 3. Submit Data Rights Request (Correction)
    correct_resp = client.post(
        "/api/privacy/rights-request",
        headers=headers,
        json={"request_type": "correction", "details": "Update emergency contact number"},
    )
    assert correct_resp.status_code == 200, f"Correction request failed: {correct_resp.status_code}"
    correct_data = correct_resp.json()
    assert correct_data["status"] == "received"
    assert "tracking_id" not in correct_data, "V11 failure: tracking_id was unexpectedly returned"
    print("  [PASS] Data correction request returns generic ack without tracking ID")

    # 4. Submit Privacy Grievance to DPO
    grievance_resp = client.post(
        "/api/privacy/grievance",
        headers=headers,
        json={
            "subject": "Inquiry regarding health data retention period",
            "description": "Requesting clarification on how long diagnostic files are stored.",
            "contact_email": "patient01@medivault.test",
        },
    )
    assert grievance_resp.status_code == 200, f"Grievance request failed: {grievance_resp.status_code}"
    grievance_data = grievance_resp.json()
    assert grievance_data["status"] == "received"
    assert "tracking_id" not in grievance_data, "V11 failure: tracking_id was unexpectedly returned"
    assert "ticket_id" not in grievance_data, "V11 failure: ticket_id was unexpectedly returned"
    assert "grievance_id" not in grievance_data, "V11 failure: grievance_id was unexpectedly returned"
    print("  [PASS] Privacy grievance returns generic ack without tracking ID or ticket number")

    # 5. Verify no dedicated rights/grievance storage tables exist in the database
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    assert "rights_requests" not in table_names, "V11 failure: rights_requests table exists"
    assert "grievances" not in table_names, "V11 failure: grievances table exists"
    assert "tickets" not in table_names, "V11 failure: tickets table exists"
    print("  [PASS] Database has no rights_requests, grievances, or ticketing workflow tables")

    print("\nV11 PASSED — Missing rights and grievance workflow verified (dead-end acknowledgments with no tracking ID).")


if __name__ == "__main__":
    main()
