# GDC3.0 — Offline-first dental clinic tablet

GDC3.0 is an independent Angular + Capacitor Android application. Phase 1 establishes the encrypted native SQLite foundation and the offline Patient Registration workflow. The application does not require a server to start or to create, search, edit, or deactivate patient records.

## Phase 1 scope

- Local administrator setup and login using PBKDF2 password hashes.
- Tablet-friendly dashboard and navigation shell.
- Patient Registration CRUD: create, list, search, detail, edit, and soft deactivation.
- Native encrypted SQLite database named `gdc3_operational`.
- Additive schema versioning and stable UUID entity IDs.
- Transactional outbox events with `baseVersion`, `entityVersion`, `payloadVersion`, event UUID, and tombstone operations for future GDB integration.
- Placeholder screens for Appointments, Treatments, Payments, and Pharmacy.

The GDB adapter, network calls, device enrollment, and synchronization UI are intentionally out of scope for Phase 1.

## Development commands

```bash
npm ci
npm test
npm run build
npm run cap:sync
npm run android:build
```

The native SQLite path is Android-only. A browser build can be used for layout inspection, but it is not evidence of Android SQLite persistence.

## References

- GDC2.0: business and patient-registration reference.
- GT2.0: Angular/Capacitor/native encrypted SQLite reference.
- GDB v1.0: reviewed synchronization protocol only; not integrated.

See the Phase 1 audit, architecture, and test report under `docs/`.
