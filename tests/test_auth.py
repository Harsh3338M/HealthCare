"""Automated tests for MediVault Authentication API routes."""

import pytest


def test_login_seeded_user_success(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "patient01@example.test", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "patient01@example.test"
    assert data["user"]["patient_id"] == "PAT-DEMO-001"
    assert data["user"]["role"] == "patient"


def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "patient01@example.test", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_register_new_patient(client):
    payload = {
        "email": "new_patient@example.test",
        "password": "SecurePassword123!",
        "full_name": "Meera Nambiar",
        "role": "patient",
        "date_of_birth": "1992-04-12",
        "gender": "Female",
        "phone": "+91-98765-00000",
        "emergency_contact": "Father (+91-98765-00001)",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new_patient@example.test"
    assert data["user"]["role"] == "patient"
    assert data["user"]["patient_id"].startswith("PAT-")


def test_register_duplicate_email(client):
    payload = {
        "email": "patient01@example.test",
        "password": "Password123!",
        "full_name": "Duplicate User",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_me_endpoint_with_valid_token(client):
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "patient01@example.test", "password": "Password123!"},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    user = response.json()
    assert user["email"] == "patient01@example.test"
    assert user["patient_id"] == "PAT-DEMO-001"


def test_me_endpoint_without_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
