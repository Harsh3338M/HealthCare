# MediVault — Development Tasks Breakdown

This document tracks sequential, atomic tasks derived from the MediVault Implementation Plan (`.agent/plan.md`). Each task is designed to be completed in a single turn touching at most 1–3 files and includes an explicit verification step.

---

## Phase 1: Foundation & Synthetic Seeding

- [x] Task 1.1: Backend Project Structure & Configuration
  - Files: `backend/requirements.txt`, `backend/app/config.py`, `.env.example`
  - Description: Initialize backend project layout, configure Pydantic/environment settings for `APP_MODE` (`LAB_VULNERABLE` vs `LAB_REMEDIATED`), database URL, and JWT secrets with `.env.example`.
  - Verification: Run `python -c "from backend.app.config import settings; print(settings.APP_MODE)"` to confirm configuration loads with default `LAB_VULNERABLE`.

- [x] Task 1.2: Database Engine & Session Management
  - Files: `backend/app/database.py`
  - Description: Configure SQLAlchemy SQLite engine, session maker, declarative base, and a `get_db` dependency provider for FastAPI routes.
  - Verification: Run `python -c "from backend.app.database import engine; print(engine.url)"` to verify SQLite connection initialization.

- [x] Task 1.3: SQLAlchemy Core Data Models
  - Files: `backend/app/models.py`
  - Description: Define ORM models for `User`, `PatientProfile`, `IdentityRecord`, `MedicalReport`, `ConsentRecord`, and `AuditLog` supporting dual-mode synthetic data fields.
  - Verification: Run `python -c "from backend.app.database import Base, engine; import backend.app.models; Base.metadata.create_all(bind=engine)"` to verify database table creation.

- [x] Task 1.4: Synthetic Data & Watermarked PDF Seeder
  - Files: `backend/app/seed.py`
  - Description: Implement seed script generating 5 demo accounts (`patient01`, `patient02`, `reception`, `doctor`, `privacy`), synthetic medical records, dummy `backup_dump.sql`, and watermarked synthetic PDF reports in `lab-data/`.
  - Verification: Run `python -m backend.app.seed` and verify database records exist and files are created in `lab-data/uploads/` and `lab-data/backups/`.

- [x] Task 1.5: FastAPI Base Application & Mode Endpoints
  - Files: `backend/app/main.py`
  - Description: Initialize FastAPI application with CORS middleware, health check endpoint (`GET /api/health`), and lab mode inspector/toggle endpoint (`GET /api/mode`, `POST /api/mode`).
  - Verification: Start FastAPI test server or execute `pytest` / curl to verify `GET /api/health` and `GET /api/mode` return 200 OK with `{"status": "ok", "app_mode": "LAB_VULNERABLE"}`.

- [x] Task 1.6: Frontend Vite + React + Tailwind Initialization
  - Files: `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`
  - Description: Initialize React frontend with Vite, Tailwind CSS, and essential icons/routing dependencies.
  - Verification: Run `npm run build` in `frontend/` to confirm clean compilation and asset generation.

- [x] Task 1.7: Frontend Mode Indicator Banner & App Shell
  - Files: `frontend/src/App.jsx`, `frontend/src/components/ModeBanner.jsx`, `frontend/src/components/Navbar.jsx`
  - Description: Build global navigation bar and educational top banner displaying the active `APP_MODE` (`LAB_VULNERABLE` in red/amber vs `LAB_REMEDIATED` in green) with quick toggle functionality.
  - Verification: Run `npm run build` in `frontend/` to confirm components compile cleanly without syntax or import errors.

---

## Phase 2: Core Healthcare Portal UI & API

- [x] Task 2.1: Authentication API Routes
  - Files: `backend/app/schemas/auth.py`, `backend/app/routes/auth.py`, `backend/app/main.py`
  - Description: Implement user registration (`POST /api/auth/register`) and login (`POST /api/auth/login`) with role assignment and token generation; mount router in `main.py`.
  - Verification: Send POST request to `/api/auth/login` with seeded synthetic credentials; verify 200 response containing access token and user payload.

- [x] Task 2.2: Frontend Authentication Pages
  - Files: `frontend/src/pages/Auth.jsx`, `frontend/src/services/api.js`
  - Description: Build login and registration UI with quick demo-credential fill buttons (`patient01`, `doctor`, `reception`, etc.) and synthetic data educational warnings.
  - Verification: Run `npm run build` in `frontend/` to ensure authentication view and API client compile without errors.

- [x] Task 2.3: Patient Profile API Endpoints
  - Files: `backend/app/schemas/patient.py`, `backend/app/routes/patients.py`, `backend/app/main.py`
  - Description: Implement endpoints `GET /api/patients/me`, `GET /api/patients/{id}`, and `PUT /api/patients/{id}` for retrieving and updating patient vitals, conditions, and dummy identity schemes.
  - Verification: Authenticate as `patient01` and send GET `/api/patients/me`; verify 200 OK returning synthetic patient profile details.

- [x] Task 2.4: Frontend Patient Dashboard & Profile Views
  - Files: `frontend/src/pages/PatientDashboard.jsx`, `frontend/src/pages/MedicalProfile.jsx`
  - Description: Create unified patient dashboard displaying health summary, allergies, conditions, dummy identity card (Aadhaar/PM-JAY reference), and edit forms.
  - Verification: Run `npm run build` in `frontend/` to verify patient dashboard and profile components build cleanly.

- [x] Task 2.5: Medical Reports API Endpoints
  - Files: `backend/app/routes/reports.py`, `backend/app/schemas/report.py`, `backend/app/main.py`
  - Description: Implement report listing (`GET /api/reports`) and multipart report upload (`POST /api/reports/upload`), storing uploaded synthetic documents in `lab-data/uploads/`.
  - Verification: Send POST request to `/api/reports/upload` with a synthetic test file; verify 201 Created and confirm file presence in `lab-data/uploads/`.

- [x] Task 2.6: Frontend Medical Reports Manager & Viewer
  - Files: `frontend/src/components/ReportUploader.jsx`, `frontend/src/pages/Reports.jsx`
  - Description: Build file upload dropzone and synthetic lab report list with preview and download actions.
  - Verification: Run `npm run build` in `frontend/` to verify report upload and viewer components compile with no errors.

- [x] Task 2.7: Staff Patient Directory API
  - Files: `backend/app/routes/staff.py`, `backend/app/schemas/staff.py`, `backend/app/main.py`
  - Description: Implement staff endpoints `GET /api/staff/patients` (search and list synthetic patients) and `GET /api/staff/patients/{id}` (inspect patient clinical record).
  - Verification: Send GET `/api/staff/patients` using a staff token; verify 200 OK response returning synthetic patient list.

- [ ] Task 2.8: Frontend Staff / Admin Dashboard
  - Files: `frontend/src/pages/StaffDashboard.jsx`, `frontend/src/components/PatientRecordDrawer.jsx`
  - Description: Implement staff portal with patient search table, record inspector drawer, role switcher indicator, and audit event feed.
  - Verification: Run `npm run build` in `frontend/` to confirm staff dashboard components compile without errors.

- [ ] Task 2.9: Privacy Centre API Endpoints
  - Files: `backend/app/routes/privacy.py`, `backend/app/schemas/privacy.py`, `backend/app/main.py`
  - Description: Implement endpoints for managing consent preferences (`GET/POST /api/privacy/consent`), data access requests (`POST /api/privacy/rights-request`), and grievance filing (`POST /api/privacy/grievance`).
  - Verification: Send POST request to `/api/privacy/rights-request` with type `export`; verify 200 OK response acknowledging request.

- [ ] Task 2.10: Frontend Landing Page & Privacy Centre
  - Files: `frontend/src/pages/Home.jsx`, `frontend/src/pages/PrivacyCentre.jsx`
  - Description: Create healthcare landing page (services overview, synthetic disclaimer, FAQs) and Privacy Centre (consent controls, data category breakdown, rights request form).
  - Verification: Run `npm run build` in `frontend/` to confirm landing page and privacy center views compile cleanly.

---

## Phase 3: Implementing 12 Controlled Vulnerabilities (LAB_VULNERABLE)

- [ ] Task 3.1: V01 - Broken Object-Level Authorisation (IDOR / BOLA)
  - Files: `backend/app/routes/patients.py`
  - Description: Under `LAB_VULNERABLE`, bypass user-ownership checks on `GET /api/patients/{id}` and `GET /api/patients/{id}/reports` to allow accessing any patient ID.
  - Verification: Send GET `/api/patients/PAT-DEMO-002` with `patient01` credentials in `LAB_VULNERABLE` mode; verify 200 OK returning `patient02` data.

- [ ] Task 3.2: V02 - Excessive Staff Privileges
  - Files: `backend/app/routes/staff.py`
  - Description: Under `LAB_VULNERABLE`, omit role checks on `/api/staff/patients/{id}/clinical` to allow basic receptionist account (`reception@example.test`) access to full doctor-restricted clinical histories.
  - Verification: Send GET `/api/staff/patients/PAT-DEMO-001/clinical` with `reception@example.test` token; verify 200 OK returning sensitive clinical notes.

- [ ] Task 3.3: V03 - Excessive Data Exposure in API
  - Files: `backend/app/routes/patients.py`, `backend/app/schemas/patient.py`
  - Description: Under `LAB_VULNERABLE`, serialize unmasked model payloads on `/api/patients/me` and `/api/patients/{id}`, leaking `password_hash`, internal notes, and raw identity numbers.
  - Verification: Inspect JSON response of GET `/api/patients/me`; verify presence of `password_hash` and unmasked `aadhaar_demo_ref`.

- [ ] Task 3.4: V04 - Weak Storage Protection
  - Files: `backend/app/routes/patients.py`, `backend/app/models.py`
  - Description: Under `LAB_VULNERABLE`, store synthetic Aadhaar/PM-JAY references and medical records directly in plain text in the SQLite database without masking or encryption.
  - Verification: Query SQLite directly (`SELECT aadhaar_demo_ref, medical_notes FROM patient_profiles`) and verify plaintext values exist in the database file.

- [ ] Task 3.5: V05 - Publicly Reachable Test Documents & Backups
  - Files: `backend/app/main.py`
  - Description: Under `LAB_VULNERABLE`, mount `lab-data/` statically at `/public/uploads/` and `/public/backups/` without requiring authentication headers or tokens.
  - Verification: Send unauthenticated GET request to `http://127.0.0.1:8000/public/backups/backup_dump.sql`; verify 200 OK returning the SQL dump.

- [ ] Task 3.6: V06 - Insecure File Upload Validation
  - Files: `backend/app/routes/reports.py`
  - Description: Under `LAB_VULNERABLE`, accept uploaded files without MIME validation, extension whitelisting, or file signature checks, allowing arbitrary file types (e.g., `.html`, `.svg`).
  - Verification: Send POST request to `/api/reports/upload` with an HTML/SVG test file; verify 201 Created and confirm file is stored on disk.

- [ ] Task 3.7: V07 - Weak Session & Authentication Controls
  - Files: `backend/app/routes/auth.py`, `frontend/src/services/api.js`
  - Description: Under `LAB_VULNERABLE`, issue non-expiring JWTs with hardcoded secrets, store tokens in accessible `localStorage`, and permit trivial passwords (e.g., `123`).
  - Verification: Register a synthetic user with password `123`; verify token issued has no expiration and is persisted in `localStorage`.

- [ ] Task 3.8: V08 - Sensitive Data in Application Logs
  - Files: `backend/app/main.py`
  - Description: Under `LAB_VULNERABLE`, log full raw incoming request bodies and query parameters, including plaintext credentials and synthetic Aadhaar references, to `backend/app.log`.
  - Verification: Perform a login/profile update request; check `backend/app.log` and verify raw credentials/Aadhaar references appear in the log output.

- [ ] Task 3.9: V09 - Excessive / Undefined Data Retention
  - Files: `backend/app/routes/privacy.py`
  - Description: Under `LAB_VULNERABLE`, handle account deletion and consent withdrawal as superficial soft deletes, retaining patient rows and medical report files indefinitely with no purge mechanism.
  - Verification: Send DELETE `/api/privacy/account`; query database and filesystem to verify patient row and stored report files still exist intact.

- [ ] Task 3.10: V10 - Dark-Pattern Privacy Notice & Consent UX
  - Files: `frontend/src/components/ConsentModal.jsx`, `frontend/src/pages/Auth.jsx`
  - Description: Under `LAB_VULNERABLE`, display bundled pre-checked consent checkboxes during registration, vague processing descriptions, and hide or disable the consent revocation button.
  - Verification: Open registration page in vulnerable mode; verify consent checkboxes are pre-checked by default and opt-out controls are obscured.

- [ ] Task 3.11: V11 - Missing Rights & Grievance Workflow
  - Files: `backend/app/routes/privacy.py`, `frontend/src/pages/PrivacyCentre.jsx`
  - Description: Under `LAB_VULNERABLE`, make data export and grievance submission links trigger dead ends (mock 500/404 or unmonitored submission with no tracking ID).
  - Verification: Submit data-rights request or grievance in vulnerable mode; verify response returns generic unmonitored failure or lacks tracking ID.

- [ ] Task 3.12: V12 - Incomplete Breach-Response Workflow
  - Files: `backend/app/routes/staff.py`, `frontend/src/pages/StaffDashboard.jsx`
  - Description: Under `LAB_VULNERABLE`, display simulated breach alert banner in staff panel without audit log correlation to identify which specific synthetic patient records were accessed.
  - Verification: Trigger simulated breach in staff panel; verify alert appears but incident inspection shows "0 correlated patient records identified".

---

## Phase 4: Implementing Remediations & Automated Tests (LAB_REMEDIATED)

- [ ] Task 4.1: Remediate V01 & V02 - Enforce Strict Ownership & Role-Based Access Control
  - Files: `backend/app/routes/patients.py`, `backend/app/routes/staff.py`
  - Description: In `LAB_REMEDIATED` mode, enforce strict ownership verification on `/api/patients/{id}` (matching token user) and strict RBAC (`doctor`, `admin_dpo`) on clinical routes.
  - Verification: Send GET `/api/patients/PAT-DEMO-002` with `patient01` token and GET `/api/staff/patients/PAT-DEMO-001/clinical` with `reception` token; verify both return 403 Forbidden.

- [ ] Task 4.2: Remediate V03 & V04 - Strict Response DTOs & Synthetic Data Masking/Encryption
  - Files: `backend/app/schemas/patient.py`, `backend/app/routes/patients.py`, `backend/app/utils/security.py`
  - Description: In `LAB_REMEDIATED` mode, sanitize API output via Pydantic DTOs (excluding password hashes and internal notes) and mask Aadhaar numbers (`XXXX-XXXX-0001`) with encryption-at-rest utility for database storage.
  - Verification: Send GET `/api/patients/me`; verify password fields are omitted and Aadhaar is returned as `XXXX-XXXX-0001`.

- [ ] Task 4.3: Remediate V05 & V06 - Authenticated File Streaming & Strict Upload Validation
  - Files: `backend/app/main.py`, `backend/app/routes/reports.py`
  - Description: In `LAB_REMEDIATED` mode, remove static mounts, stream files only through authenticated `GET /api/reports/{id}/download` with ownership checks, and enforce magic-byte checking (PDF only) and 5MB size limit on upload.
  - Verification: Send unauthenticated GET to `/public/backups/backup_dump.sql` (verify 404) and attempt uploading `.svg`/`.exe` to `/api/reports/upload` (verify 400 Bad Request).

- [ ] Task 4.4: Remediate V07 & V08 - Secure Token Handling & Redacted Audit Logging
  - Files: `backend/app/routes/auth.py`, `backend/app/main.py`, `backend/app/utils/logger.py`
  - Description: In `LAB_REMEDIATED` mode, enforce short-lived JWTs, strong password complexity validation, secure cookie guidelines, and redact sensitive PII (credentials, Aadhaar, tokens) from application logs.
  - Verification: Attempt registration with password `123` (returns 422/400); inspect `backend/app.log` and verify PII tokens appear as `[REDACTED]`.

- [ ] Task 4.5: Remediate V09, V10, V11 & V12 - Privacy Rights, Consent UX, Retention & Incident Correlation
  - Files: `backend/app/routes/privacy.py`, `backend/app/routes/staff.py`, `frontend/src/pages/PrivacyCentre.jsx`
  - Description: In `LAB_REMEDIATED` mode, implement retention purge (hard delete patient data and associated files), explicit unbundled consent checkboxes with active withdrawal, functional data export (JSON/ZIP) with grievance tracking IDs, and breach-impact correlation listing affected patient IDs.
  - Verification: Request data export (returns 200 with downloadable bundle and tracking ID) and trigger breach simulation (displays exact list of compromised patient IDs).

- [ ] Task 4.6: Automated Dual-Mode Pytest Suite
  - Files: `tests/test_security_lab.py`, `backend/requirements.txt`
  - Description: Implement automated pytest test suite verifying all 12 vulnerabilities succeed in `LAB_VULNERABLE` mode and are strictly blocked/remediated in `LAB_REMEDIATED` mode.
  - Verification: Run `pytest tests/test_security_lab.py -v` and verify all tests pass across both modes.

---

## Phase 5: Polish & Hackathon Pitch Prep

- [ ] Task 5.1: Documentation & Exploit Runbook
  - Files: `README.md`, `VULNERABILITY.md`
  - Description: Update `README.md` with setup and demo credentials; create `VULNERABILITY.md` containing detailed writeups, exact curl commands, and remediation explanations for all 12 flaws.
  - Verification: Verify markdown formatting, credentials table, and accuracy of curl commands against the running API.

- [ ] Task 5.2: Live Demo Rehearsal & Verification
  - Files: `README.md`
  - Description: Rehearse the 7-minute live presentation flow (`patient01` login -> IDOR demo -> public PDF access -> breach alert -> flip to `LAB_REMEDIATED` -> verify 403 / masked data / correlated incident log).
  - Verification: Complete end-to-end dry run in browser and terminal; verify zero console errors and seamless mode toggling.
