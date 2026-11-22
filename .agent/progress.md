# MediVault — Progress Tracking

- **Current Phase:** Phase 1
- **Last Completed Task:** Task 1.3: SQLAlchemy Core Data Models
- **Architectural Decisions & Deviations:**
  - `backend/app/config.py`: Exports `settings` (`Settings`) with `APP_MODE` (`LAB_VULNERABLE` default), `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `UPLOAD_DIR`, and `BACKUP_DIR`.
  - `backend/app/database.py`: Exports `engine`, `SessionLocal`, `Base`, and `get_db` dependency for FastAPI routes. SQLite `check_same_thread=False` configured.
  - `backend/app/models.py`: Defined SQLAlchemy models `User`, `PatientProfile`, `IdentityRecord`, `MedicalReport`, `ConsentRecord`, and `AuditLog` with relationship mappings and synthetic healthcare fields.
  - `.venv`: Configured virtual environment with Python 3.11 and backend dependencies.
  - `.agent/vulnerability.md`: Documented all 12 vulnerabilities (V01–V12), technical attack vectors, and remediation specifications.
- **Known Issues / Blockers:** None
- **Next Task:** Task 1.4: Synthetic Data & Watermarked PDF Seeder
