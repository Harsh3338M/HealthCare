"""Verification script for Task 3.6 / V06: Insecure File Upload Validation."""

import io
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

    # 2. Upload an HTML file containing JavaScript (stored XSS vector)
    html_filename = "stored_xss_payload.html"
    html_content = b"<!DOCTYPE html><html><body><h1>Medical Diagnostic Portal</h1><script>alert('V06_STORED_XSS');</script></body></html>"
    
    upload_resp_html = client.post(
        "/api/reports/upload",
        files={"file": (html_filename, io.BytesIO(html_content), "text/html")},
        data={"title": "Interactive Diagnostic Diagram", "report_type": "Diagnostic Summary"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert upload_resp_html.status_code == 201, f"Expected 201 for HTML upload, got: {upload_resp_html.status_code}"
    html_data = upload_resp_html.json()
    assert html_data["file_name"] == html_filename
    print(f"[+] V06 Verified: Arbitrary HTML file uploaded with 201 Created: {html_data['file_path']}")

    # Confirm file exists on disk under original name
    disk_path = html_data["file_path"]
    assert os.path.exists(disk_path), f"File missing from disk: {disk_path}"
    with open(disk_path, "rb") as f:
        assert f.read() == html_content

    # 3. Confirm file is immediately reachable via V05's public unauthenticated path
    public_url = f"/public/uploads/{html_filename}"
    public_resp_html = client.get(public_url)
    assert public_resp_html.status_code == 200, f"Expected 200 for public static access, got: {public_resp_html.status_code}"
    assert "V06_STORED_XSS" in public_resp_html.text
    print(f"[+] V06 Verified: Uploaded HTML file reachable at {public_url} without authentication")

    # 4. Upload an SVG file with embedded script (vector for SVG stored XSS)
    svg_filename = "clinical_chart.svg"
    svg_content = b"""<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/><script>alert('SVG_XSS');</script></svg>"""
    upload_resp_svg = client.post(
        "/api/reports/upload",
        files={"file": (svg_filename, io.BytesIO(svg_content), "image/svg+xml")},
        data={"title": "Cardiology Vector Chart", "report_type": "Lab Report"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert upload_resp_svg.status_code == 201
    svg_data = upload_resp_svg.json()
    assert os.path.exists(svg_data["file_path"])
    print(f"[+] V06 Verified: SVG file accepted and stored under original name: {svg_data['file_name']}")

    public_resp_svg = client.get(f"/public/uploads/{svg_filename}")
    assert public_resp_svg.status_code == 200
    assert "SVG_XSS" in public_resp_svg.text
    print(f"[+] V06 Verified: SVG script reachable at /public/uploads/{svg_filename}")

    # Clean up test artifacts
    try:
        os.remove(disk_path)
        os.remove(svg_data["file_path"])
    except Exception:
        pass

    print("\n[SUCCESS] Task 3.6: V06 Insecure File Upload Validation verified successfully!")

if __name__ == "__main__":
    main()
