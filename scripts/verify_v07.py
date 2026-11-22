"""Verification script for Task 3.7 / V07: Weak Session & Authentication Controls."""

import os
import sys
from jose import jwt

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.routes.auth import HARDCODED_JWT_SECRET

def main():
    client = TestClient(app)

    # 1. Register a new user with a trivial password ("123")
    register_payload = {
        "email": "trivial_user_123@medivault.test",
        "password": "123",
        "full_name": "Trivial Password User",
        "role": "patient",
    }
    reg_resp = client.post("/api/auth/register", json=register_payload)
    assert reg_resp.status_code == 201, f"Expected 201 Created for password '123', got: {reg_resp.status_code} ({reg_resp.text})"
    token_data = reg_resp.json()
    token = token_data["access_token"]
    print(f"[+] V07 Verified: Registration accepted trivial password '123' (201 Created)")

    # 2. Decode JWT and assert it lacks an expiration ('exp') claim
    unverified_claims = jwt.decode(token, HARDCODED_JWT_SECRET, algorithms=["HS256"], options={"verify_signature": True})
    assert "exp" not in unverified_claims, f"Expected non-expiring token without 'exp' claim, but found: {unverified_claims.get('exp')}"
    print(f"[+] V07 Verified: JWT token contains no 'exp' claim: {unverified_claims}")

    # 3. Verify token signed with hardcoded secret
    assert HARDCODED_JWT_SECRET == "medivault-insecure-hardcoded-secret-key-12345"
    print(f"[+] V07 Verified: Token verified using hardcoded secret key '{HARDCODED_JWT_SECRET}'")

    # 4. Use non-expiring token to authenticate to /api/auth/me
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "trivial_user_123@medivault.test"
    print(f"[+] V07 Verified: Authenticated session confirmed valid with non-expiring token")

    # 5. Log in with trivial password
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "trivial_user_123@medivault.test", "password": "123"},
    )
    assert login_resp.status_code == 200
    login_claims = jwt.decode(login_resp.json()["access_token"], HARDCODED_JWT_SECRET, algorithms=["HS256"])
    assert "exp" not in login_claims
    print(f"[+] V07 Verified: Login with password '123' succeeded; returned non-expiring token")

    # 6. Verify frontend localStorage persistence logic
    api_js_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "services", "api.js"))
    with open(api_js_path, "r", encoding="utf-8") as f:
        api_js = f.read()
    assert "localStorage.setItem(TOKEN_KEY, token)" in api_js
    assert "TOKEN_KEY = 'medivault_token'" in api_js
    print("[+] V07 Verified: Frontend persists token in browser localStorage (tokenService)")

    print("\n[SUCCESS] Task 3.7: V07 Weak Session & Authentication Controls verified successfully!")

if __name__ == "__main__":
    main()
