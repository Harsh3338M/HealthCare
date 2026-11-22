"""Verification script for Task 3.5 / V05: Publicly Reachable Documents & Backups."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app

def main():
    client = TestClient(app)

    # 1. Unauthenticated request to database backup dump
    backup_resp = client.get("/public/backups/backup_dump.sql")
    assert backup_resp.status_code == 200, f"Expected 200 OK for public backup, got: {backup_resp.status_code}"
    dump_text = backup_resp.text
    assert "CREATE TABLE IF NOT EXISTS users" in dump_text, "SQL structure missing from dump"
    assert "patient01@medivault.test" in dump_text, "User accounts missing from dump"
    assert "PMJAY-0000-0001" in dump_text, "Identity references missing from dump"
    print(f"[+] V05 Verified: Unauthenticated GET /public/backups/backup_dump.sql returned 200 ({len(dump_text)} bytes)")
    print(f"    Exposed user table dump and patient records without credentials.")

    # 2. Unauthenticated request to patient clinical PDF report
    report_resp = client.get("/public/uploads/report_PAT-100001.pdf")
    assert report_resp.status_code == 200, f"Expected 200 OK for public report, got: {report_resp.status_code}"
    assert report_resp.headers.get("content-type") == "application/pdf"
    assert len(report_resp.content) > 1000, "Expected non-empty PDF binary stream"
    print(f"[+] V05 Verified: Unauthenticated GET /public/uploads/report_PAT-100001.pdf returned 200 ({len(report_resp.content)} bytes)")

    # 3. Unauthenticated request to prescription document
    rx_resp = client.get("/public/uploads/prescription_PAT-100001.pdf")
    assert rx_resp.status_code == 200, f"Expected 200 OK for public prescription, got: {rx_resp.status_code}"
    print(f"[+] V05 Verified: Unauthenticated GET /public/uploads/prescription_PAT-100001.pdf returned 200 ({len(rx_resp.content)} bytes)")

    print("\n[SUCCESS] Task 3.5: V05 Publicly Reachable Documents & Backups verified successfully!")

if __name__ == "__main__":
    main()
