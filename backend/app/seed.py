"""MediVault Synthetic Data and Artifacts Seeder.

Populates SQLite database with 5 standard demo accounts, realistic synthetic clinical records,
consent preferences, audit records, dummy SQL backups, and watermarked PDF reports.
"""

from datetime import datetime
import os
import bcrypt
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from backend.app.config import settings
from backend.app.database import Base, SessionLocal, engine
from backend.app.models import (
    AuditLog,
    ConsentRecord,
    IdentityRecord,
    MedicalReport,
    PatientProfile,
    User,
)


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def generate_watermarked_pdf(filepath: str, title: str, patient_name: str, patient_id: str, details: list[str]) -> None:
    """Generate a realistic healthcare PDF report with an unmistakable synthetic watermark."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # Draw diagonal background watermark
    c.saveState()
    c.setFont("Helvetica-Bold", 30)
    c.setFillColor(colors.Color(0.85, 0.85, 0.85, alpha=0.5))
    c.translate(width / 2, height / 2)
    c.rotate(45)
    c.drawCentredString(0, 50, "SYNTHETIC HACKATHON DEMO DATA")
    c.drawCentredString(0, 0, "NOT A REAL MEDICAL RECORD")
    c.drawCentredString(0, -50, "FOR EDUCATIONAL LAB USE ONLY")
    c.restoreState()

    # Header Banner
    c.setFillColor(colors.HexColor("#0f766e"))  # Teal-700
    c.rect(0, height - 80, width, 80, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(40, height - 45, "MediVault Diagnostic Laboratory & Hospital")
    c.setFont("Helvetica", 10)
    c.drawString(40, height - 65, "National Health Record System — Synthetic Clinical Testing Environment")

    # Patient & Report Metadata Card
    c.setStrokeColor(colors.HexColor("#cbd5e1"))  # Slate-300
    c.setFillColor(colors.HexColor("#f8fafc"))  # Slate-50
    c.roundRect(40, height - 170, width - 80, 75, 4, fill=True, stroke=True)

    c.setFillColor(colors.HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(55, height - 110, f"PATIENT NAME: {patient_name.upper()}")
    c.drawString(55, height - 128, f"PATIENT ID:   {patient_id}")
    c.drawString(55, height - 146, f"DATE:         {datetime.utcnow().strftime('%Y-%m-%d')}")

    c.drawString(320, height - 110, f"REPORT TITLE: {title}")
    c.drawString(320, height - 128, "FACILITY:     MediVault Central Diagnostic Wing")
    c.drawString(320, height - 146, "STATUS:       FINAL / VERIFIED (SYNTHETIC)")

    # Title of Section
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.HexColor("#0f766e"))
    c.drawString(40, height - 200, "Clinical Observations & Diagnostic Findings")

    # Content Lines
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#1e293b"))
    y = height - 225
    for line in details:
        if line.startswith("##"):
            c.setFont("Helvetica-Bold", 11)
            c.setFillColor(colors.HexColor("#0f766e"))
            y -= 6
            c.drawString(40, y, line.replace("##", "").strip())
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor("#1e293b"))
            y -= 16
        else:
            c.drawString(50, y, f"• {line}")
            y -= 16

    # Footer Notice
    c.setStrokeColor(colors.HexColor("#e2e8f0"))
    c.line(40, 50, width - 40, 50)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.HexColor("#dc2626"))  # Red
    c.drawCentredString(width / 2, 35, "*** STRICTLY SYNTHETIC DEMONSTRATION RECORD — NOT FOR CLINICAL USE ***")
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawCentredString(width / 2, 22, "MediVault Security & Privacy Educational Hackathon Lab — Local Isolated Testing")

    c.save()


def seed_dummy_sql_backup(filepath: str) -> None:
    """Generate a realistic dummy SQL backup file for vulnerability V05 demonstration."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    content = """-- =============================================================================
-- MediVault Database Automated Dump (SYNTHETIC LAB BACKUP)
-- WARNING: FOR EDUCATIONAL HACKATHON DEMONSTRATION PURPOSES ONLY.
-- ALL DATA CONTAINED HEREIN IS 100% FICTIONAL AND SYNTHETIC.
-- =============================================================================

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50)
);

INSERT INTO users VALUES(1,'patient01@example.test','$2b$12$syntheticHashPatient01OnlyForDemoXYZ','Aarav Sharma','patient','PAT-DEMO-001');
INSERT INTO users VALUES(2,'patient02@example.test','$2b$12$syntheticHashPatient02OnlyForDemoXYZ','Priya Patel','patient','PAT-DEMO-002');
INSERT INTO users VALUES(3,'reception@example.test','$2b$12$syntheticHashReceptionOnlyForDemoXYZ','Rohan Verma','staff_basic','STF-DEMO-001');
INSERT INTO users VALUES(4,'doctor@example.test','$2b$12$syntheticHashDoctorOnlyForDemoXYZ','Dr. Ananya Rao','staff_clinical','STF-DEMO-002');
INSERT INTO users VALUES(5,'privacy@example.test','$2b$12$syntheticHashPrivacyOnlyForDemoXYZ','Suresh Menon','admin_dpo','ADM-DEMO-001');

CREATE TABLE IF NOT EXISTS patient_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER,
    full_name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(10),
    allergies TEXT,
    conditions TEXT,
    medical_notes TEXT,
    aadhaar_demo_ref VARCHAR(100),
    ayushman_demo_ref VARCHAR(100)
);

INSERT INTO patient_profiles VALUES(1,'PAT-DEMO-001',1,'Aarav Sharma','B+','Penicillin','Type-2 Diabetes','Patient shows good glycemic control. Psychiatric note: Mild situational anxiety.','DEMO-AADHAAR-0001','DEMO-PM-JAY-0001');
INSERT INTO patient_profiles VALUES(2,'PAT-DEMO-002',2,'Priya Patel','O+','Sulfa drugs','Asthma, Chronic Migraine','Asthma controlled. Counseling: requested cardiac genetics screening.','DEMO-AADHAAR-0002','DEMO-PM-JAY-0002');

COMMIT;
-- Dump completed on 2026-11-22 00:00:00 UTC
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def seed_database() -> None:
    """Populate database and local storage with complete synthetic data set."""
    print("[*] Creating database schema tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "patient01@example.test").first()
        if existing_user:
            print("[!] Demo accounts already detected. Refreshing seed dataset...")
            db.query(AuditLog).delete()
            db.query(ConsentRecord).delete()
            db.query(MedicalReport).delete()
            db.query(IdentityRecord).delete()
            db.query(PatientProfile).delete()
            db.query(User).delete()
            db.commit()

        print("[*] Seeding 5 primary demo user accounts...")
        default_pwd_hash = hash_password("Password123!")

        users_data = [
            {
                "email": "patient01@example.test",
                "full_name": "Aarav Sharma",
                "role": "patient",
                "patient_id": "PAT-DEMO-001",
            },
            {
                "email": "patient02@example.test",
                "full_name": "Priya Patel",
                "role": "patient",
                "patient_id": "PAT-DEMO-002",
            },
            {
                "email": "reception@example.test",
                "full_name": "Rohan Verma (Front Desk)",
                "role": "staff_basic",
                "patient_id": "STF-DEMO-001",
            },
            {
                "email": "doctor@example.test",
                "full_name": "Dr. Ananya Rao (Chief Medical Officer)",
                "role": "staff_clinical",
                "patient_id": "STF-DEMO-002",
            },
            {
                "email": "privacy@example.test",
                "full_name": "Suresh Menon (Data Protection Officer)",
                "role": "admin_dpo",
                "patient_id": "ADM-DEMO-001",
            },
        ]

        user_objects: dict[str, User] = {}
        for u in users_data:
            user = User(
                email=u["email"],
                password_hash=default_pwd_hash,
                full_name=u["full_name"],
                role=u["role"],
                patient_id=u["patient_id"],
                is_active=True,
            )
            db.add(user)
            db.flush()
            user_objects[u["email"]] = user

        print("[*] Seeding synthetic Patient Profiles...")
        profile_p1 = PatientProfile(
            patient_id="PAT-DEMO-001",
            user_id=user_objects["patient01@example.test"].id,
            full_name="Aarav Sharma",
            date_of_birth="1988-06-15",
            gender="Male",
            phone="+91-98765-43210",
            email="patient01@example.test",
            address="402 Palm Grove Enclave, Sector 14, Gurgaon, HR",
            emergency_contact="Sunita Sharma (+91-98765-43219)",
            blood_group="B+",
            allergies="Penicillin, Shellfish",
            conditions="Type-2 Diabetes, Mild Hypertension",
            medications="Metformin 500mg (BID), Amlodipine 5mg (OD)",
            medical_notes="Patient adheres to dietary restrictions. Blood pressure stable at 128/82. Confidential clinical notes: Undergoing cognitive behavioral therapy sessions for workplace anxiety.",
            aadhaar_demo_ref="DEMO-AADHAAR-0001",
            ayushman_demo_ref="DEMO-PM-JAY-0001",
            is_active=True,
        )

        profile_p2 = PatientProfile(
            patient_id="PAT-DEMO-002",
            user_id=user_objects["patient02@example.test"].id,
            full_name="Priya Patel",
            date_of_birth="1994-11-22",
            gender="Female",
            phone="+91-98765-11223",
            email="patient02@example.test",
            address="12 Rosewood Apartments, 80ft Road, Indiranagar, Bengaluru, KA",
            emergency_contact="Kunal Patel (+91-98765-99887)",
            blood_group="O+",
            allergies="Sulfa antibiotics",
            conditions="Bronchial Asthma, Chronic Migraine",
            medications="Budesonide 200mcg Rotacaps, Sumatriptan 50mg PRN",
            medical_notes="Spirometry reveals mild airway reactivity. Chronic migraines trigger upon irregular sleep schedules. Confidential note: Requested pre-pregnancy genetic screening for familial cardiomyopathies.",
            aadhaar_demo_ref="DEMO-AADHAAR-0002",
            ayushman_demo_ref="DEMO-PM-JAY-0002",
            is_active=True,
        )

        db.add(profile_p1)
        db.add(profile_p2)
        db.flush()

        print("[*] Seeding Identity Records...")
        id_record_1 = IdentityRecord(
            patient_profile_id=profile_p1.id,
            patient_id="PAT-DEMO-001",
            scheme_name="Synthetic UIDAI Aadhaar Reference",
            aadhaar_demo_ref="DEMO-AADHAAR-0001",
            ayushman_demo_ref="DEMO-PM-JAY-0001",
            document_filename="id_card_PAT-DEMO-001.pdf",
            verification_status="verified",
        )
        id_record_2 = IdentityRecord(
            patient_profile_id=profile_p2.id,
            patient_id="PAT-DEMO-002",
            scheme_name="Synthetic UIDAI Aadhaar Reference",
            aadhaar_demo_ref="DEMO-AADHAAR-0002",
            ayushman_demo_ref="DEMO-PM-JAY-0002",
            document_filename="id_card_PAT-DEMO-002.pdf",
            verification_status="verified",
        )
        db.add(id_record_1)
        db.add(id_record_2)

        print("[*] Generating watermarked synthetic PDF reports and physical files...")
        upload_dir = settings.UPLOAD_DIR
        backup_dir = settings.BACKUP_DIR
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(backup_dir, exist_ok=True)

        # PDF 1: Patient 01 Lab Report
        pdf_path_1 = os.path.join(upload_dir, "report_PAT-DEMO-001.pdf")
        generate_watermarked_pdf(
            pdf_path_1,
            title="Comprehensive Metabolic & Glycemic Profile",
            patient_name="Aarav Sharma",
            patient_id="PAT-DEMO-001",
            details=[
                "## Test Panel: Glycemic Assessment",
                "Fasting Blood Glucose: 118 mg/dL (Reference: 70 - 99 mg/dL) [ELEVATED]",
                "HbA1c (Glycated Hemoglobin): 6.4 % (Reference: < 5.7 %) [PRE-DIABETIC / CONTROLLED]",
                "Estimated Average Glucose (eAG): 137 mg/dL",
                "## Test Panel: Lipid Assessment",
                "Total Cholesterol: 184 mg/dL (Reference: < 200 mg/dL) [NORMAL]",
                "Triglycerides: 142 mg/dL (Reference: < 150 mg/dL) [NORMAL]",
                "HDL Cholesterol: 48 mg/dL (Reference: > 40 mg/dL) [OPTIMAL]",
                "LDL Cholesterol: 108 mg/dL (Reference: < 100 mg/dL) [BORDERLINE]",
                "## Clinical Impression",
                "Current oral hypoglycemic regimen demonstrates adequate metabolic regulation.",
            ],
        )

        # PDF 2: Patient 02 Lab Report (V05 & IDOR target)
        pdf_path_2 = os.path.join(upload_dir, "report_PAT-DEMO-002.pdf")
        generate_watermarked_pdf(
            pdf_path_2,
            title="Pulmonary Function & Spirometry Diagnostic Test",
            patient_name="Priya Patel",
            patient_id="PAT-DEMO-002",
            details=[
                "## Spirometry Parameters",
                "FVC (Forced Vital Capacity): 3.42 L (94% of predicted) [NORMAL]",
                "FEV1 (Forced Expiratory Volume 1s): 2.48 L (76% of predicted) [REDUCED]",
                "FEV1 / FVC Ratio: 0.72 (Predicted: > 0.80) [OBSTRUCTIVE PATTERN]",
                "Peak Expiratory Flow (PEF): 380 L/min (82% of predicted)",
                "Post-Bronchodilator FEV1: Improved by +14% (310 mL) [REVERSIBLE OBSTRUCTION]",
                "## Physician Assessment",
                "Mild obstructive ventilatory defect consistent with well-managed bronchial asthma.",
                "Continue Budesonide maintenance inhaler. Repeat spirometry in 6 months.",
            ],
        )

        # PDF 3: Patient 01 Prescription
        pdf_path_3 = os.path.join(upload_dir, "prescription_PAT-DEMO-001.pdf")
        generate_watermarked_pdf(
            pdf_path_3,
            title="Outpatient Clinical Prescription & Care Plan",
            patient_name="Aarav Sharma",
            patient_id="PAT-DEMO-001",
            details=[
                "## Prescribed Medications",
                "1. Tab. Metformin Hydrochloride 500 mg — 1 tablet twice daily with meals (60 days)",
                "2. Tab. Amlodipine Besylate 5 mg — 1 tablet once daily morning (60 days)",
                "3. Tab. Multivitamin with B-Complex — 1 tablet daily after breakfast (30 days)",
                "## Dietary & Lifestyle Advisory",
                "Low-glycemic Mediterranean diet recommended. Engage in 30 minutes brisk walking daily.",
                "Avoid NSAIDs and Penicillin class antibiotics due to verified allergy history.",
            ],
        )

        # Register reports in DB
        rep1 = MedicalReport(
            patient_id="PAT-DEMO-001",
            patient_profile_id=profile_p1.id,
            user_id=user_objects["patient01@example.test"].id,
            title="Comprehensive Metabolic & Glycemic Profile",
            report_type="Lab Report",
            doctor_name="Dr. Ananya Rao",
            file_path=pdf_path_1,
            file_name="report_PAT-DEMO-001.pdf",
            file_size=os.path.getsize(pdf_path_1),
            mime_type="application/pdf",
            is_sensitive=False,
        )

        rep2 = MedicalReport(
            patient_id="PAT-DEMO-002",
            patient_profile_id=profile_p2.id,
            user_id=user_objects["patient02@example.test"].id,
            title="Pulmonary Function & Spirometry Diagnostic Test",
            report_type="Lab Report",
            doctor_name="Dr. Ananya Rao",
            file_path=pdf_path_2,
            file_name="report_PAT-DEMO-002.pdf",
            file_size=os.path.getsize(pdf_path_2),
            mime_type="application/pdf",
            is_sensitive=True,
        )

        rep3 = MedicalReport(
            patient_id="PAT-DEMO-001",
            patient_profile_id=profile_p1.id,
            user_id=user_objects["patient01@example.test"].id,
            title="Outpatient Clinical Prescription & Care Plan",
            report_type="Prescription",
            doctor_name="Dr. Ananya Rao",
            file_path=pdf_path_3,
            file_name="prescription_PAT-DEMO-001.pdf",
            file_size=os.path.getsize(pdf_path_3),
            mime_type="application/pdf",
            is_sensitive=False,
        )

        db.add_all([rep1, rep2, rep3])

        print("[*] Seeding dummy SQL backup file...")
        backup_file_path = os.path.join(backup_dir, "backup_dump.sql")
        seed_dummy_sql_backup(backup_file_path)

        print("[*] Seeding Consent Records...")
        consents = [
            ConsentRecord(
                user_id=user_objects["patient01@example.test"].id,
                patient_id="PAT-DEMO-001",
                purpose="clinical_care",
                description="Consent to store and process health data for medical care delivery",
                is_granted=True,
                version="1.0",
            ),
            ConsentRecord(
                user_id=user_objects["patient01@example.test"].id,
                patient_id="PAT-DEMO-001",
                purpose="third_party_sharing",
                description="Consent to share diagnostic records with accredited testing networks",
                is_granted=True,
                version="1.0",
            ),
            ConsentRecord(
                user_id=user_objects["patient01@example.test"].id,
                patient_id="PAT-DEMO-001",
                purpose="analytics_research",
                description="Consent to anonymized clinical research participation",
                is_granted=False,
                version="1.0",
            ),
            ConsentRecord(
                user_id=user_objects["patient02@example.test"].id,
                patient_id="PAT-DEMO-002",
                purpose="clinical_care",
                description="Consent to store and process health data for medical care delivery",
                is_granted=True,
                version="1.0",
            ),
            ConsentRecord(
                user_id=user_objects["patient02@example.test"].id,
                patient_id="PAT-DEMO-002",
                purpose="third_party_sharing",
                description="Consent to share diagnostic records with accredited testing networks",
                is_granted=False,
                version="1.0",
            ),
        ]
        db.add_all(consents)

        print("[*] Seeding Initial Audit Logs...")
        audit_events = [
            AuditLog(
                actor_id="system_seeder",
                actor_email="system@medivault.internal",
                action="INITIALIZE_ENVIRONMENT",
                endpoint="/system/bootstrap",
                target_resource_id="SYSTEM",
                status="SUCCESS",
                status_code=200,
                details="MediVault synthetic security and privacy testing lab seeded successfully.",
            ),
            AuditLog(
                actor_id="STF-DEMO-002",
                actor_email="doctor@example.test",
                action="VIEW_PATIENT",
                endpoint="/api/staff/patients/PAT-DEMO-001",
                target_resource_id="PAT-DEMO-001",
                status="SUCCESS",
                status_code=200,
                details="Routine consultation review for Aarav Sharma.",
            ),
            AuditLog(
                actor_id="PAT-DEMO-002",
                actor_email="patient02@example.test",
                action="UPLOAD_REPORT",
                endpoint="/api/reports/upload",
                target_resource_id="report_PAT-DEMO-002.pdf",
                status="SUCCESS",
                status_code=201,
                details="Synthetic spirometry diagnostic report uploaded.",
            ),
        ]
        db.add_all(audit_events)

        db.commit()
        print("[+] Synthetic database and file artifacts seeded successfully!")
        print("    Demo Accounts Created (Password: 'Password123!'):")
        print("    - patient01@example.test  [patient]         ID: PAT-DEMO-001")
        print("    - patient02@example.test  [patient]         ID: PAT-DEMO-002")
        print("    - reception@example.test  [staff_basic]     ID: STF-DEMO-001")
        print("    - doctor@example.test     [staff_clinical]  ID: STF-DEMO-002")
        print("    - privacy@example.test    [admin_dpo]       ID: ADM-DEMO-001")
        print(f"    Artifacts Created in '{upload_dir}' and '{backup_dir}'")

    except Exception as e:
        db.rollback()
        print(f"[-] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
