# MediVault — Educational Vulnerable Healthcare Portal

> [!CAUTION]
> **STRICT EDUCATIONAL & ACADEMIC RESEARCH DISCLAIMER**  
> MediVault is intentionally designed with deliberate security and data-privacy vulnerabilities for academic study, developer training, and hackathon demonstrations. It simulates real-world healthcare portal architectures that improperly manage sensitive personal data and electronic health records.  
> - **DO NOT** deploy this software to public servers, cloud environments, or any network accessible from the public internet.  
> - **DO NOT** enter authentic personal identifiable information (PII), genuine health records, real phone numbers, real Aadhaar references, or Ayushman Bharat identifiers.  
> - Always bind local test servers strictly to loopback (`127.0.0.1`).  
> - The live user interface intentionally displays **no** warning banners, lab badges, or synthetic watermarks, simulating an authentic production healthcare service. Disclosure lives solely within this documentation and `VULNERABILITY.md`.

---

## 1. Overview & Project Purpose

MediVault represents a modern digital hospital and diagnostic record system with multi-role access (Patients, Reception Staff, Attending Physicians, and Data Protection Officers). While functionally responsive and styled as an enterprise clinical portal, its backend and frontend incorporate 12 deliberate architectural security and privacy flaws (categorised under V01 to V12). 

These vulnerabilities illustrate common engineering oversights in modern digital health implementations, including broken access control (IDOR/BOLA), excessive staff privileges, unencrypted database storage, unauthenticated public document buckets, stored cross-site scripting (XSS), weak authentication, credential-leaking loggers, indefinite data retention, dark-pattern consent UX, and incomplete breach audit trails.

Comprehensive root-cause breakdowns, attack payloads, and production-grade remediations are documented in [VULNERABILITY.md](VULNERABILITY.md).

---

## 2. Synthetic Identifiers: Invalid by Construction

All sample identities and identifiers seeded in MediVault are fictional and mathematically or syntactically invalid by construction:

- **Aadhaar References (`1002 4471 0001`, `1002 4471 0002`):** Under the UIDAI specifications, valid 12-digit Aadhaar numbers never begin with `0` or `1`. By starting with `1`, these records cannot collide with or represent genuine citizen identities.
- **Ayushman Bharat PM-JAY References (`PMJAY-0000-0001`, `PMJAY-0000-0002`):** National Health Authority (NHA) ABHA and PM-JAY IDs conform to 14-digit numeric identifiers or verified domain handles. The `PMJAY-0000-XXXX` syntax is a reserved synthetic format.
- **Email Domains (`@medivault.test`):** The `.test` top-level domain is reserved by IETF RFC 2606 for testing and cannot be resolved on the public internet.
- **Phone Numbers (`+91-011-2345-6789`, `+91-080-3456-7890`):** Fixed-line area codes combined with sequential dummy exchange sequences.
- **Clinical Records & PDF Reports:** Generated synthetically via ReportLab with fictional diagnostic observations and test metrics.

---

## 3. Technology Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, SQLite, Pydantic v2, ReportLab, Pytest, HTTPX
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Security Testing:** Pytest automated exploit suite (`tests/`), Line-reference registry checker (`scripts/verify_refs.py`)

---

## 4. Local Setup & Quickstart

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher (with `npm`)

### 4.1 Backend Setup

1. **Create and activate a virtual environment:**
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Seed the database:**
   ```bash
   python -m backend.app.seed
   ```
   *This initializes `medivault.db`, creates the 5 default accounts, and generates sample clinical reports in `lab-data/uploads/` and a database backup in `lab-data/backups/`.*

5. **Start the backend server (strictly loopback):**
   ```bash
   uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API will run at `http://127.0.0.1:8000`. OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

### 4.2 Frontend Setup

1. **Navigate to the frontend directory and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development frontend server:**
   ```bash
   npm run dev
   ```
   The web application will run at `http://localhost:5173`.

---

## 5. Seeded Accounts & Credentials

All seeded accounts share the default development password: `Password123!`

| Full Name | Role | Email | Identifier | Portal Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `patient` | `patient01@medivault.test` | `PAT-100001` | Patient Dashboard, Diagnostic Vault, Consent & Privacy Centre |
| **Priya Patel** | `patient` | `patient02@medivault.test` | `PAT-100002` | Secondary Patient Record (Target for IDOR / BOLA tests) |
| **Rohan Verma** | `staff_basic` | `reception@medivault.test` | `STF-200001` | Front-Desk Reception (Directory view; inappropriately accesses clinical notes) |
| **Dr. Ananya Rao** | `staff_clinical` | `doctor@medivault.test` | `STF-200002` | Attending Physician (Full clinical access & patient records) |
| **Suresh Menon** | `admin_dpo` | `privacy@medivault.test` | `ADM-300001` | Data Protection Officer (Audit log inspection & breach response review) |

---

## 6. Seven-Minute Hackathon Demo Flow

1. **Context & Overview (1 min):**  
   Introduce MediVault as a modern digital health portal. Note how it functions and renders cleanly as an enterprise clinical portal without synthetic labels or lab badges.
2. **Normal Patient Workflow (1.5 min):**  
   Log in as `patient01@medivault.test`. Navigate through the **Patient Dashboard**, inspect medical records, view diagnostic lab PDFs in the **Document Vault**, and visit the **Privacy Centre**.
3. **Live Vulnerability Demonstration (2.5 min):**  
   - **V01 (IDOR/BOLA):** Query `GET /api/patients/PAT-100002` while authenticated as `patient01` to view Priya Patel's confidential records.
   - **V03 & V04 (Data Exposure & Plaintext Storage):** Inspect network response to see bcrypt `password_hash` leaked in the profile payload; inspect `medivault.db` via SQLite to show unencrypted Aadhaar and psychiatric notes.
   - **V05 (Public Backups):** Open `http://127.0.0.1:8000/public/backups/backup_dump.sql` directly in a browser without authentication.
   - **V06 (Unrestricted File Upload):** Upload an HTML file with embedded JavaScript to `POST /api/reports/upload` and execute stored XSS via `/public/uploads/`.
   - **V10 & V12 (Dark-Pattern Consent & Incomplete Breach Response):** Highlight the pre-checked bundled consent checkboxes during registration and inspect the Staff Security Incident panel displaying 0 correlated patient records.
4. **Remediation & Secure Architecture (1.5 min):**  
   Open `VULNERABILITY.md` and reference exact code locations (validated via `scripts/verify_refs.py`) to show how proper authorization checks, DTO masking, authenticated file streamers, and correlated audit trails remediate each flaw.
5. **Summary & Wrap-Up (0.5 min):**  
   Emphasize secure-by-default architecture and user-centric data privacy.

---

## 7. Security Testing & Verification

Automated regression and exploit verification test suites are included:

```bash
# Run the complete vulnerability exploit verification suite (41 tests)
pytest tests/ -v

# Verify that all 12 vulnerability line references match exact source code
python scripts/verify_refs.py

# Verify frontend production build
cd frontend && npm run build
```

---

## 8. Vulnerability Reference Matrix

Detailed documentation for all 12 vulnerabilities is available in [VULNERABILITY.md](VULNERABILITY.md):

| ID | Vulnerability Title | Severity | Primary Affected File & Lines |
| :--- | :--- | :--- | :--- |
| **V01** | Broken Object-Level Authorisation (IDOR / BOLA) | Critical | `backend/app/routes/patients.py:71-125` |
| **V02** | Excessive Staff Privileges | High | `backend/app/routes/staff.py:117-136` |
| **V03** | Excessive Data Exposure in API | High | `backend/app/schemas/patient.py:22-48`, `patients.py:61-68` |
| **V04** | Weak Storage Protection (Plaintext PII) | Critical | `backend/app/models.py:48-51`, `patients.py:147-152` |
| **V05** | Publicly Reachable Documents & Backups | Critical | `backend/app/main.py:70-73` |
| **V06** | Insecure File Upload Validation (Stored XSS) | Critical | `backend/app/routes/reports.py:85-95` |
| **V07** | Weak Session & Authentication Controls | High | `backend/app/routes/auth.py:45-56`, `frontend/src/services/api.js:9-15` |
| **V08** | Sensitive Data in Application Logs | High | `backend/app/main.py:13-20`, `backend/app/main.py:44-63` |
| **V09** | Excessive / Undefined Data Retention | Medium | `backend/app/routes/privacy.py:222-255` |
| **V10** | Dark-Pattern Privacy Notice & Consent UX | Medium | `frontend/src/pages/Auth.jsx:270-320`, `ConsentModal.jsx:125-138` |
| **V11** | Missing Rights & Grievance Workflow | Medium | `backend/app/routes/privacy.py:159-217`, `PrivacyCentre.jsx:333-373` |
| **V12** | Incomplete Breach-Response Workflow | High | `backend/app/routes/staff.py:159-196`, `StaffDashboard.jsx:661-685` |
