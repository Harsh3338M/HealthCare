"""Automated tests for MediVault Medical Reports API routes."""

import io
import os
import pytest
from backend.app.models import MedicalReport


def get_patient01_token(client) -> str:
    """Helper to authenticate as patient01."""
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@example.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200
    return login_resp.json()["access_token"]


def test_upload_medical_report_and_verify_file(client):
    token = get_patient01_token(client)
    synthetic_content = b"%PDF-1.4 Synthetic Demonstration Report Content"

    files = {
        "file": ("lab_report_test.pdf", io.BytesIO(synthetic_content), "application/pdf")
    }
    data = {
        "title": "Comprehensive Blood Metabolic Panel",
        "report_type": "Lab Report",
        "doctor_name": "Dr. Ananya Rao",
        "patient_id": "PAT-DEMO-001",
        "is_sensitive": "false",
    }

    response = client.post(
        "/api/reports/upload",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    resp_data = response.json()
    assert resp_data["title"] == "Comprehensive Blood Metabolic Panel"
    assert resp_data["patient_id"] == "PAT-DEMO-001"
    assert resp_data["file_name"] == "lab_report_test.pdf"
    assert resp_data["file_size"] == len(synthetic_content)

    # Confirm file exists on filesystem in lab-data/uploads/
    assert os.path.exists(resp_data["file_path"])
    with open(resp_data["file_path"], "rb") as f:
        saved_bytes = f.read()
    assert saved_bytes == synthetic_content

    # Clean up test artifact from disk
    try:
        os.remove(resp_data["file_path"])
    except Exception:
        pass


def test_list_medical_reports(client):
    token = get_patient01_token(client)

    # Upload sample
    files = {
        "file": ("spirometry_test.pdf", io.BytesIO(b"Synthetic spirometry test"), "application/pdf")
    }
    data = {
        "title": "Spirometry Pulmonary Assessment",
        "report_type": "Diagnostic Summary",
        "patient_id": "PAT-DEMO-001",
    }
    upload_resp = client.post(
        "/api/reports/upload",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert upload_resp.status_code == 201
    report_id = upload_resp.json()["id"]

    # List reports
    list_resp = client.get(
        "/api/reports",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_resp.status_code == 200
    reports = list_resp.json()
    assert len(reports) >= 1
    assert any(r["id"] == report_id for r in reports)

    # Get single report metadata
    get_resp = client.get(
        f"/api/reports/{report_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Spirometry Pulmonary Assessment"

    # Download report
    dl_resp = client.get(
        f"/api/reports/{report_id}/download",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dl_resp.status_code == 200
    assert dl_resp.content == b"Synthetic spirometry test"

    # Clean up
    try:
        os.remove(upload_resp.json()["file_path"])
    except Exception:
        pass


def test_unauthenticated_reports_access_rejected(client):
    response = client.get("/api/reports")
    assert response.status_code == 401
