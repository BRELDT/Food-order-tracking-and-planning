# Recipient status upgrade

For an existing workbook, confirm that `RECIPIENTS!S1` is `VerifiedAt` and columns T and U are empty. Set **T1 = Status** and **U1 = RejectionReason**. Leave existing rows blank in the new columns. The backend reads blank statuses from the original referral and stores each new decision against the existing RecipientID. No row backfill or migration function is needed.

Validate the upgrade on a separate workbook using synthetic recipients. Submit four people requesting two meals each. Approve all four, then reject one. The other three should stay approved, two meals should return to availability, and the route and delivery sheet should contain three stops.

An older backend ignores recipient status. After writing any recipient overrides, use a compatible version against that workbook.

Run `npm run build:apps-script` to generate the Apps Script packages in `.artifacts/apps-script/`.
