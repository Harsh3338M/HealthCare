"""Verification script for Task 3.4 / V04: Weak Storage Protection."""

import os
import sqlite3
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "medivault.db"))

def main():
    assert os.path.exists(DB_PATH), f"Database file not found at {DB_PATH}"

    # 1. Connect directly to SQLite file to inspect stored columns
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Verify patient_profiles plaintext columns
    cursor.execute("SELECT patient_id, full_name, aadhaar_ref, ayushman_ref, medical_notes FROM patient_profiles")
    rows = cursor.fetchall()
    assert len(rows) >= 2, f"Expected at least 2 seeded patients, found {len(rows)}"

    p1 = next(r for r in rows if r[0] == "PAT-100001")
    p2 = next(r for r in rows if r[0] == "PAT-100002")

    # Verify Aarav Sharma plaintext data
    assert p1[2] == "1002 4471 0001", f"Expected plaintext Aadhaar, got: {p1[2]}"
    assert p1[3] == "PMJAY-0000-0001", f"Expected plaintext Ayushman, got: {p1[3]}"
    assert "cognitive behavioral therapy" in p1[4], f"Expected plaintext clinical notes, got: {p1[4]}"
    print(f"[+] V04 Verified: PAT-100001 SQLite plaintext storage:")
    print(f"    - aadhaar_ref:  '{p1[2]}'")
    print(f"    - ayushman_ref: '{p1[3]}'")
    print(f"    - medical_notes: '{p1[4][:55]}...'")

    # Verify Priya Patel plaintext data
    assert p2[2] == "1002 4471 0002"
    assert "pre-pregnancy" in p2[4]
    print(f"[+] V04 Verified: PAT-100002 SQLite plaintext storage:")
    print(f"    - aadhaar_ref:  '{p2[2]}'")
    print(f"    - medical_notes: '{p2[4][:55]}...'")

    # Verify identity_records table
    cursor.execute("SELECT patient_id, scheme_name, aadhaar_ref, ayushman_ref FROM identity_records")
    id_rows = cursor.fetchall()
    assert any(r[2] == "1002 4471 0001" for r in id_rows)
    print(f"[+] V04 Verified: identity_records table also stores plaintext references directly.")

    conn.close()

    # 2. Test profile update persistence as plaintext
    client = TestClient(app)
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@medivault.test", "password": "Password123!"},
    )
    token = login_resp.json()["access_token"]

    original_notes = p1[4]
    original_aadhaar = p1[2]

    # Send profile update with new plaintext values
    test_aadhaar = "1002 9999 8888"
    test_notes = "Plaintext clinical update test string."
    update_resp = client.put(
        "/api/patients/PAT-100001",
        json={"aadhaar_ref": test_aadhaar, "medical_notes": test_notes},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_resp.status_code == 200

    # Query SQLite directly to confirm updated values are unencrypted
    conn2 = sqlite3.connect(DB_PATH)
    cur2 = conn2.cursor()
    cur2.execute("SELECT aadhaar_ref, medical_notes FROM patient_profiles WHERE patient_id = 'PAT-100001'")
    updated_row = cur2.fetchone()
    assert updated_row[0] == test_aadhaar, f"Expected {test_aadhaar}, got {updated_row[0]}"
    assert updated_row[1] == test_notes, f"Expected {test_notes}, got {updated_row[1]}"
    print(f"[+] V04 Verified: PUT /api/patients/PAT-100001 persisted plaintext into SQLite: '{updated_row[0]}'")

    # Restore original baseline values
    restore_resp = client.put(
        "/api/patients/PAT-100001",
        json={"aadhaar_ref": original_aadhaar, "medical_notes": original_notes},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert restore_resp.status_code == 200
    conn2.close()
    print("[+] Baseline patient data restored successfully.")

    print("\n[SUCCESS] Task 3.4: V04 Weak Storage Protection verified successfully!")

if __name__ == "__main__":
    main()
