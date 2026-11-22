-- =============================================================================
-- MediVault Automated Database Backup
-- System Archive Dump
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

INSERT INTO users VALUES(1,'patient01@medivault.test','$2b$12$e5r.5V7f8rR/B6p7Qk8p6eWd.h8n7G2m5L4k3J2h1G0f9e8d7c6b5','Aarav Sharma','patient','PAT-100001');
INSERT INTO users VALUES(2,'patient02@medivault.test','$2b$12$f6s.6W8g9sS/C7q8Rl9q7fXe.i9o8H3n6M5l4K3i2H1g0f9e8d7c6','Priya Patel','patient','PAT-100002');
INSERT INTO users VALUES(3,'reception@medivault.test','$2b$12$g7t.7X9h0tT/D8r9Sm0r8gYf.j0p9I4o7N6m5L4j3I2h1g0f9e8d7','Rohan Verma','staff_basic','STF-200001');
INSERT INTO users VALUES(4,'doctor@medivault.test','$2b$12$h8u.8Y0i1uU/E9s0Tn1s9hZg.k1q0J5p8O7n6M5k4J3i2h1g0f9e8','Dr. Ananya Rao','staff_clinical','STF-200002');
INSERT INTO users VALUES(5,'privacy@medivault.test','$2b$12$i9v.9Z1j2vV/F0t1Uo2t0iAh.l2r1K6q9P8o7N6l5K4j3i2h1g0f9','Suresh Menon','admin_dpo','ADM-300001');

CREATE TABLE IF NOT EXISTS patient_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER,
    full_name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(10),
    allergies TEXT,
    conditions TEXT,
    medical_notes TEXT,
    aadhaar_ref VARCHAR(100),
    ayushman_ref VARCHAR(100)
);

INSERT INTO patient_profiles VALUES(1,'PAT-100001',1,'Aarav Sharma','B+','Penicillin','Type-2 Diabetes','Patient shows good glycemic control. Clinical note: Situational workplace stress managed with mindfulness therapy.','1002 4471 0001','PMJAY-0000-0001');
INSERT INTO patient_profiles VALUES(2,'PAT-100002',2,'Priya Patel','O+','Sulfa drugs','Asthma, Chronic Migraine','Asthma controlled with maintenance inhaler. Counseling notes: Requested pre-pregnancy clinical genetics screening.','1002 4471 0002','PMJAY-0000-0002');

COMMIT;
-- Dump completed on 2026-11-22 00:00:00 UTC
