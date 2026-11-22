# How to Run MediVault

## Prerequisites

- **Python 3.11+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** (includes npm) — [Download](https://nodejs.org/)
- **Git** (optional, for cloning)

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd HealthCare
```

---

## 2. Backend Setup

### 2.1 Create & Activate a Virtual Environment

```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Windows (CMD)
python -m venv .venv
.\.venv\Scripts\activate.bat

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2.3 Configure Environment Variables

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

Default values in `.env.example`:

| Variable                      | Default                                  |
| ----------------------------- | ---------------------------------------- |
| `DATABASE_URL`                | `sqlite:///./medivault.db`               |
| `SECRET_KEY`                  | `medivault-insecure-secret-key-12345`    |
| `ALGORITHM`                   | `HS256`                                  |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                                     |
| `UPLOAD_DIR`                  | `lab-data/uploads`                       |
| `BACKUP_DIR`                  | `lab-data/backups`                       |

### 2.4 Seed the Database

This creates the SQLite database, populates it with fictional accounts and clinical data, and generates sample PDF reports under `lab-data/`.

```bash
python -m backend.app.seed
```

**Seeded accounts** (all use password `Password123!`):

| Email                        | Role             | ID          |
| ---------------------------- | ---------------- | ----------- |
| `patient01@medivault.test`   | patient          | PAT-100001  |
| `patient02@medivault.test`   | patient          | PAT-100002  |
| `reception@medivault.test`   | staff_basic      | STF-200001  |
| `doctor@medivault.test`      | staff_clinical   | STF-200002  |
| `privacy@medivault.test`     | admin_dpo        | ADM-300001  |

### 2.5 Start the Backend Server

```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

or 

 python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at **http://127.0.0.1:8000**.  
Interactive API docs: **http://127.0.0.1:8000/docs**

---

## 3. Frontend Setup

Open a **new terminal** (keep the backend running).

### 3.1 Install Node Dependencies

```bash
cd frontend
npm install
```

### 3.2 Start the Dev Server

```bash
npm run dev
```

The frontend will be available at **http://localhost:5173**.  
Vite automatically proxies `/api` and `/public` requests to the backend on port 8000.

### 3.3 Build for Production (Optional)

```bash
npm run build
npm run preview
```

---

## 4. Running Tests

From the project root (with the virtual environment activated):

```bash
pytest tests/ -v
```

---

## 5. Quick Start (TL;DR)

```bash
# Terminal 1 — Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1          # Windows PowerShell
pip install -r requirements.txt
copy .env.example .env
python -m backend.app.seed
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser and log in with any seeded account above.

---

## 6. Project Structure Overview

```
HealthCare/
├── backend/                 # FastAPI REST API
│   ├── app/
│   │   ├── main.py          # App entry point & middleware
│   │   ├── config.py        # Settings (env-driven)
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # ORM models
│   │   ├── seed.py          # Database seeder
│   │   ├── routes/          # API route modules
│   │   └── schemas/         # Pydantic request/response schemas
│   └── requirements.txt
├── frontend/                # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx          # Root component & routing
│   │   ├── pages/           # Page components
│   │   ├── components/      # Shared UI components
│   │   └── services/        # API client
│   ├── package.json
│   └── vite.config.js       # Dev server & proxy config
├── lab-data/                # Uploaded reports & backups
├── tests/                   # Pytest test suites
├── scripts/                 # Utility & verification scripts
├── docs/                    # Documentation assets
├── .env.example             # Environment variable template
├── requirements.txt         # Pinned Python dependencies
└── medivault.db             # SQLite database (auto-created)
```

---

## 7. Troubleshooting

| Problem | Solution |
| --- | --- |
| `ModuleNotFoundError` on backend start | Make sure the virtual environment is activated and you ran `pip install -r requirements.txt` |
| Backend can't find `.env` | Run `copy .env.example .env` (Windows) or `cp .env.example .env` (macOS/Linux) from the project root |
| Frontend shows network errors | Ensure the backend is running on port 8000 before starting the frontend |
| Port 8000 already in use | Kill the process using the port or change with `--port 8001` (also update `vite.config.js` proxy target) |
| `npm install` fails | Ensure Node.js 18+ is installed; try deleting `node_modules` and `package-lock.json`, then re-run |
| Database needs a fresh reset | Delete `medivault.db` and re-run `python -m backend.app.seed` |
