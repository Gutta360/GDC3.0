# GDC3.0 Phase 1 verification

Result: **CONDITIONAL PASS**. The local implementation, automated tests, Capacitor sync, and Android debug packaging pass. Physical-tablet SQLite acceptance was not run because no device installation was authorized.

## Requested gates

| Gate | Result | Evidence |
|---|---|---|
| Reference audit | PASS | GDC2.0, GT2.0, and local GDB contract docs inspected read-only. |
| Angular unit tests | PASS | `npm test`: 3 test files, 7 tests passed. |
| TypeScript/Angular production build | PASS | `npm run build`: Angular 22 AOT production build passed. |
| SQLite schema/migration smoke test | PASS | Node SQLite executed the Phase 1 DDL twice, enforced constraints, inserted a synthetic patient/outbox event, and verified both rows. This is not encrypted Android-plugin evidence. |
| Capacitor sync | PASS | `npm run cap:sync`: web assets copied and `@capacitor-community/sqlite@8.1.1` synchronized. |
| Android debug APK | PASS | `npm run android:build`: Gradle 8.14.3 build passed. |
| Physical Android SQLite | NOT RUN | No tablet installation authorized or performed. |

## Functional coverage implemented

- Database initialization and encrypted native SQLite configuration.
- Clean schema creation and logical migration marker.
- Local setup/login with PBKDF2 password hashing.
- Patient create/list/search/detail/update/deactivate.
- Validation and GDC2.0 duplicate semantics.
- Transactional outbox creation, UUIDs, timestamps, base/entity versions, and tombstone operation.
- Unchanged patient update returns the existing version without an extra outbox event.

## Build artifact

- APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Package: `com.gutta.gdc3`
- Version: `1.0` (`versionCode 1`)
- Signing: debug signing, APK Signature Scheme v2 verified; Android Debug certificate.
- Size/hash: 13,273,900 bytes; SHA-256 `95dd9d3df7bed0bd2913f1018a1efee2b5245b7f8bf678b670da4ffbef3fb6fd`.

## Acceptance caveat

Phase 1 is not eligible for a complete offline Android acceptance claim until the generated APK is exercised on an authorized Android tablet with startup, create/update/search, restart persistence, and encrypted SQLite checks. No APK was installed by this project run.
