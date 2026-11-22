# MediVault — Development Tasks Breakdown

This document tracks sequential, atomic tasks derived from the MediVault Implementation Plan (`.agent/plan.md`). Each task is designed to be completed in a single turn touching at most 1–3 files and includes an explicit verification step.

> ## Revision Notes (Plan Change)
> The plan changed after Task 2.7 was completed:
> 1. **No dual-mode.** There is no `LAB_VULNERABLE` / `LAB_REMEDIATED` toggle. The 12 vulnerabilities are permanently built into the application. Remediations are **documented only** (with example fix code in `VULNERABILITY.md`), not implemented as a runtime mode.
> 2. **No visible "lab" signals.** The website must look and behave like a genuine healthcare portal: no mode banner, no "educational/synthetic" banners, no demo-credential buttons, no `DEMO`/`dummy`/`test` wording in UI copy, API messages, seeded identifiers or generated reports. All disclosure lives in `README.md`.
> 3. **Full documentation.** Every vulnerability is documented in `VULNERABILITY.md` with exact file path and line numbers, code excerpt, exploit steps, impact and recommended fix. A checker script keeps line references honest.
>
> **Handling of completed work (Tasks 1.1–2.7):** Their checkboxes stay `[x]`. Where a completed task conflicts with the new plan, it is annotated with `⚠ Superseded by R.x` and the correction is scheduled as a new future task in **Phase 2R** (inserted directly after 2.7 so later tasks build on a clean base). Completed tasks with no conflict are untouched.

---

## Phase 1: Foundation & Synthetic Seeding

- [x] Task 1.1: Backend Project Structure & Configuration
  - Files: `backend/requirements.txt`, `backend/app/config.py`, `.env.example`
  - Description: Initialize backend project layout, configure Pydantic/environment settings for `APP_MODE` (`LAB_VULNERABLE` vs `LAB_REMEDIATED`), database URL, and JWT secrets with `.env.example`.
  - Verification: Run `python -c "from backend.app.config import settings; print(settings.APP_MODE)"` to confirm configuration loads with default `LAB_VULNERABLE`.
  - ⚠ Superseded by R.1 (`APP_MODE` is removed).

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
  - ⚠ Superseded by R.4 (visible watermarks, `DEMO` identifiers and "dummy" labels are removed).

- [x] Task 1.5: FastAPI Base Application & Mode Endpoints
  - Files: `backend/app/main.py`
  - Description: Initialize FastAPI application with CORS middleware, health check endpoint (`GET /api/health`), and lab mode inspector/toggle endpoint (`GET /api/mode`, `POST /api/mode`).
  - Verification: Start FastAPI test server or execute `pytest` / curl to verify `GET /api/health` and `GET /api/mode` return 200 OK with `{"status": "ok", "app_mode": "LAB_VULNERABLE"}`.
  - ⚠ Superseded by R.1 (`/api/mode` removed; health no longer reports a mode).

- [x] Task 1.6: Frontend Vite + React + Tailwind Initialization
  - Files: `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`
  - Description: Initialize React frontend with Vite, Tailwind CSS, and essential icons/routing dependencies.
  - Verification: Run `npm run build` in `frontend/` to confirm clean compilation and asset generation.

- [x] Task 1.7: Frontend Mode Indicator Banner & App Shell
  - Files: `frontend/src/App.jsx`, `frontend/src/components/ModeBanner.jsx`, `frontend/src/components/Navbar.jsx`
  - Description: Build global navigation bar and educational top banner displaying the active `APP_MODE` (`LAB_VULNERABLE` in red/amber vs `LAB_REMEDIATED` in green) with quick toggle functionality.
  - Verification: Run `npm run build` in `frontend/` to confirm components compile cleanly without syntax or import errors.
  - ⚠ Superseded by R.2 (`ModeBanner` and toggle removed; navbar kept).

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
  - ⚠ Superseded by R.3 (demo-credential buttons and warnings removed).

- [x] Task 2.3: Patient Profile API Endpoints
  - Files: `backend/app/schemas/patient.py`, `backend/app/routes/patients.py`, `backend/app/main.py`
  - Description: Implement endpoints `GET /api/patients/me`, `GET /api/patients/{id}`, and `PUT /api/patients/{id}` for retrieving and updating patient vitals, conditions, and dummy identity schemes.
  - Verification: Authenticate as `patient01` and send GET `/api/patients/me`; verify 200 OK returning synthetic patient profile details.

- [x] Task 2.4: Frontend Patient Dashboard & Profile Views
  - Files: `frontend/src/pages/PatientDashboard.jsx`, `frontend/src/pages/MedicalProfile.jsx`
  - Description: Create unified patient dashboard displaying health summary, allergies, conditions, dummy identity card (Aadhaar/PM-JAY reference), and edit forms.
  - Verification: Run `npm run build` in `frontend/` to verify patient dashboard and profile components build cleanly.
  - ⚠ UI copy to be audited in R.5.

- [x] Task 2.5: Medical Reports API Endpoints
  - Files: `backend/app/routes/reports.py`, `backend/app/schemas/report.py`, `backend/app/main.py`
  - Description: Implement report listing (`GET /api/reports`) and multipart report upload (`POST /api/reports/upload`), storing uploaded synthetic documents in `lab-data/uploads/`.
  - Verification: Send POST request to `/api/reports/upload` with a synthetic test file; verify 201 Created and confirm file presence in `lab-data/uploads/`.

- [x] Task 2.6: Frontend Medical Reports Manager & Viewer
  - Files: `frontend/src/components/ReportUploader.jsx`, `frontend/src/pages/Reports.jsx`
  - Description: Build file upload dropzone and synthetic lab report list with preview and download actions.
  - Verification: Run `npm run build` in `frontend/` to verify report upload and viewer components compile with no errors.
  - ⚠ UI copy to be audited in R.6.

- [x] Task 2.7: Staff Patient Directory API
  - Files: `backend/app/routes/staff.py`, `backend/app/schemas/staff.py`, `backend/app/main.py`
  - Description: Implement staff endpoints `GET /api/staff/patients` (search and list synthetic patients) and `GET /api/staff/patients/{id}` (inspect patient clinical record).
  - Verification: Send GET `/api/staff/patients` using a staff token; verify 200 OK response returning synthetic patient list.

---

## Phase 2R: Plan-Change Refactor (new — complete before Task 2.8)

These tasks bring the already-built foundation in line with the "single permanent build, no visible lab signals" plan. Numbered `R.x` so existing task numbers remain stable.

- [x] Task R.1: Remove Lab-Mode Backend Switch
  - Files: `backend/app/config.py`, `backend/app/main.py`, `.env.example`
  - Description: Delete `APP_MODE` and every reference to it. Remove `GET/POST /api/mode`. `GET /api/health` returns only `{"status": "ok"}`. Set FastAPI `title`/`description` to neutral product copy (e.g. "MediVault Patient Portal API"). Remove mode-related entries from `.env.example`; keep DB URL and JWT settings.
  - Verification: `grep -rn "APP_MODE\|LAB_VULNERABLE\|LAB_REMEDIATED" backend/ .env.example` returns nothing; `GET /api/mode` returns 404; `GET /api/health` returns `{"status": "ok"}`.

- [x] Task R.2: Remove Mode Banner & Toggle From Frontend Shell
  - Files: `frontend/src/App.jsx`, `frontend/src/components/Navbar.jsx`, `frontend/index.html`
  - Description: Delete `frontend/src/components/ModeBanner.jsx` and its usage; remove any mode fetch/toggle logic from the app shell and navbar. Set `<title>` and meta description in `index.html` to normal portal branding. Remove any mode-related functions from `frontend/src/services/api.js` if present.
  - Verification: `npm run build` in `frontend/` succeeds; `grep -rn "ModeBanner\|APP_MODE\|LAB_\|/api/mode" frontend/src frontend/index.html` returns nothing.

- [x] Task R.3: De-label Authentication Pages
  - Files: `frontend/src/pages/Auth.jsx`, `frontend/src/services/api.js`
  - Description: Remove demo-credential quick-fill buttons and all "synthetic/educational/test data" warnings from login and registration. Placeholder text must look like a real portal (e.g. "Email address", "Password"). Seeded credentials are documented only in `README.md`.
  - Verification: `npm run build` succeeds; open `/auth` and confirm no demo buttons or lab wording; `grep -rni "demo\|synthetic\|dummy\|educational" frontend/src/pages/Auth.jsx` returns nothing.

- [x] Task R.4: Neutralise Seed Data, Identifiers & Generated Documents
  - Files: `backend/app/seed.py` (plus `backend/app/models.py` only if column defaults contain `DEMO`)
  - Description:
    - Rename IDs from `PAT-DEMO-00x` / `STF-DEMO-00x` / `ADM-DEMO-001` to production-style IDs (`PAT-100001`, `PAT-100002`, `STF-200001`, `STF-200002`, `ADM-300001`).
    - Change account emails to a realistic portal domain on the reserved `.test` TLD (e.g. `patient01@medivault.test`) so they can never resolve to a real mailbox.
    - Replace `DEMO-AADHAAR-0001` / `DEMO-PM-JAY-0001` with realistic-looking numeric references that are **invalid by construction** (Aadhaar-style 12 digits beginning with `0` or `1`, which real Aadhaar numbers never do; non-issuable PM-JAY style prefix). Use fictional names, fictional addresses and non-routable phone numbers.
    - Generate lab/prescription PDFs that look like genuine reports from a fictional clinic, **without** the visible "SYNTHETIC HACKATHON DEMO DATA" watermark. Optionally keep a non-visible marker in PDF metadata only.
    - Remove `DEMO`/"dummy" wording from `backup_dump.sql` headers and generated file names.
    - Record the new credentials/IDs in a short list to be used by `README.md` (Task 5.1) and by all later verification steps.
  - Verification: Delete DB and `lab-data/`, run `python -m backend.app.seed`; `grep -rniE "demo|synthetic|dummy|hackathon" lab-data/ ` and a `SELECT` over text columns return no matches; open a generated PDF and confirm it reads as a normal report.
  - Note: Verification commands in Phase 3 and 4 use the **new** IDs (`PAT-100001`, etc.).

- [x] Task R.5: UI Copy Audit — Patient Dashboard & Medical Profile
  - Files: `frontend/src/pages/PatientDashboard.jsx`, `frontend/src/pages/MedicalProfile.jsx`
  - Description: Replace "dummy identity", "synthetic", "demo" and similar labels with normal product copy (e.g. "Identity & Scheme Details", "Ayushman Bharat Card"). Update any hardcoded `DEMO-…` sample values/placeholders to the new format from R.4.
  - Verification: `npm run build` succeeds; `grep -rniE "demo|dummy|synthetic|test data" frontend/src/pages/PatientDashboard.jsx frontend/src/pages/MedicalProfile.jsx` returns nothing.

- [x] Task R.6: UI Copy Audit — Reports Manager & Backend Messages
  - Files: `frontend/src/components/ReportUploader.jsx`, `frontend/src/pages/Reports.jsx`, `backend/app/routes/reports.py`
  - Description: Remove "synthetic/dummy/test" wording from the dropzone, list, empty states and API response messages/default report titles. Keep behaviour unchanged.
  - Verification: `npm run build` succeeds; `grep -rniE "demo|dummy|synthetic|test file" frontend/src/components/ReportUploader.jsx frontend/src/pages/Reports.jsx backend/app/routes/reports.py` returns nothing; upload still returns 201.

- [x] Task R.7: Project-Wide "Lab Signal" Sweep
  - Files: any file flagged by the sweep (limit 3 per pass; repeat until clean)
  - Description: Run a repo-wide search for lab/test wording in everything a user or evaluator can see at runtime (UI strings, API messages, OpenAPI metadata, seeded content, static assets, favicon/title). Allowed locations for such wording: `README.md`, `VULNERABILITY.md`, `.agent/`, `tests/`, and source comments that do not reach the browser.
  - Verification: `grep -rniE "lab_|demo|dummy|synthetic|hackathon|educational|vulnerab" frontend/src frontend/index.html backend/app lab-data` returns nothing except explicitly allowed matches; manual walk through the running site shows no lab/test indicators.

---

## Phase 2 (continued): Remaining Portal UI & API

- [x] Task 2.8: Frontend Staff / Admin Dashboard
  - Files: `frontend/src/pages/StaffDashboard.jsx`, `frontend/src/components/PatientRecordDrawer.jsx`
  - Description: Implement staff portal with patient search table, record inspector drawer, signed-in role badge, and a security/audit event feed. Use normal production wording only.
  - Verification: Run `npm run build` in `frontend/` to confirm staff dashboard components compile without errors.

- [x] Task 2.9: Privacy Centre API Endpoints
  - Files: `backend/app/routes/privacy.py`, `backend/app/schemas/privacy.py`, `backend/app/main.py`
  - Description: Implement endpoints for managing consent preferences (`GET/POST /api/privacy/consent`), data access requests (`POST /api/privacy/rights-request`), and grievance filing (`POST /api/privacy/grievance`).
  - Verification: Send POST request to `/api/privacy/rights-request` with type `export`; verify 200 OK response acknowledging request.

- [x] Task 2.10: Frontend Landing Page & Privacy Centre
  - Files: `frontend/src/pages/Home.jsx`, `frontend/src/pages/PrivacyCentre.jsx`
  - Description: Create healthcare landing page (services overview, FAQs, sign-in/register entry points) and Privacy Centre (consent controls, data category breakdown, rights request form, security notices). **No** educational/synthetic banner or disclaimer anywhere on the pages.
  - Verification: Run `npm run build` in `frontend/` to confirm landing page and privacy centre views compile cleanly; `grep -rniE "synthetic|educational|hackathon|demo" frontend/src/pages/Home.jsx frontend/src/pages/PrivacyCentre.jsx` returns nothing.

---

## Phase 3: Implementing the 12 Permanent Vulnerabilities

All flaws are **always active** — no mode flag, no conditional branches, no UI hints. Each task must be implemented so the vulnerable behaviour is a normal-looking code path. After each task, note the exact `path:line` range in a scratch list (`docs/vulnerability_refs.json`, started in Task 4.4) to ease documentation.

- [x] Task 3.1: V01 - Broken Object-Level Authorisation (IDOR / BOLA)
  - Files: `backend/app/routes/patients.py`
  - Description: `GET /api/patients/{id}` and `GET /api/patients/{id}/reports` authenticate the caller but never verify that `{id}` belongs to the caller.
  - Verification: With a `patient01` token, `GET /api/patients/PAT-100002` returns 200 with `patient02` data.

- [x] Task 3.2: V02 - Excessive Staff Privileges
  - Files: `backend/app/routes/staff.py`
  - Description: `/api/staff/patients/{id}/clinical` only checks that the caller is *any* staff user, so the receptionist account can read doctor-restricted clinical histories and identity details.
  - Verification: With the `reception@medivault.test` token, `GET /api/staff/patients/PAT-100001/clinical` returns 200 with clinical notes.

- [x] Task 3.3: V03 - Excessive Data Exposure in API
  - Files: `backend/app/routes/patients.py`, `backend/app/schemas/patient.py`
  - Description: `/api/patients/me` and `/api/patients/{id}` return the full ORM-derived payload (including `password_hash`, internal notes, raw identity numbers); the UI simply does not render those fields.
  - Verification: Inspect JSON of `GET /api/patients/me`; `password_hash` and the unmasked Aadhaar-style reference are present.

- [x] Task 3.4: V04 - Weak Storage Protection
  - Files: `backend/app/routes/patients.py`, `backend/app/models.py`
  - Description: Identity references and medical notes are persisted as plain text columns with no encryption or masking, including values written via profile updates.
  - Verification: `SELECT aadhaar_ref, medical_notes FROM ...` on the SQLite file shows readable plaintext.

- [x] Task 3.5: V05 - Publicly Reachable Documents & Backups
  - Files: `backend/app/main.py`
  - Description: Mount `lab-data/uploads/` at `/public/uploads/` and `lab-data/backups/` at `/public/backups/` as unauthenticated static directories (framed as a "CDN/static assets" path).
  - Verification: Unauthenticated `GET http://127.0.0.1:8000/public/backups/backup_dump.sql` returns 200 with the SQL dump.

- [x] Task 3.6: V06 - Insecure File Upload Validation
  - Files: `backend/app/routes/reports.py`
  - Description: Upload trusts the client `Content-Type` and original filename, applies no extension allow-list, signature check or size limit, and stores files under their original names.
  - Verification: Uploading an `.svg`/`.html` file returns 201 and the file exists in `lab-data/uploads/` and is reachable via V05's public path.

- [x] Task 3.7: V07 - Weak Session & Authentication Controls
  - Files: `backend/app/routes/auth.py`, `frontend/src/services/api.js`
  - Description: Issue non-expiring JWTs signed with a hardcoded secret, accept trivial passwords (e.g. `123`), and persist the token in `localStorage`.
  - Verification: Register with password `123`; decoded token has no `exp`; token is visible in browser `localStorage`.

- [x] Task 3.8: V08 - Sensitive Data in Application Logs
  - Files: `backend/app/main.py`
  - Description: A request-logging middleware writes full raw request bodies, query strings and `Authorization` headers to `backend/app.log`.
  - Verification: Perform a login and a profile update; `backend/app.log` contains the plaintext password, token and identity reference.

- [x] Task 3.9: V09 - Excessive / Undefined Data Retention
  - Files: `backend/app/routes/privacy.py`
  - Description: `DELETE /api/privacy/account` and consent withdrawal only set an `is_active`/`deleted_at` flag; patient rows, identity records and report files are never purged and there is no retention schedule.
  - Verification: After `DELETE /api/privacy/account`, the patient row and report files still exist unchanged.

- [x] Task 3.10: V10 - Dark-Pattern Privacy Notice & Consent UX
  - Files: `frontend/src/components/ConsentModal.jsx`, `frontend/src/pages/Auth.jsx`
  - Description: Registration shows bundled, pre-checked consent boxes with vague purpose text; the withdraw/revoke control is visually buried and non-functional.
  - Verification: Open registration; consent boxes are pre-checked and bundled; the revoke control is low-contrast and does nothing.

- [x] Task 3.11: V11 - Missing Rights & Grievance Workflow
  - Files: `backend/app/routes/privacy.py`, `frontend/src/pages/PrivacyCentre.jsx`
  - Description: "Download My Data", "Correct My Record" and "Contact Privacy Officer" submit to handlers that return a generic acknowledgement (or 404/500) with no tracking ID, no storage and no follow-up.
  - Verification: Submit an export request and a grievance; neither returns a tracking ID and nothing is persisted.

- [x] Task 3.12: V12 - Incomplete Breach-Response Workflow
  - Files: `backend/app/routes/staff.py`, `backend/app/seed.py`, `frontend/src/pages/StaffDashboard.jsx`
  - Description: Seed a realistic "Unusual access detected" security alert in the staff panel. The incident detail view cannot correlate the alert to the specific patient records accessed (audit entries lack `target_resource_id` for those reads) and offers no notification workflow.
  - Verification: Open the alert in the staff panel; it shows "0 correlated patient records" and no way to notify affected users.

---

## Phase 4: Exploit Verification Tests & Reference Registry

(Replaces the former "Remediation & Dual-Mode Tests" phase. Fixes are documented, not implemented.)

- [x] Task 4.1: Exploit Tests — Access Control & Data Exposure (V01–V04)
  - Files: `tests/test_access_and_exposure.py`, `backend/requirements.txt`
  - Description: Pytest + HTTPX tests asserting each of V01–V04 is exploitable against a freshly seeded app. Add `pytest`/`httpx` to requirements.
  - Verification: `pytest tests/test_access_and_exposure.py -v` passes.

- [x] Task 4.2: Exploit Tests — Files, Sessions & Logging (V05–V08)
  - Files: `tests/test_files_sessions_logs.py`
  - Description: Tests asserting public backup access, arbitrary file upload, non-expiring token/weak password acceptance, and PII appearing in `backend/app.log`.
  - Verification: `pytest tests/test_files_sessions_logs.py -v` passes.

- [x] Task 4.3: Exploit Tests — Privacy Workflows (V09–V12)
  - Files: `tests/test_privacy_workflows.py`
  - Description: Tests asserting soft-delete retention, pre-checked consent payload, rights requests without tracking IDs, and uncorrelated breach alert.
  - Verification: `pytest tests/test_privacy_workflows.py -v` passes.

- [x] Task 4.4: Line-Reference Registry & Checker
  - Files: `docs/vulnerability_refs.json`, `scripts/verify_refs.py`
  - Description: Registry mapping each `V01`–`V12` to one or more `{path, start_line, end_line, snippet}` entries. The script opens each file, confirms the snippet text appears within the stated lines, and exits non-zero on drift.
  - Verification: `python scripts/verify_refs.py` prints `OK` for all 12 vulnerabilities.

---

## Phase 5: Documentation & Hackathon Pitch Prep

- [x] Task 5.1: README.md
  - Files: `README.md`
  - Description: Prominent educational-use disclaimer (this is the **only** place the project reveals its purpose); local setup (backend, frontend, seed, run); credentials table using the new R.4 accounts; statement that all data is fictional and the app must never be exposed to the internet or fed real data; explanation of how the synthetic identifiers are invalid by construction; pointer to `VULNERABILITY.md`.
  - Verification: Follow the README from a clean clone and reach a working login.

- [x] Task 5.2: VULNERABILITY.md — V01 to V06
  - Files: `VULNERABILITY.md`
  - Description: For each flaw: description, **file path and `Lstart–Lend` references with code excerpt**, step-by-step exploit with exact `curl` commands, privacy/security impact, mapped data-protection concept (notice, consent, safeguards, breach response, rights), and a **Recommended Fix** with example secure code (documentation only — not applied to the app).
  - Verification: `python scripts/verify_refs.py` passes; each curl command works against the running app.

- [x] Task 5.3: VULNERABILITY.md — V07 to V12
  - Files: `VULNERABILITY.md`
  - Description: Same structure as 5.2 for V07–V12, plus a summary table (ID, severity, endpoint/page, `path:line`) at the top of the file.
  - Verification: `python scripts/verify_refs.py` passes; all 12 sections present; curl/steps reproduce.

- [x] Task 5.4: Documentation Accuracy Pass
  - Files: `VULNERABILITY.md`, `docs/vulnerability_refs.json`
  - Description: Re-run seed and all tests, regenerate any drifted line numbers, and confirm the table of contents and cross-links work.
  - Verification: `pytest tests -v` and `python scripts/verify_refs.py` both pass; line references in the doc match the registry.

- [x] Task 5.5: Live Demo Rehearsal
  - Files: `README.md`
  - Description: Rehearse the 7-minute flow without a mode toggle: normal patient journey → live exploits (IDOR, API exposure, public file/backup, dark-pattern consent, uncorrelated breach alert) → open `VULNERABILITY.md` and code at the referenced lines to walk through each fix. Add a short "Demo Flow" section to `README.md`.
  - Verification: Complete end-to-end dry run in browser and terminal; zero console errors; the site shows no lab indicators at any point.
</document_content>