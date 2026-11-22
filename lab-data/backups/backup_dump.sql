-- =============================================================================
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
