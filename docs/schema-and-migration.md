# Schema and non-destructive migration

The schema is defined in `apps-script/Store.gs`, not spreadsheet row numbers. `Schema.gs` plans and creates only missing tabs alongside Requests/Settings in the existing spreadsheet. Existing named tabs with different headers cause a clear error; no automatic overwrite/delete occurs. Shared-spreadsheet development requires MEALS_ENV=development and MEALS_SHARED_SHEET_DEV_ID equal to the configured spreadsheet ID. The allowlist bootstrap can append the two configured accounts only when ADMINUSERS contains its header alone. Existing account records remain untouched.

| Tab         | Durable identifier | Purpose                                                                                                                |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| EVENTS      | EventID            | Status, capacity, delivery date, pickup address, archive/version/route metadata                                        |
| REFERRALS   | ReferralID         | Organization, legacy status fallback, immutable original submission totals, optimistic version                                         |
| RECIPIENTS  | RecipientID        | Referral/Event relationships, meal count, independent status, rejection reason, delivery/dietary/internal fields, address review, route position |
| AUDITLOG    | AuditID            | Administrative actions with protected old/new values                                                                   |
| ADMINUSERS  | Email              | Private active administrator allowlist                                                                                 |
| SUBMISSIONS | SubmissionID       | Payload fingerprint and original successful minimal receipt                                                            |

The writer generates append/update cells in one Sheets API batch and writes literal typed strings, numbers and booleans. It rejects removed existing records except the single rejected recipient explicitly named by the authorized, opt-in deletion action. Existing row positions are found by IDs each time; sorting rows does not break relationships. Any service exception yields a generic safe error. The script lock spans current-state reads, capacity/version checks and the one final write; no external Maps call is made inside that transaction.

Pending and Approved recipients reserve their current MealCount. Rejected recipients release reservations. Blank recipient status on historical rows inherits the original referral status. See the [release guide](recipient-management-release.md) for the additive header change. OriginalRequestedMeals remains immutable on edits. Reports use current statuses/quantities for current reserved/approved/rejected values and the original snapshot for originally requested meals; those are different measures and need not sum after edits.

Legacy Requests/Settings are preserved. The original headers have no permanent IDs, EventID, organization contacts or MealCount. Legacy Comments may mean delivery instructions, internal notes, or something else. `legacyMigrationPlan_` reports a dry-run summary on test legacy rows without outputting their personal contents or changing their data. No actual legacy import is implemented/applied because the missing assignments and comment meaning require source inspection and explicit mapping approval. This is an intentional external dependency, not silent migration.

Before a future approved import:

1. Back up the original workbook privately; do not export personal records into the public Git repository.
2. Inspect record counts and missing fields privately.
3. Approve target event, organization assignment, meal-quantity interpretation and Comments mapping.
4. Preserve original Comments and all legacy fields in a private immutable source snapshot.
5. Design/import with durable source keys and a migration ledger so rerunning cannot duplicate imported records.
6. Dry-run and test rollback/atomicity on synthetic matching data before any real import.
7. Apply only after separate mapping and release approval.

Normal event reopening/unarchiving requires an explicit confirmation and protected audit entry. Completed events reopen to Closed. Public visibility depends on Open + not archived, not on an independent remaining counter.
