"""V09 Verification: Excessive / Undefined Data Retention.

Confirms that requesting account deletion (DELETE /api/privacy/account)
only sets a soft-delete boolean (is_active=False) while retaining patient rows,
identity records, clinical notes, and physical report files indefinitely.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from backend.app.database import Base, SessionLocal, engine
from backend.app.main import app
from backend.app.models import IdentityRecord, MedicalReport, PatientProfile, User
from backend.app.seed import seed_database


def main():
    # Fresh DB + seed
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()

    client = TestClient(app)

    # 1. Pre-check: Verify patient02 exists with profile, identity record, and files
    db = SessionLocal()
    try:
        user_pre = db.query(User).filter(User.email == "patient02@medivault.test").first()
        assert user_pre is not None, "patient02 user not found"
        assert user_pre.is_active is True

        profile_pre = db.query(PatientProfile).filter(PatientProfile.patient_id == "PAT-100002").first()
        assert profile_pre is not None, "PAT-100002 profile not found"

        reports_pre = db.query(MedicalReport).filter(MedicalReport.patient_id == "PAT-100002").all()
        assert len(reports_pre) > 0, "No medical reports seeded for PAT-100002"

        report_file_path = reports_pre[0].file_path
        assert os.path.exists(report_file_path), f"Report file does not exist: {report_file_path}"
    finally:
        db.close()

    # 2. Authenticate as patient02
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient02@medivault.test", "password": "Password123!"},
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Call DELETE /api/privacy/account
    delete_resp = client.delete("/api/privacy/account", headers=headers)
    assert delete_resp.status_code == 200, f"Account deletion request failed: {delete_resp.status_code}"
    data = delete_resp.json()
    assert data["status"] == "deactivated"
    print(f"  [PASS] DELETE /api/privacy/account returned 200 with status='{data['status']}'")

    # 4. Verify data was NOT purged (soft-delete only)
    db = SessionLocal()
    try:
        user_post = db.query(User).filter(User.email == "patient02@medivault.test").first()
        assert user_post is not None, "User record was permanently purged from database"
        assert user_post.is_active is False, "User is_active was not set to False"
        print("  [PASS] User row retained in database with is_active=False")

        profile_post = db.query(PatientProfile).filter(PatientProfile.patient_id == "PAT-100002").first()
        assert profile_post is not None, "PatientProfile row was permanently purged"
        assert profile_post.is_active is False
        assert profile_post.aadhaar_ref is not None, "Aadhaar reference was wiped"
        print("  [PASS] PatientProfile row retained in database with unmasked Aadhaar reference")

        id_records_post = db.query(IdentityRecord).filter(IdentityRecord.patient_id == "PAT-100002").all()
        assert len(id_records_post) > 0, "Identity records were purged"
        print("  [PASS] Identity records retained in database")

        reports_post = db.query(MedicalReport).filter(MedicalReport.patient_id == "PAT-100002").all()
        assert len(reports_post) > 0, "MedicalReport rows were purged"
        print(f"  [PASS] MedicalReport rows ({len(reports_post)}) retained in database")

        for rep in reports_post:
            assert os.path.exists(rep.file_path), f"Report file was unlinked: {rep.file_path}"
            assert os.path.getsize(rep.file_path) > 0, f"Report file truncated: {rep.file_path}"
        print("  [PASS] Physical report files remain intact on filesystem")
    finally:
        db.close()

    # 5. Subsequent request with patient02 token blocked because is_active=False
    me_resp = client.get("/api/patients/me", headers=headers)
    assert me_resp.status_code == 403, f"Expected 403 for deactivated user, got {me_resp.status_code}"
    print("  [PASS] Token usage by deactivated user rejected with 403 Forbidden")

    print("\nV09 PASSED — Account deletion soft-deletes while retaining all data and files indefinitely.")


if __name__ == "__main__":
    main()
