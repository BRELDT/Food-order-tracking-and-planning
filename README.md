# Thanksgiving readiness work — November 4, 2026

Current repair branch: `thanksgiving/readiness-20261104`, based on main
`8110ca5da221b390233edfd42b8d7a42cf33e5a6`. This is a release candidate,
not proof of a production deployment. See `docs/thanksgiving-readiness-2026-11-04.md`.
Do not open Thanksgiving ordering until the launch blockers in that report are resolved.
The October 16 archive-reuse/two-driver feature branch was inspected and is not included.

---

# Community Meal Referral & Delivery System

Implementation-only development branch: `development/community-meals-v1-20261001`.

**Original October 1 implementation notes follow; deployment statements below describe that historical stage.**
The production repository baseline is `b004cf872a1e81357af55f78b4aa5141c7e9c10d`.

## Architecture

- Public HTML/CSS/JS remains compatible with existing GitHub Pages hosting.
- `admin.html` is an entry link, never an authentication boundary.
- Admin HTML is served by Apps Script HTML Service.
- One Apps Script project has two deployments: anonymous public (execute as owner), authenticated administrator (execute as accessing user).
- Every protected action checks Google active/effective identity and the private ADMINUSERS allowlist.
- The Google Sheet is private; administrators who execute as themselves require access to it.
- All reservation changes use the same script lock and a single atomic Sheets API batchUpdate.
- Public POST uses `text/plain;charset=utf-8` for a simple cross-origin request. Actual redirect/CORS behavior still requires staging tests.
- Maps adapters remain disabled until separately approved; no live API calls were made during implementation.

## Run local tests / synthetic preview

Use Node 20 or newer:

```sh
npm test
npm run check
npm run preview
```

Preview public form: `http://127.0.0.1:4173/`
Preview admin: `http://127.0.0.1:4173/preview-admin`

The preview binds only to localhost. It uses synthetic identities and an in-memory adapter executing the actual Apps Script source. It is NOT a production authentication server and must never be deployed as one. All Google services and external API responses in these tests are mocked.

Browser tests need Playwright and Chromium installed in the test environment:

```sh
npm run test:ui
```

The runner can resolve Playwright from the provided Codex runtime or a local installation. `MEALS_BROWSER_EXECUTABLE` can select an installed Chromium executable. There are no runtime npm dependencies for the production static site. Browser tests create ignored `.artifacts/` screenshots, JSON results and a synthetic multi-page print PDF.

## Manual installation in the existing Apps Script project

The user authorized replacing the old Apps Script source on October 2. Old implementation compatibility is no longer required. Use [the complete copy/paste installation package](docs/apps-script-installation.md): exact file names, complete file contents, manifest, private configuration, direct ADMINUSERS entries and two NEW web-app deployments. No account email is needed to prepare the package. No spreadsheet data is deleted/imported and main/GitHub Pages remain untouched.

The existing project is `1ZDIqJvXfmu1z2cYhlRfQNPf4ElyoKcVNeaG35NkeblARb6p4KJeOOGDm`. The existing spreadsheet and its six V1 tabs are used. Do not create another project or spreadsheet. ADMINUSERS is the authorization source; manual sheet configuration is preferred and bootstrap Script Properties are unnecessary for this installation. Set MEALS_ALLOW_SCHEMA_SETUP=false because the schema already exists.

Maps-disabled operation now supports explicit confirmed/audited manual review of saved pickup/recipient addresses. Status remains `Manually Reviewed`, distinct from Google's `Confirmed`. Addresses requiring review remain visible and block a final/printable route. Save manual order after all addresses are reviewed. Changes to an address invalidate its prior review. Google validation and optimization remain disabled; no cloud-platform OAuth scope is requested until the later Maps phase.

The complete installation/deployment guide is prepared, but no source was uploaded or Apps Script deployment created. Actual identity checks for both accounts and all live backend tests remain required.

## Authentication failure policy

Current design is deliberately fail-closed. Missing emails or active/effective identity disagreement blocks admin operations. Authentication is NOT complete until both real accounts pass live staging tests.

If execute-as-user cannot identify both accounts reliably, the proposed alternative is Google Identity Services plus a backend verifier using Google's supported authentication library: verify signature, issuer, audience, expiry, verified email and nonce, then apply the server-side allowlist and secure session/CSRF protection. A small separately approved server/gateway would handle verification. Do not decode tokens without verification or use frontend-supplied email, anonymous access, frontend passwords or sessionStorage as authentication. That alternative has not been implemented or substituted automatically.

## Maps configuration — separate approval still required

No billing has been activated. Do not set MEALS_MAPS_LIVE_ENABLED=true yet.

After separate approval, use a dedicated Cloud project linked to the approved Apps Script project without disrupting the production configuration:

1. Link an approved billing account to that Cloud project.
2. Enable Address Validation API (`addressvalidation.googleapis.com`).
3. Enable Route Optimization API (`routeoptimization.googleapis.com`).
4. Restrict the Address Validation key to that API and store it only in `MEALS_ADDRESS_API_KEY` in Script Properties. Never use a browser-referrer-restricted key for server calls or put the server key in config.js.
5. Set `MEALS_CLOUD_PROJECT_ID` to the linked project's ID. Grant both administrators the least-privilege permission needed for `routeoptimization.locations.use`; a suitable custom role can avoid broad project Editor/Owner access. Review service-consumer permissions if required by the project.
6. Configure provider quota controls: initially recommend Address Validation at 60 requests/minute and Optimize Tours at 2 requests/minute; set daily limits if your console exposes them. Do not assume every API offers a daily or dollar-denominated hard cap.
7. Create a $5 monthly budget with 50%, 90%, 100% actual-spend alerts and forecast alerts. These notify; they do not stop spending.
8. Application-enforced hard request limits are implemented: Address Validation 300 calls/day and 3,000/month; optimization 500 shipment units/day and 3,000/month. Counters are reserved before each external call under a short lock, without holding the capacity lock during the call. Failed calls count conservatively. These counters constrain this application, not other projects sharing the billing account, and are not a billing-account dollar cap.
9. Before enabling live calls, approve the program's public privacy/terms wording and provider attribution. Display attribution is included in the admin interface; public policy text requires the program owner's approval.
10. Add https://www.googleapis.com/auth/cloud-platform to the manifest oauthScopes, authorize the new scope and deploy a new test version. Only then set MEALS_MAPS_LIVE_ENABLED=true in DEVELOPMENT and run live tests.

Optimization begins at pickup and has no required end location/return leg. Every approved recipient remains a separate shipment/stop. An unresolved address blocks optimization, not referral submission. The service must return every approved stop exactly once; incomplete/duplicate/skipped results leave the prior order unchanged.

Coordinates returned by Address Validation are transient and are not saved in Sheets, browser storage or audit history. Original submitted addresses and internally generated normalized strings remain in the program records. Optimization revalidates pickup and all approved addresses on each run; this increases validation usage, so a 100-stop optimization uses 101 validation calls plus 100 shipment units. The code uses driving routes, not straight-line heuristics. Large events may approach Apps Script execution-time limits; test expected real volumes before release.

Synthetic invented street addresses are used ONLY in local mocked tests. Google's Address Validation terms prohibit live requests with artificially-created US/PR addresses. For live Maps tests, use approved public civic/building locations with synthetic recipient identities; do not use actual recipient personal records or submit the local invented addresses to Google.

Official references:

- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/reference/lock/lock-service
- https://developers.google.com/workspace/sheets/api/guides/batch
- https://developers.google.com/maps/documentation/address-validation/usage-and-billing
- https://developers.google.com/maps/documentation/route-optimization/usage-and-billing
- https://developers.google.com/maps/documentation/route-optimization/reference/rest/v1/projects/optimizeTours
- https://developers.google.com/maps/documentation/address-validation/policies
- https://cloud.google.com/maps-platform/terms/maps-service-terms

## Data, reporting, migration and release

Six new tabs: EVENTS, REFERRALS, RECIPIENTS, AUDITLOG, ADMINUSERS, SUBMISSIONS. The source of truth for capacity is current recipient MealCount belonging to Pending/Approved referrals. OriginalRequestedMeals is a separate immutable submission snapshot for historical reporting.

Records are updated by durable IDs, with optimistic versions, inside the shared lock. The write batch contains referral/recipient/idempotency/audit changes together. No application deletion is supported. Submitted text is written using Sheets stringValue, never formulaValue; HTML is rendered via textContent/value. Public APIs expose only event summaries and minimal receipts. Audit may contain protected original/edited fields, so keep its spreadsheet private.

Completed/archived events are normally read-only. Explicit confirmed Reopen / Unarchive is audited. Completed reopens to Closed rather than silently accepting public referrals. Unarchiving another status retains that status; the confirmation is explicit. Reports include archived events. Organization grouping uses an exact conservative normalized key, with no fuzzy organization merging.

Delivery Instructions, Dietary Restrictions and Internal Notes remain separate. Internal Notes are admin-only and excluded from the delivery DTO and print DOM. Printed sheets never include organization names or contacts.

`legacyMigrationPlan_` is a read-only dry-run on the configured spreadsheet. It reports existing headers, affected row counts and unresolved mappings without changing data. Legacy records lack events, organizations and meal quantities. Legacy Comments mapping is intentionally unresolved. The actual legacy import is blocked until real source inspection, event/organization/quantity assignment and explicit Comments mapping approval; do not infer meanings or overwrite historical comments.

`config.js` deliberately contains blank endpoints. The existing production backend is never contacted by tests. Production writes are gated by MEALS_ENV=production and MEALS_PRODUCTION_ENABLED=true, neither configured here. That backend deployment and eventual production schema setup require separate release approval after all required staging tests.

GitHub Pages currently builds from main. Do not merge/push this implementation to main until separately authorized. No deployment configuration was changed.
