# GDC3.0 source and architecture reuse audit

## GDC2.0 business findings

The verified GDC2.0 repository contains Angular patient screens and a Spring patient module, plus established modules for Dashboard/Home, Appointments, Treatments, Payments, and Pharmacy. Patient Registration uses:

- `P-` plus zero-padded five-digit human IDs;
- required first name (2–50 letters/spaces), optional last name (up to 50 letters/spaces), gender `MALE|FEMALE|OTHER`, age 1–120, 10-digit mobile, address 2–255 characters;
- referral source `DOCTOR|PATIENT|ONLINE|SELF|OTHER`;
- doctor name required for doctor referral and cleared for other referral sources;
- non-negative consultation fee with up to eight integer digits and two decimals;
- registration timestamp;
- active/deleted lifecycle fields and audit timestamps;
- duplicate protection on normalized first name + mobile;
- list, search, detail, update, and soft delete operations.

The Phase 1 implementation preserves these patient semantics and names while using local UUIDs as the durable identity. It does not copy GDC2.0 REST controllers, Spring Boot, PostgreSQL, or server assumptions.

## GDC2.0 module map

| Module | Business purpose and entities | Main rules and operations observed |
|---|---|---|
| Dashboard / Home | Reception landing page and navigation shell; no separate business entity was required by the inspected module. | Routes staff to patient, appointment, treatment, payment, and pharmacy workflows. |
| Patient Registration | `patients`; a patient owns appointments, treatments/follow-ups, treatment payments, and pharmacy payments. | Create/get/list/search/update/soft-delete. `P-` numbering, normalized first-name + mobile duplicate check, age/gender/mobile/address/referral/fee validation, doctor-name conditional rule, active/deleted audit fields. |
| Appointments | `appointments`, `appointment_slot_reservations`, and `doctor_busy_slots`; appointment belongs to a patient and one reserved slot. | Create/get/latest-for-patient/day/availability plus doctor-busy create/delete. Date, time, type (`NEW|FOLLOW_UP`), notes, optional vitals and medical/allergy/dental history, consent, and BMI-related ranges are validated. Slot reservation is the conflict boundary, so double booking and doctor-busy collisions are rejected. |
| Treatments | `treatments`, `follow_ups`, `clinical_problems`, `clinical_problem_teeth`, `root_canal_lengths`, `implant_details`, `prescription_items`, and `clinical_scans`; treatment/follow-up belongs to a patient and may reference the preceding treatment. | Treatment create/get/latest and follow-up create/get/context. Treatment type is `ADVISED|DESIRED`; amount is non-negative; problem lists require a problem type and at least one FDI tooth; impaction requires an impaction type; implant/root-canal details are conditional; prescriptions require positive quantities and active, non-expired stock. The source exposes creation/read workflows rather than a general treatment update/delete API. |
| Payments | `payments` / `TreatmentPayment`, one payment per treatment, linked to both patient and treatment. | Outstanding-treatment list, create, get, and patient history. Modes are `CASH|UPI`; payment amount is non-negative, bounded to the numeric precision, cannot exceed the treatment outstanding amount, and a treatment cannot be paid twice. |
| Pharmacy | `medicines`, `medicine_stock_movements`, `pharmacy_payments`, and `pharmacy_payment_items`; pharmacy payment fulfills treatment/follow-up prescription items and decrements medicine stock. | Medicine list/stock/create/update/deactivate; pending prescriptions; pharmacy payment create/get/history. Medicine names are unique among active records, quantities are bounded and non-negative, new expiry dates cannot be in the past, cart items must be unique, prescriptions must belong to the selected patient, stock must be active/unexpired/sufficient, and fulfillment is all-or-nothing. |

The GDC2.0 frontend uses standalone Angular route components, page-level forms, patient selectors, calendar/list views, and shared tablet navigation. Those UI patterns informed the GDC3.0 shell, but only Patient Registration is implemented in Phase 1; the other modules remain placeholders.

## GT2.0 technical findings

The verified GT2.0 frontend uses Angular 22 standalone components, Capacitor 8.6, `@capacitor-community/sqlite` 8.1, encrypted Android SQLite, idempotent schema DDL, `schema_migrations`, a local PBKDF2 account model, and `executeSet(..., true)` for atomic write sets. Its Patient Repository and outbox patterns were used as the starting technical model.

GDC3.0 intentionally keeps only the relevant foundation. It does not copy GT2.0 branding, package ID, server enrollment, sync API client, snapshot/restore code, backend, or unrelated appointment/treatment/pharmacy implementations.

## GDB compatibility decisions

The local GDB v1.0 protocol requires UUID event identity, application/tenant/device scope, `baseVersion`, `entityVersion`, payload versioning, bounded idempotent batches, pull cursors, and tombstone signaling through DELETE operations. Phase 1 records the application code and event version fields locally; tenant/device/cursor values are reserved in `sync_metadata`, and no GDB connection is configured.

## Unresolved gaps

- Android physical-device persistence and encrypted SQLite behavior still require execution on an authorized tablet.
- The future GDC Patient payload and conflict policy need explicit GDB registration and Phase 2 contract review.
- Phase 1 has no remote backup, recovery, push/pull, conflict UI, or device enrollment.
- Browser layout builds are not evidence of native SQLite acceptance.
