"""Verification script for Task 3.3 / V03: Excessive Data Exposure in API."""

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
    print("[+] Successfully authenticated as patient01@medivault.test")

    # 2. Call GET /api/patients/me and inspect JSON response for excessive data exposure
    me_resp = client.get(
        "/api/patients/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200, f"Failed GET /api/patients/me: {me_resp.text}"
    me_data = me_resp.json()

    # Verify password_hash exposure
    assert "password_hash" in me_data and me_data["password_hash"] is not None, "Missing password_hash in response!"
    assert me_data["password_hash"].startswith("$2b$"), f"Invalid password_hash format: {me_data['password_hash']}"
    print(f"[+] V03 Verified: password_hash exposed in /api/patients/me: {me_data['password_hash'][:18]}...")

    # Verify unmasked Aadhaar and Ayushman scheme references
    assert me_data["aadhaar_ref"] == "1002 4471 0001", f"Unexpected aadhaar_ref: {me_data['aadhaar_ref']}"
    assert me_data["ayushman_ref"] == "PMJAY-0000-0001", f"Unexpected ayushman_ref: {me_data['ayushman_ref']}"
    print(f"[+] V03 Verified: Unmasked Aadhaar ref exposed: {me_data['aadhaar_ref']}")
    print(f"[+] V03 Verified: Unmasked Ayushman ref exposed: {me_data['ayushman_ref']}")

    # Verify internal medical notes exposure
    assert "medical_notes" in me_data and me_data["medical_notes"] is not None
    assert "mindfulness" in me_data["medical_notes"] or "cognitive" in me_data["medical_notes"]
    print(f"[+] V03 Verified: Internal medical notes exposed in patient self-lookup: {me_data['medical_notes'][:50]}...")

    # 3. Call GET /api/patients/PAT-100002 to verify excessive exposure across object endpoints (IDOR + Exposure)
    p2_resp = client.get(
        "/api/patients/PAT-100002",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert p2_resp.status_code == 200, f"Failed GET /api/patients/PAT-100002: {p2_resp.text}"
    p2_data = p2_resp.json()
    assert "password_hash" in p2_data and p2_data["password_hash"].startswith("$2b$")
    assert p2_data["aadhaar_ref"] == "1002 4471 0002"
    print(f"[+] V03 Verified: Patient 2's password_hash exposed to Patient 1 via IDOR: {p2_data['password_hash'][:18]}...")

    print("\n[SUCCESS] Task 3.3: V03 Excessive Data Exposure in API verified successfully!")

if __name__ == "__main__":
    main()
