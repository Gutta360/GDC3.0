# GDC3.0 Phase 1 architecture

## Boundary

GDC3.0 is a standalone offline Android tablet application. SQLite is the operational source of truth. Angular components call local services and repositories; no business operation calls an HTTP endpoint. GDC2.0, GT2.0, and GDB are read-only references and remain outside this workspace.

## Runtime layers

```text
Angular standalone components
        ↓
PatientService / AuthService / OutboxService
        ↓
PatientRepository + DatabaseService
        ↓
Capacitor Community SQLite (Android, encrypted secret mode)
        ↓
gdc3_operational
```

The database service opens the native encrypted database, applies idempotent DDL, records logical schema version 1, and exposes `executeSet` for transaction-safe mutation batches. The browser runtime is explicitly marked unsupported for business data.

## Local storage model

- `local_users`: local account metadata and PBKDF2-SHA-256 password digests. Plaintext passwords are never stored.
- `patient_number_sequence`: singleton sequence for human IDs such as `P-00001`.
- `patients`: UUID primary key, GDC2.0 business fields, lifecycle/tombstone columns, timestamps, and positive `record_version`.
- `sync_metadata`: reserved application/tenant/device/cursor fields for a future adapter; Phase 1 leaves tenant and device values unset.
- `sync_outbox`: durable local events with status and retry fields.
- `schema_migrations`: additive migration history.

Amounts are stored as integer cents (`consultation_fee_cents`) and exposed as decimal numbers at the service boundary. Dates are persisted as UTC ISO-8601 strings.

## Patient data flow

1. The reactive form applies user-facing validation.
2. `PatientService` applies the same domain normalization/validation used by the repository boundary.
3. `PatientRepository` reads the current sequence or entity version.
4. A single native SQLite transaction writes the patient mutation and its outbox event. Create advances the display sequence; update and deactivate use optimistic `record_version` predicates.
5. The UI reloads from SQLite. It never depends on server availability.

Duplicate active patient identity follows GDC2.0: case-insensitive first name plus mobile number. Deactivation is a soft delete. The row and its DELETE event remain locally available as a tombstone for future synchronization.

## Outbox design

Each mutation creates one event in the same transaction as the business write:

| Field | Phase 1 behavior |
|---|---|
| `event_id` | UUID idempotency key |
| `application_code` | `GDC` |
| `entity_type` | `PATIENT` |
| `entity_id` | Stable patient UUID |
| `operation` | `CREATE`, `UPDATE`, or `DELETE` |
| `base_version` | `0` for create; prior local version for update/delete |
| `entity_version` | `1` for create; next version thereafter |
| `payload_version` | `1` |
| `payload` | Application-owned JSON containing the Patient record |
| `sync_status` | Starts `PENDING`; no Phase 1 sender exists |

This matches the reviewed GDB protocol’s version and tombstone requirements without adding network access. A future adapter must claim events, push bounded batches, acknowledge only accepted/duplicate results, preserve conflicts, apply pull pages transactionally, and advance a cursor in the same transaction as pulled events.

## Screens and future modules

Implemented: local setup/login, dashboard, Patient Register, patient detail/search, patient edit, and deactivation. Appointments, Treatments, Payments, and Pharmacy are visible as clearly labeled future-phase placeholders. The header’s queued count is informational; there is no active Sync button.

## Security and recovery notes

Android uses the GT2.0-proven `@capacitor-community/sqlite` encrypted secret mode. The application ID is `com.gutta.gdc3`; no credentials or server URLs are embedded. Phase 1 has no remote backup or recovery capability, so loss of the device/application data remains a known risk.
