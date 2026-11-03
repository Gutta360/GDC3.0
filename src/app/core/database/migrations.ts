export const DATABASE_NAME = 'gdc3_operational';
export const DATABASE_VERSION = 1;

/**
 * The Phase 1 schema is intentionally local and additive. UUIDs are the
 * synchronization identity; patient_number remains a human-facing clinic ID.
 */
export const CURRENT_SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS local_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_iterations INTEGER NOT NULL CHECK (password_iterations >= 100000),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS patient_number_sequence (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  next_number INTEGER NOT NULL CHECK (next_number > 0)
);
INSERT OR IGNORE INTO patient_number_sequence(singleton, next_number) VALUES (1, 1);
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  patient_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL CHECK (length(trim(first_name)) BETWEEN 2 AND 50),
  last_name TEXT CHECK (last_name IS NULL OR length(last_name) <= 50),
  gender TEXT NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  age INTEGER NOT NULL CHECK (age BETWEEN 1 AND 120),
  mobile TEXT NOT NULL CHECK (length(mobile) = 10 AND mobile NOT GLOB '*[^0-9]*'),
  address TEXT NOT NULL CHECK (length(trim(address)) BETWEEN 2 AND 255),
  referred_by TEXT NOT NULL CHECK (referred_by IN ('DOCTOR', 'PATIENT', 'ONLINE', 'SELF', 'OTHER')),
  doctor_name TEXT,
  consultation_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (consultation_fee_cents >= 0),
  registration_date TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0),
  CHECK (referred_by <> 'DOCTOR' OR length(trim(coalesce(doctor_name, ''))) BETWEEN 2 AND 100)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_patients_name_mobile
  ON patients(lower(trim(first_name)), mobile);
CREATE INDEX IF NOT EXISTS ix_patients_active_name
  ON patients(is_active, first_name, last_name, patient_number);
CREATE INDEX IF NOT EXISTS ix_patients_mobile ON patients(mobile);
CREATE TABLE IF NOT EXISTS sync_metadata (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  application_code TEXT NOT NULL,
  tenant_id TEXT,
  device_id TEXT,
  last_pull_cursor INTEGER,
  last_successful_push_at TEXT
);
INSERT OR IGNORE INTO sync_metadata(singleton, application_code) VALUES (1, 'GDC');
CREATE TABLE IF NOT EXISTS sync_outbox (
  event_id TEXT PRIMARY KEY,
  contract_version INTEGER NOT NULL DEFAULT 1,
  application_code TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
  base_version INTEGER NOT NULL CHECK (base_version >= 0),
  entity_version INTEGER NOT NULL CHECK (entity_version > 0),
  payload_version INTEGER NOT NULL DEFAULT 1,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (sync_status IN ('PENDING', 'IN_FLIGHT', 'ACKNOWLEDGED', 'FAILED')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  acknowledged_at TEXT
);
CREATE INDEX IF NOT EXISTS ix_outbox_pending
  ON sync_outbox(sync_status, created_at, event_id);
CREATE INDEX IF NOT EXISTS ix_outbox_entity_version
  ON sync_outbox(entity_type, entity_id, entity_version);
`;
