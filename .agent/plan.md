# MediVault — Healthcare Privacy & Security Lab
## Hackathon Project Blueprint, Architecture, and Vulnerability Implementation Plan

> **Project Type:** Hackathon Project — For Educational Purposes Only  
> **Working Name:** MediVault  
> **Primary Theme:** A realistic public-facing healthcare portal featuring intentionally simulated privacy and security vulnerabilities alongside a remediated configuration.  
> **Data Policy:** Synthetic test data only. Never use real Aadhaar numbers, Ayushman Bharat identifiers, patient records, prescriptions, lab reports, or identity documents.

---

## 1. Project Vision & Hackathon Scope

**Disclaimer: This project is developed strictly as a hackathon prototype and will be used for educational purposes only.**

MediVault is a realistic, full-stack healthcare web portal designed to look and function like a standard patient-service platform. Visitors and evaluators can register, manage patient profiles, input dummy identity-scheme details, upload synthetic medical reports, and interact with patient and staff dashboards.

Behind this familiar healthcare interface, the application embeds a controlled set of 12 intentionally insecure behaviors. The goal is to demonstrate how common architectural and coding flaws expose sensitive health and personal data, weaken user privacy controls, and hinder incident response—while also providing a toggleable **Remediated Mode** to showcase secure engineering fixes.

### Core Objectives

1. **Believable Healthcare Portal:** Build a clean, responsive patient and staff portal with complete user journeys.
2. **Controlled Vulnerability Lab:** Implement 12 distinct, toggleable privacy and security flaws isolated to a local lab environment.
3. **Dual-Mode Architecture:** Support seamless switching between `LAB_VULNERABLE` and `LAB_REMEDIATED` configurations to demonstrate both the exploit and the fix live during the hackathon pitch.
4. **Privacy-by-Design Awareness:** Map technical flaws to fundamental data protection concepts (notice, consent, safeguards, breach response, and user rights) without making formal legal compliance claims.
5. **Reproducible & Safe:** Ensure all data is 100% synthetic and the application runs strictly locally.

### Out of Scope

- Real Aadhaar authentication, UIDAI integration, or storage of real Aadhaar numbers.
- Real Ayushman Bharat / PM-JAY API integration or verification.
- Real hospital, insurer, or government health-record integrations.
- Public internet deployment of the vulnerable configuration.
- Testing against external or third-party websites.

---

## 2. Product Experience & User Journeys

### 2.1 Public & Authenticated Pages

1. **Home Page:** Healthcare-themed landing page with navigation, service highlights, FAQs, Sign In / Register triggers, and a prominent **"Educational Hackathon Lab — Synthetic Data Only"** banner.
2. **Patient Registration & Login:** Form for synthetic user creation (Name, DOB, Gender, test phone/email, fictional address, emergency contact, credentials) and login.
3. **Identity & Scheme Details:** Masked/synthetic Aadhaar (`DEMO-AADHAAR-0001`) and Ayushman Bharat (`DEMO-PM-JAY-0001`) reference inputs, plus a dummy document uploader with clear test-data warnings.
4. **Medical Profile:** Inputs for fictional allergies, existing conditions, current medications, blood group, and emergency notes.
5. **Medical Reports:** Upload, list, preview, and download generated dummy PDF/image lab reports and prescriptions.
6. **Patient Dashboard:** Unified view of profile completion, identity metadata, medical reports, privacy/consent preferences, data-rights request forms, and grievance submission.
7. **Staff / Admin Dashboard:** Synthetic patient directory, search, record viewer, document review status, and an Audit / Incident simulation panel.
8. **Privacy Centre:** Transparent breakdown of collected data categories, processing purposes, retention rules, consent withdrawal toggles, data-rights requests, and incident/breach simulation status.

### 2.2 Core User Flows

- **Patient Flow:** `Home → Register → Read Privacy Notice → Set Consent → Complete Medical Profile → Add Dummy Scheme IDs → Upload Sample Report → View Dashboard → Submit Rights Request`
- **Staff Flow:** `Staff Login → Patient Queue → Inspect Synthetic Record → Review Uploaded Report → View Audit Logs → Trigger/Inspect Simulated Incident`

---

## 3. Vulnerability Register (12 Controlled Demonstrations)

All 12 vulnerabilities are isolated behind the `LAB_VULNERABLE` configuration flag and operate exclusively on seeded synthetic accounts.

| ID | Vulnerability Scenario | Technical Demonstration | Privacy / Security Impact | Severity |
|---|---|---|---|---|
| **V01** | **Broken Object-Level Authorisation (IDOR / BOLA)** | Changing the `patient_id` parameter in the API request allows a logged-in test patient to view another seeded patient's medical profile and reports. | Unauthorized cross-patient data exposure; failure of basic access controls. | Critical |
| **V02** | **Excessive Staff Privileges** | A low-privilege receptionist/clerk demo account can access full clinical histories and identity documents restricted to doctors/admins. | Violation of least privilege; broad internal exposure of sensitive health records. | High |
| **V03** | **Excessive Data Exposure in API** | The `/api/patients/me` or directory endpoint returns full unmasked identity references, internal notes, and password hashes in the JSON payload, relying on the UI to hide them. | Failure of data minimization; trivial data harvesting via browser DevTools. | High |
| **V04** | **Weak Storage Protection** | Synthetic Aadhaar/PM-JAY references and medical notes are stored in plain text in the SQLite database without encryption or masking. | Direct exposure of sensitive identifiers if database files or snapshots are compromised. | Critical |
| **V05** | **Publicly Reachable Test Documents & Backups** | Uploaded dummy reports and a seeded `backup_dump.sql` are served from a static `/public/uploads/` directory without authentication checks. | Direct URL guessing exposes confidential patient PDFs and database backups. | Critical |
| **V06** | **Insecure File Upload Validation** | The report upload endpoint trusts client-side MIME types and accepts arbitrary file extensions (e.g., `.html`, `.svg`, `.exe` dummy files) without size or signature checks. | Enables stored XSS via malicious SVG/HTML uploads and storage exhaustion. | High |
| **V07** | **Weak Session & Authentication Controls** | Uses predictable/non-expiring JWTs or session tokens stored in `localStorage` without `HttpOnly` flags, alongside weak password policies. | Susceptibility to token theft, session hijacking, and credential stuffing. | High |
| **V08** | **Sensitive Data in Application Logs** | Backend request/error logs write full request bodies, including raw synthetic Aadhaar numbers, medical conditions, and session tokens, to plain log files. | Secondary data leakage to anyone with log-read access; complicates log retention. | High |
| **V09** | **Excessive / Undefined Data Retention** | Deleted accounts or withdrawn consents only toggle a soft-delete flag while retaining all medical reports and identity files indefinitely with no purge mechanism. | Unnecessary accumulation of sensitive health data beyond its stated purpose. | Medium |
| **V10** | **Dark-Pattern Privacy Notice & Consent UX** | Pre-checked consent boxes bundled with registration, vague purpose descriptions, and a buried/broken consent withdrawal button. | Undermines informed, specific, and freely given user consent. | Medium |
| **V11** | **Missing Rights & Grievance Workflow** | Links for "Download My Data," "Correct Record," or "Contact Privacy Officer" lead to dead ends or unmonitored forms with no tracking ID. | Prevents users from exercising data access, correction, or grievance rights. | Medium |
| **V12** | **Incomplete Breach-Response Workflow** | A simulated unauthorized access event appears in the admin panel, but the system lacks audit correlation to identify which specific synthetic patient records were viewed or notify affected users. | Delays containment and prevents timely, accurate breach notifications to affected individuals. | High |

---

## 4. Technical Stack (Optimized for Rapid Hackathon Execution)

A streamlined, monolithic full-stack architecture ensures fast development, easy debugging, and reliable live demos.

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React + Vite + Tailwind CSS | Fast, modern, healthcare-styled responsive UI with clean component architecture. |
| **Backend** | Python + FastAPI | High-speed REST API development, automatic OpenAPI docs, and clean dependency injection for toggling vulnerable vs. remediated logic. |
| **Database** | SQLite + SQLAlchemy | Zero-configuration local relational database; easy to inspect, reset, and seed with synthetic data. |
| **Validation** | Pydantic | Strict schema validation in `LAB_REMEDIATED` mode vs. relaxed/bypassed validation in `LAB_VULNERABLE` mode. |
| **File Storage** | Local Filesystem (`lab-data/`) | Stores watermarked dummy PDFs; toggles between public static serving (vulnerable) and authenticated streaming (remediated). |
| **Testing** | Pytest + HTTPX | Automated exploit verification scripts demonstrating failure in vulnerable mode and pass in remediated mode. |

---

## 5. System Architecture & Repository Structure

### 5.1 Dual-Mode Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React + Tailwind Frontend                │
│  [Public Portal]  [Patient Dashboard]  [Staff/Admin Panel]  │
│  [Privacy Centre] [Lab Mode Indicator Banner]               │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Multipart)
┌──────────────────────────────▼──────────────────────────────┐
│                       FastAPI Backend                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │         Security Policy & Mode Switcher             │   │
│   │   APP_MODE = "LAB_VULNERABLE" | "LAB_REMEDIATED"    │   │
│   └──────────────┬───────────────────────┬──────────────┘   │
│                  │                       │                  │
│   ┌──────────────▼──────────┐ ┌──────────▼──────────────┐   │
│   │  Vulnerable Handlers    │ │  Remediated Handlers    │   │
│   │  - No IDOR ownership    │ │  - Strict RBAC & Owner  │   │
│   │  - Raw JSON dumps       │ │  - Filtered DTOs        │   │
│   │  - Plaintext storage    │ │  - Masked/Encrypted     │   │
│   │  - Verbose PII logging  │ │  - Redacted Audit Logs  │   │
│   └─────────────────────────┘ └─────────────────────────┘   │
└──────────────────┬───────────────────────┬──────────────────┘
                   │                       │
         ┌─────────▼─────────┐   ┌─────────▼─────────┐
         │   SQLite Database │   │  Local File Store │
         │  (Synthetic Data) │   │ (Watermarked PDFs)│
         └───────────────────┘   └───────────────────┘
```

### 5.2 Repository Layout

```text
MediVault/
├── README.md                    # Setup guide, hackathon disclaimer, demo credentials
├── VULNERABILITY.md             # Detailed exploit steps, impact, and remediation docs
├── medi_plan.md                 # This project blueprint
├── .env.example                 # Configuration template (APP_MODE=LAB_VULNERABLE)
├── frontend/
│   ├── package.json
│   └── src/
│       ├── components/          # Navbar, ModeBanner, ReportUploader, ConsentModal
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Auth.jsx
│       │   ├── PatientDashboard.jsx
│       │   ├── MedicalProfile.jsx
│       │   ├── StaffDashboard.jsx
│       │   └── PrivacyCentre.jsx
│       └── services/api.js
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI app initialization & static mount toggle
│       ├── config.py            # Environment & LAB_VULNERABLE / LAB_REMEDIATED toggle
│       ├── database.py          # SQLite connection & session management
│       ├── models.py            # SQLAlchemy models (User, Patient, Identity, Report, Consent, Audit)
│       ├── schemas.py           # Pydantic schemas (Vulnerable vs. Minimized DTOs)
│       ├── routes/
│       │   ├── auth.py          # V07 (Session/Auth)
│       │   ├── patients.py      # V01 (IDOR), V03 (API Exposure), V04 (Storage)
│       │   ├── reports.py       # V05 (Public Files), V06 (Upload Validation)
│       │   ├── staff.py         # V02 (Excessive Privileges), V12 (Breach Workflow)
│       │   └── privacy.py       # V09 (Retention), V10 (Consent), V11 (Rights/Grievance)
│       └── seed.py              # Script to populate synthetic patients, staff, and dummy PDFs
├── lab-data/
│   ├── uploads/                 # Watermarked synthetic PDF reports
│   └── backups/                 # Dummy SQL backup file for V05 demonstration
└── tests/
    └── test_security_lab.py     # Automated tests verifying all 12 vulnerabilities & fixes
```

---

## 6. Synthetic Data Model

All records are pre-seeded or created using clearly labeled dummy values:

- **Users & Roles:**
  - `patient01@example.test` (Role: `patient`, ID: `PAT-DEMO-001`)
  - `patient02@example.test` (Role: `patient`, ID: `PAT-DEMO-002`)
  - `reception@example.test` (Role: `staff_basic`, ID: `STF-DEMO-001`)
  - `doctor@example.test` (Role: `staff_clinical`, ID: `STF-DEMO-002`)
  - `privacy@example.test` (Role: `admin_dpo`, ID: `ADM-DEMO-001`)
- **Identity Metadata (`IdentityRecord`):**
  - `aadhaar_demo_ref`: `DEMO-AADHAAR-0001` (Masked in remediated mode as `XXXX-XXXX-0001`)
  - `ayushman_demo_ref`: `DEMO-PM-JAY-0001`
- **Medical Reports (`MedicalReport`):**
  - Generated PDFs containing large watermarks: **"SYNTHETIC HACKATHON DEMO DATA — NOT A REAL MEDICAL RECORD"**.
- **Audit & Breach Logs (`AuditLog`):**
  - Tracks `actor_id`, `endpoint`, `target_resource_id`, `timestamp`, and `status` (redacting PII in `LAB_REMEDIATED` mode).

---

## 7. Hackathon Build & Execution Roadmap

### Phase 1: Foundation & Synthetic Seeding (Hours 1–3)
- Initialize FastAPI backend and React + Tailwind frontend.
- Define SQLite models (`User`, `PatientProfile`, `IdentityRecord`, `MedicalReport`, `ConsentRecord`, `AuditLog`).
- Build `seed.py` to generate 5 synthetic users, sample medical histories, dummy identity references, and watermarked PDF reports.
- Implement the global `APP_MODE` toggle (`LAB_VULNERABLE` vs. `LAB_REMEDIATED`) visible in the UI top banner.

### Phase 2: Core Healthcare Portal UI & API (Hours 4–8)
- Build the landing page, login/registration flow, and patient dashboard.
- Implement patient profile editing, dummy identity/scheme reference forms, and medical report upload/viewing.
- Build the Staff Dashboard (patient search and record inspection) and the Privacy Centre (consent toggles, data-rights requests, and grievance form).

### Phase 3: Implementing the 12 Controlled Vulnerabilities (Hours 9–14)
- Wire up the `LAB_VULNERABLE` code paths across routes:
  - Disable ownership checks on `/api/patients/{id}` (V01) and role checks on `/api/staff/records` (V02).
  - Return raw SQLAlchemy objects in API responses (V03) and store plaintext dummy IDs (V04).
  - Mount `/lab-data` as an unauthenticated static directory (V05) and bypass file validation on upload (V06).
  - Configure weak token handling (V07) and verbose request logging (V08).
  - Implement soft-delete-only retention (V09), dark-pattern consent UI (V10), non-functional rights links (V11), and an unlinked breach alert banner (V12).

### Phase 4: Implementing Remediations & Automated Tests (Hours 15–19)
- Implement `LAB_REMEDIATED` counterparts for all 12 flaws:
  - Enforce strict JWT ownership and RBAC middleware (V01, V02).
  - Apply response DTO filtering and field-level masking/encryption (V03, V04).
  - Serve files via authenticated streaming endpoints with strict MIME/magic-byte and size validation (V05, V06).
  - Harden session cookies/tokens and sanitize structured audit logs (V07, V08).
  - Enable hard-deletion/retention purge, granular consent withdrawal, functional grievance ticketing, and automated breach-impact correlation (V09–V12).
- Write `pytest` tests verifying that exploits succeed in `LAB_VULNERABLE` and are blocked in `LAB_REMEDIATED`.

### Phase 5: Polish & Hackathon Pitch Prep (Hours 20–24)
- Complete `README.md` and `VULNERABILITY.md` with exact route paths and reproduction steps.
- Rehearse the 7-minute live demo flow.

---

## 8. Live Hackathon Demo Script (7 Minutes)

1. **Problem & Context (1 min):** Introduce MediVault as an educational hackathon prototype highlighting how rapidly built healthcare portals often leak sensitive patient and identity data.
2. **Normal User Journey (1.5 min):** Log in as `patient01@example.test`, view synthetic medical history, dummy Ayushman/Aadhaar references, and upload a watermarked lab report.
3. **Live Exploit Showcase in `LAB_VULNERABLE` Mode (2.5 min):**
   - **V01 (IDOR):** Switch the API request ID from `PAT-DEMO-001` to `PAT-DEMO-002` to view another patient's private health records.
   - **V03 & V04 (API Exposure & Plaintext Storage):** Inspect the network response to show unmasked dummy Aadhaar numbers and internal notes leaked in JSON.
   - **V05 (Public File Exposure):** Access another patient's watermarked PDF directly via an unauthenticated URL.
   - **V10 & V12 (Privacy UX & Breach Gap):** Show the dark-pattern consent toggle and the simulated breach alert that fails to identify affected users.
4. **Live Remediation Flip (1.5 min):** Toggle `APP_MODE` to `LAB_REMEDIATED`, restart/refresh, and re-run the exact same requests—showing `403 Forbidden` responses, masked identifiers (`XXXX-XXXX-0001`), protected file streaming, and an actionable breach-impact report.
5. **Conclusion & Educational Takeaway (0.5 min):** Summarize how combining secure-by-default engineering with transparent user privacy controls protects patient trust.

---

## 9. Responsible Use & Safety Guidelines

- **Educational Hackathon Use Only:** This software is strictly an educational lab and must never be deployed as a real healthcare service or exposed to the public internet.
- **Zero Real Data:** Never enter real names, phone numbers, medical records, Aadhaar numbers, or Ayushman Bharat IDs into the application, database, screenshots, or Git repository.
- **Authorized Local Testing Only:** All vulnerability demonstrations are designed to run exclusively against `localhost` using seeded synthetic records.