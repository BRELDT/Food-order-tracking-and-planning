# Thanksgiving release candidate — November 4, 2026

**NO-GO for public Thanksgiving ordering until live acceptance is complete.**

Candidate backend marker: `2026-11-04-thanksgiving-readiness-v1`.
Baseline main commit: `8110ca5da221b390233edfd42b8d7a42cf33e5a6`.
Repair branch: `thanksgiving/readiness-20261104`.
Source rollback: `rollback/main-before-thanksgiving-20261104`.

## Repairs

- Retain administrator creation IDs and payload hashes through uncertain responses/reloads; add protected admin receipt recovery.
- Deduplicate event creation using a permanent client creation UUID under the existing lock.
- Allow Closed/Draft preparation without inventing a pickup address or meal allocation; require both before opening.
- Reject email substitutions in recipient street-address fields and malformed recipient entries.
- Fix organization reporting for Object-key names; add capacity/remaining and status counts.
- Recheck live route version/final status before printing; block unverified direct print and include pickup on the sheet.
- Keep private contact/address/dietary/note text out of future audit entries; preserve historical records.
- Repair the synthetic preview's receipt/asset handling and align browser acceptance fixtures with current behavior.
- Regenerate both deployment packages from source. No runtime dependency or Google service was added.

## Local validation

- `npm test`: 90/90.
- `npm run test:bundle`: 90/90.
- `npm run check` and `git diff --check`: pass.
- `npm run test:ui`: 10/10 Chromium checks, synthetic backend, desktop/tablet/phone viewport emulation.
- `npm run test:addresses:ui`: 8/8 checks using explicit shared-component and administrator fixtures, including race handling, unit preservation, verification persistence and pickup review.
- 30-stop delivery PDF: eight US Letter pages; all stops, pickup, delivery fields and checkboxes; private sentinel fields absent. Pages rendered and visually inspected.
- Google services are synthetic fixtures in local tests. These results do not establish live deployment readiness or actual Safari/iPhone behavior.

Browser tests require a local Playwright Chromium installation. `MEALS_BROWSER_EXECUTABLE` may select an installed executable; no browser binary or test dependency is committed.

## Required release sequence

1. Verify actual Apps Script project and both deployed versions, execution modes, scopes, Script Properties and Sheet connection. Export current editor source/manifest and record deployment settings before replacement. GitHub source rollback is not a deployed Apps Script backup.
2. Confirm recoverable private database backup. Preserve all historical and legacy rows; do not run schema setup/migration or reconstruct missing records from guesses.
3. Confirm Thanksgiving capacity, pickup and cutoff. Keep the event Closed until launch checks pass. Close the old test event before opening Thanksgiving.
4. Verify both intended administrator accounts, effective Sheet access and unauthorized rejection. Confirm anonymous private-data protection and the organization-access/abuse-prevention process.
5. Install either the complete one-file package OR modular files, never both. Preserve the manifest, advanced Sheets service, Script Properties and existing deployment IDs. Do not enable billing/APIs.
6. Update both existing Apps Script deployments and the existing Pages workflow only after deployment rollback is verified. Confirm candidate marker via authenticated identity.
7. Run controlled live multi-recipient submission, retry/receipt, capacity/concurrency, approval, manual address review, route/save/print and report acceptance. Do not create uncontrolled production referrals.
8. Reconcile live meal totals and excluded historical-record warnings, then authorize opening Thanksgiving.

The production public backend could not be verified from this session; the administrator account was signed out. No deployment, public event opening or historical-data mutation was performed. A detailed private completion report, backup reference and administrator quick-start were delivered separately.

The unmerged October 16 archive-reuse/two-driver feature branch was inspected but is outside this candidate. Manual routing remains available; do not substitute straight-line distance for driving optimization.
