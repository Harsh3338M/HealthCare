"""V08 Verification: Sensitive Data in Application Logs.

Confirms that login credentials, JWT tokens, and identity references
are written to backend/app.log in plaintext after request-logging middleware
processes them.
"""

import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from backend.app.database import Base, engine
from backend.app.main import app, _audit_log_path
from backend.app.seed import seed_database as seed_db


def main():
    # Fresh DB + seed
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_db()

    # Clear any previous log contents
    if os.path.exists(_audit_log_path):
        open(_audit_log_path, "w").close()

    client = TestClient(app)

    # --- Step 1: Login (body contains plaintext password) ---
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@medivault.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}"
    token = login_resp.json()["access_token"]

    # --- Step 2: Profile update with identity reference (body contains PII) ---
    update_resp = client.put(
        "/api/patients/PAT-100001",
        json={"aadhaar_ref": "1002 4471 0001", "medical_notes": "Confidential notes"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_resp.status_code == 200, f"Update failed: {update_resp.status_code}"

    # --- Step 3: Read the log file and check for sensitive data ---
    assert os.path.exists(_audit_log_path), f"Log file not found: {_audit_log_path}"
    log_contents = open(_audit_log_path, "r").read()

    checks = {
        "plaintext password in log": "Password123!" in log_contents,
        "JWT token in log": token[:20] in log_contents,  # first 20 chars is enough
        "Aadhaar reference in log": "1002 4471 0001" in log_contents,
        "medical notes in log": "Confidential notes" in log_contents,
        "Authorization header in log": "Bearer" in log_contents,
    }

    all_pass = True
    for desc, result in checks.items():
        status = "PASS" if result else "FAIL"
        if not result:
            all_pass = False
        print(f"  [{status}] {desc}")

    if not all_pass:
        print("\nFAILED — some sensitive data not found in log.")
        print(f"Log path: {_audit_log_path}")
        print(f"Log length: {len(log_contents)} chars")
        sys.exit(1)

    print("\nV08 PASSED — Sensitive request data logged to backend/app.log")


if __name__ == "__main__":
    main()
