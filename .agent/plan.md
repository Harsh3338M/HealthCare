# MediVault — Healthcare Privacy & Security Lab
## Hackathon Project Blueprint, Architecture, and Vulnerability Implementation Plan

> **Project Type:** Hackathon Project — For Educational Purposes Only  
> **Working Name:** MediVault  
> **Primary Theme:** A realistic public-facing healthcare portal with 12 intentionally built-in privacy and security flaws, fully documented in the repository.  
> **Data Policy:** Fictional test data only. Never use real Aadhaar numbers, Ayushman Bharat identifiers, patient records, prescriptions, lab reports, or identity documents.

---

## Revision Notes (Plan Change)

This revision supersedes the earlier dual-mode design:

| Earlier plan | Revised plan |
|---|---|
| `APP_MODE` toggle: `LAB_VULNERABLE` / `LAB_REMEDIATED` | **No toggle.** Vulnerabilities are permanently present. |
| Remediated handlers implemented in code | Remediations are **documented only**, with example fix code in `VULNERABILITY.md`. |
| Mode banner, "Educational Lab" banner, demo credential buttons, synthetic watermarks visible in the UI | **The site shows no sign of being a lab or test system.** It looks and behaves like a genuine portal. |
| Disclosure inside the app | Disclosure **only** in `README.md`. |
| Vulnerability docs with route paths | `VULNERABILITY.md` with **exact file paths and line numbers**, code excerpts, exploit steps, impact, fixes; line references verified by a script. |
| Live flip to remediated mode in demo | Demo shows exploits, then walks through documented fixes at the referenced code lines. |

**Project status:** Tasks 1.1–2.7 are complete. Items in the completed work that conflict with this revision are corrected in **Phase 2R** (see `tasks.md`).

---

## 1. Project Vision & Hackathon Scope

**Disclaimer: This project is developed strictly as a hackathon prototype and will be used for educational purposes only. This disclaimer appears in `README.md` and `VULNERABILITY.md` only — never in the running application.**

MediVault is a realistic, full-stack healthcare web portal designed to look and function like a standard patient-service platform. Visitors and evaluators can register, manage patient profiles, enter identity-scheme details, upload medical reports, and use patient and staff dashboards.

Behind this familiar interface, the application contains 12 intentionally insecure behaviours. The goal is to demonstrate how common architectural and coding flaws expose sensitive health and personal data, weaken user privacy controls, and hinder incident response, and to document precisely where each flaw lives in the code and how it should be fixed.

### Core Objectives

1. **Believable Healthcare Portal:** A clean, responsive patient and staff portal with complete user journeys and no visible lab/test indicators.
2. **Permanent Vulnerability Set:** Implement 12 distinct privacy and security flaws as ordinary-looking code paths (no feature flags).
3. **Exhaustive Documentation:** Each flaw documented in `VULNERABILITY.md` with file path, line numbers, code excerpt, exploit steps, impact, concept mapping, and recommended fix.
4. **Privacy-by-Design Awareness:** Map flaws to data protection concepts (notice, consent, safeguards, breach response, user rights) without making formal legal compliance claims.
5. **Reproducible & Safe:** All data is fictional and the application runs strictly locally.

### Out of Scope

- Real Aadhaar authentication, UIDAI integration, or storage of real Aadhaar numbers.
- Real Ayushman Bharat / PM-JAY API integration or verification.
- Real hospital, insurer, or government health-record integrations.
- Public internet deployment.
- Testing against external or third-party websites.
- A runtime "secure mode" or any in-app switching between vulnerable and fixed behaviour.

---

## 2. Product Experience & User Journeys

All copy, labels, placeholders, API messages, seeded content and generated documents use normal production wording. No text anywhere in the running app may mention demo, dummy, synthetic, test data, lab, hackathon or vulnerabilities.

### 2.1 Public & Authenticated Pages

1. **Home Page:** Healthcare landing page with navigation, service highlights, FAQs, and Sign In / Register entry points.
2. **Patient Registration & Login:** Registration (name, DOB, gender, phone/email, address, emergency contact, credentials, consent choices) and login. No credential-fill helpers.
3. **Identity & Scheme Details:** Aadhaar-style and Ayushman Bharat-style reference inputs and a document uploader, with normal product wording.
4. **Medical Profile:** Allergies, existing conditions, current medications, blood group, emergency notes.
5. **Medical Reports:** Upload, list, preview, and download lab reports and prescriptions.
6. **Patient Dashboard:** Profile completion, identity metadata, reports, privacy/consent preferences, data-rights request forms, grievance submission.
7. **Staff / Admin Dashboard:** Patient directory, search, record viewer, document review status, and a security/audit panel that includes a pre-seeded "unusual access" alert.
8. **Privacy Centre:** Data categories collected, processing purposes, retention statements, consent controls, data-rights requests, and security notices.

### 2.2 Core User Flows

- **Patient Flow:** `Home → Register → Read Privacy Notice → Set Consent → Complete Medical Profile → Add Scheme IDs → Upload Report → View Dashboard → Submit Rights Request`
- **Staff Flow:** `Staff Login → Patient Queue → Inspect Record → Review Uploaded Report → View Audit Logs → Review Security Alert`

---

## 3. Vulnerability Register (12 Permanent Flaws)

All 12 vulnerabilities are always active and operate on seeded fictional accounts. "Planned code location" lists the files where each flaw will live; exact line numbers are recorded in `docs/vulnerability_refs.json` and `VULNERABILITY.md` once implemented.

| ID | Vulnerability Scenario | Technical Demonstration | Privacy / Security Impact | Severity | Planned Code Location |
|---|---|---|---|---|---|
| **V01** | **Broken Object-Level Authorisation (IDOR / BOLA)** | Changing `{id}` in `/api/patients/{id}` lets a logged-in patient read another patient's profile and reports. | Cross-patient data exposure. | Critical | `backend/app/routes/patients.py` |
| **V02** | **Excessive Staff Privileges** | Receptionist account can read doctor-restricted clinical histories and identity data. | Violation of least privilege. | High | `backend/app/routes/staff.py` |
| **V03** | **Excessive Data Exposure in API** | `/api/patients/me` and directory endpoints return password hashes, internal notes and raw identity numbers; UI hides them. | Failure of data minimisation; harvesting via DevTools. | High | `backend/app/routes/patients.py`, `backend/app/schemas/patient.py` |
| **V04** | **Weak Storage Protection** | Identity references and medical notes stored in plaintext in SQLite. | Exposure if DB file or snapshot is compromised. | Critical | `backend/app/models.py`, `backend/app/routes/patients.py` |
| **V05** | **Publicly Reachable Documents & Backups** | `lab-data/uploads/` and `lab-data/backups/` served statically at `/public/...` with no auth. | URL guessing exposes reports and database backups. | Critical | `backend/app/main.py` |
| **V06** | **Insecure File Upload Validation** | Upload trusts client MIME type and filename; no extension, signature or size checks. | Stored XSS via SVG/HTML; storage exhaustion. | High | `backend/app/routes/reports.py` |
| **V07** | **Weak Session & Authentication Controls** | Non-expiring JWTs with a hardcoded secret, tokens in `localStorage`, trivial passwords allowed. | Token theft, session hijacking, credential stuffing. | High | `backend/app/routes/auth.py`, `frontend/src/services/api.js` |
| **V08** | **Sensitive Data in Application Logs** | Middleware logs full request bodies, query strings and auth headers to `backend/app.log`. | Secondary leakage to anyone with log access. | High | `backend/app/main.py` |
| **V09** | **Excessive / Undefined Data Retention** | Account deletion / consent withdrawal only soft-delete; data and files kept forever. | Accumulation of sensitive data beyond purpose. | Medium | `backend/app/routes/privacy.py` |
| **V10** | **Dark-Pattern Privacy Notice & Consent UX** | Pre-checked bundled consents, vague purposes, buried non-functional withdrawal. | Undermines informed, specific, freely given consent. | Medium | `frontend/src/components/ConsentModal.jsx`, `frontend/src/pages/Auth.jsx` |
| **V11** | **Missing Rights & Grievance Workflow** | "Download My Data", "Correct Record", "Contact Privacy Officer" lead to dead ends with no tracking ID. | Users cannot exercise access, correction or grievance rights. | Medium | `backend/app/routes/privacy.py`, `frontend/src/pages/PrivacyCentre.jsx` |
| **V12** | **Incomplete Breach-Response Workflow** | Seeded security alert shows unusual access, but audit data cannot identify which patient records were viewed and no notification path exists. | Delays containment and affected-user notification. | High | `backend/app/routes/staff.py`, `backend/app/seed.py`, `frontend/src/pages/StaffDashboard.jsx` |

---

## 4. Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React + Vite + Tailwind CSS | Responsive healthcare-styled UI. |
| **Backend** | Python + FastAPI | REST API, dependency injection, OpenAPI. |
| **Database** | SQLite + SQLAlchemy | Zero-config local database; easy to inspect, reset and seed. |
| **Validation** | Pydantic | Intentionally permissive schemas where required by V03/V06/V07. |
| **File Storage** | Local filesystem (`lab-data/`) | Uploaded reports and seeded backup file. |
| **Testing** | Pytest + HTTPX | Exploit-verification tests proving each flaw is present and reproducible. |
| **Tooling** | `scripts/verify_refs.py` | Confirms documented `path:line` references still match the code. |

---

## 5. System Architecture & Repository Structure

### 5.1 Architecture (Single Build)

```text
┌─────────────────────────────────────────────────────────────┐
│                    React + Tailwind Frontend                │
│  [Public Portal]  [Patient Dashboard]  [Staff/Admin Panel]  │
│  [Privacy Centre]                                           │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Multipart)
┌──────────────────────────────▼──────────────────────────────┐
│                       FastAPI Backend                       │
│  auth · patients · reports · staff · privacy                │
│  Request logging middleware · static /public mounts         │
└──────────────────┬───────────────────────┬──────────────────┘
                   │                       │
         ┌─────────▼─────────┐   ┌─────────▼─────────┐
         │   SQLite Database │   │  Local File Store │
         │ (Fictional data)  │   │ (Reports, backup) │
         └───────────────────┘   └───────────────────┘
```

There is no policy/mode switcher and no remediated handler set. Secure alternatives exist only as example code inside `VULNERABILITY.md`.

### 5.2 Repository Layout

```text
MediVault/
├── README.md                    # Educational disclaimer, setup, credentials, demo flow
├── VULNERABILITY.md             # Per-flaw docs: path:line refs, excerpts, exploit, impact, fix
├── .env.example                 # DB URL and JWT settings (no mode flag)
├── frontend/
│   ├── index.html               # Normal product title/meta
│   ├── package.json
│   └── src/
│       ├── components/          # Navbar, ReportUploader, ConsentModal, PatientRecordDrawer
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Auth.jsx
│       │   ├── PatientDashboard.jsx
│       │   ├── MedicalProfile.jsx
│       │   ├── Reports.jsx
│       │   ├── StaffDashboard.jsx
│       │   └── PrivacyCentre.jsx
│       └── services/api.js
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # App init, logging middleware (V08), static mounts (V05)
│       ├── config.py            # DB URL, JWT settings
│       ├── database.py
│       ├── models.py            # V04 plaintext columns
│       ├── schemas/             # auth, patient (V03), report, staff, privacy
│       ├── routes/
│       │   ├── auth.py          # V07
│       │   ├── patients.py      # V01, V03, V04
│       │   ├── reports.py       # V06
│       │   ├── staff.py         # V02, V12
│       │   └── privacy.py       # V09, V11
│       └── seed.py              # Fictional users, records, reports, backup, seeded alert (V12)
├── lab-data/
│   ├── uploads/                 # Seeded and uploaded reports
│   └── backups/                 # Seeded SQL backup
├── docs/
│   └── vulnerability_refs.json  # Machine-readable path/line/snippet registry
├── scripts/
│   └── verify_refs.py           # Validates the registry against the source
└── tests/
    ├── test_access_and_exposure.py   # V01–V04
    ├── test_files_sessions_logs.py   # V05–V08
    └── test_privacy_workflows.py     # V09–V12
```

---

## 6. Fictional Data Model

All records are pre-seeded with realistic-looking but fictional values. Nothing in the app labels them as test data; safety comes from the values being non-issuable or non-routable.

- **Users & Roles:**
  - `patient01@medivault.test` (Role: `patient`, ID: `PAT-100001`)
  - `patient02@medivault.test` (Role: `patient`, ID: `PAT-100002`)
  - `reception@medivault.test` (Role: `staff_basic`, ID: `STF-200001`)
  - `doctor@medivault.test` (Role: `staff_clinical`, ID: `STF-200002`)
  - `privacy@medivault.test` (Role: `admin_dpo`, ID: `ADM-300001`)
  - Domain uses the reserved `.test` TLD so it can never resolve to a real mailbox. Passwords are listed in `README.md` only.
- **Identity Metadata (`IdentityRecord`):**
  - Aadhaar-style reference: 12 digits beginning with `0` or `1` (real Aadhaar numbers never do), e.g. `1002 4471 0001`.
  - Ayushman Bharat-style reference: fictional numeric ID with a non-issuable prefix.
  - Names, addresses and phone numbers are fictional and non-routable.
- **Medical Reports (`MedicalReport`):**
  - Generated PDFs formatted as ordinary lab/prescription reports from a fictional clinic, with **no visible watermark**. An optional non-visible marker may exist in PDF metadata only.
- **Audit & Incident Logs (`AuditLog`):**
  - Tracks `actor_id`, `endpoint`, `timestamp`, `status`. Entries for the seeded incident deliberately omit `target_resource_id` so records cannot be correlated (V12).

---

## 7. Build & Execution Roadmap

### Phase 1: Foundation & Seeding — *complete (Tasks 1.1–1.7)*
Backend/frontend scaffolding, models, seeder, base app. Mode-related parts are removed in Phase 2R.

### Phase 2: Core Portal UI & API — *Tasks 2.1–2.7 complete; 2.8–2.10 pending*
Auth, patient profile, reports, staff directory built. Staff dashboard, Privacy Centre API and landing/Privacy UI remain, written with no lab wording.

### Phase 2R: Plan-Change Refactor — *new, next*
- R.1–R.2: Remove `APP_MODE`, `/api/mode`, `ModeBanner`, toggle logic; neutral titles/metadata.
- R.3: Remove demo-credential buttons and educational warnings from auth pages.
- R.4: Rebuild seed identifiers, emails, PDFs and backup without demo/synthetic markers, using invalid-by-construction values.
- R.5–R.6: UI/API copy audit of already-built pages.
- R.7: Repo-wide sweep for lab signals in runtime-visible content.

### Phase 3: Implement the 12 Permanent Vulnerabilities
Implement V01–V12 as normal-looking code paths per Section 3, recording exact locations as you go.

### Phase 4: Exploit Verification & Reference Registry
- Pytest suites proving V01–V12 are reproducible.
- `docs/vulnerability_refs.json` and `scripts/verify_refs.py` so documented line numbers cannot silently drift.

### Phase 5: Documentation & Pitch Prep
- `README.md`: disclaimer, setup, credentials, demo flow.
- `VULNERABILITY.md`: full per-flaw documentation (see Section 8).
- Accuracy pass and 7-minute rehearsal.

---

## 8. Documentation Specification

### 8.1 README.md
- Educational-use disclaimer and responsible-use rules (the only place purpose is disclosed).
- Prerequisites, backend/frontend setup, seeding, run commands.
- Credentials table for the five seeded accounts.
- Explanation of why seeded identifiers are invalid by construction.
- Short "Demo Flow" section and a link to `VULNERABILITY.md`.

### 8.2 VULNERABILITY.md
Starts with a summary table: ID · title · severity · endpoint/page · primary `path:line`.

Each of V01–V12 then has the same structure:

1. **Summary & severity**
2. **Affected locations** — exact `path:Lstart–Lend` for every involved file (backend and frontend), each with a fenced code excerpt of the relevant lines.
3. **Why it is vulnerable** — root cause in plain language.
4. **Reproduction** — exact `curl` commands (or UI steps) using the seeded accounts and IDs.
5. **Impact** — privacy and security consequences.
6. **Concept mapping** — notice, consent, safeguards, breach response, or user rights (no formal legal-compliance claims).
7. **Recommended fix** — explanation plus example secure code, clearly marked as *not applied* in this codebase.

Line numbers are kept honest by `docs/vulnerability_refs.json` + `scripts/verify_refs.py`, which fail if a snippet is no longer at the stated lines.

---

## 9. Live Hackathon Demo Script (7 Minutes)

1. **Problem & Context (1 min):** Introduce MediVault as an educational prototype showing how quickly built healthcare portals leak patient and identity data.
2. **Normal User Journey (1.5 min):** Log in as `patient01@medivault.test`, review the profile, identity references, and upload a report. The site looks like a normal portal throughout.
3. **Live Exploits (2.5 min):**
   - **V01 (IDOR):** Change `PAT-100001` to `PAT-100002` in the API request and read another patient's records.
   - **V03 & V04:** Show unmasked identity numbers and password hash in the network response; show plaintext values in SQLite.
   - **V05:** Open another patient's report and the SQL backup via unauthenticated `/public/...` URLs.
   - **V10 & V12:** Show the pre-checked consent dark pattern and the staff security alert that cannot identify affected patients.
4. **Documentation & Fix Walkthrough (1.5 min):** Open `VULNERABILITY.md`, jump to the referenced file/line for two or three flaws, and show the recommended fix code (403 ownership check, response DTO with masking, authenticated file streaming, correlated audit trail).
5. **Conclusion (0.5 min):** Secure-by-default engineering plus transparent privacy controls protect patient trust.

---

## 10. Responsible Use & Safety Guidelines

- **Educational Hackathon Use Only:** Never deploy as a real healthcare service or expose to the public internet. Bind to `127.0.0.1`.
- **Zero Real Data:** Never enter real names, phone numbers, medical records, Aadhaar numbers or Ayushman Bharat IDs into the application, database, screenshots or Git repository.
- **Authorised Local Testing Only:** Exploits are for `localhost` against seeded records only.
- **Disclosure Lives in Docs:** Because the UI intentionally shows no lab indicators, `README.md` and `VULNERABILITY.md` must carry the full disclaimer, and the repository must never be hosted publicly as a live site.