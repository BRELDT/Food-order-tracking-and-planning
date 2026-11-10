# Community Meals — manual Apps Script installation

This package uses the existing project and spreadsheet. It replaces the old source with the modular V1 backend. It does not delete or migrate Requests/Settings, activate Maps/billing, merge main or publish the frontend. The package's 16 code boxes contain the COMPLETE contents of 12 script files, 3 HTML files and the manifest. Their bytes are checked against apps-script/ by tools/check.mjs. Use the pinned commit URL supplied in the chat; do not mix files from other versions.

Project editor:
https://script.google.com/u/0/home/projects/1ZDIqJvXfmu1z2cYhlRfQNPf4ElyoKcVNeaG35NkeblARb6p4KJeOOGDm/edit

Spreadsheet:
https://docs.google.com/spreadsheets/d/1qqXeHVIi5WMqtXMSIYtB9iuV0gPfy_QdGUgLlv8BD2w/edit

The old deployment is reference only. These instructions create TWO NEW test deployments rather than editing it. Do not point the current GitHub Pages site at them yet.

## A. Replace source and create the modular files

1. Open the project editor link above. Click Editor (the code icon on the left) if needed.
2. Select Code.gs in the Files list. Click inside its code, press Command+A on Mac (Ctrl+A on Windows), and delete its contents. Paste the ENTIRE File 1 Code.gs code box below. Keep the file itself named Code.gs.
3. Next to Files, click +, choose Script, and enter each bare name in this list. Apps Script adds .gs. Paste the matching COMPLETE code box into each file, replacing any starter function it creates:

   Validation, Store, Auth, Audit, Events, Referrals, Duplicates, Reports, Addresses, Routing, Schema.

4. Next to Files, click +, choose HTML, and enter these bare names. Apps Script adds .html. Replace ALL starter contents with the matching complete code box:

   Admin, AdminClient, AdminStyles.

5. AdminClient contains JavaScript only and AdminStyles contains CSS only. They intentionally have no script/style wrappers: Admin.html supplies the wrappers. Do not add wrappers or move their contents into Code.gs.
6. Click Project Settings (gear on the left). Under General settings, check “Show appsscript.json manifest file in editor.” Return to Editor, select appsscript.json, and replace all contents with File 16 below.
7. Click Save project (disk icon), or press Command+S / Ctrl+S. Wait for saving to finish. Confirm all 16 files are present with the exact spelling/capitalization. There must be only one doGet and one doPost; both are in replacement Code.gs.

No old source compatibility is required under the revised authorization. Do not paste any secrets into source. No functions or triggers need scheduling for this V1. If the project has existing installed triggers, report them before proceeding: replacing source does not remove old triggers automatically.

## B. Google Sheets service

1. In Editor, find Services in the left panel beneath Files.
2. The supplied manifest declares Sheets v4. If Sheets already appears under Services, do not add a duplicate.
3. If it does not appear, click + beside Services, select Google Sheets API, choose version v4, keep Identifier Sheets, and click Add.
4. For Apps Script's default Cloud project, the corresponding API is enabled automatically. If Google reports that a custom/standard project's Sheets API is disabled, stop and send the error; we will handle that configuration separately. Do not enable Maps or billing.

## C. Private Script Properties

1. Click Project Settings (gear on the left).
2. Scroll to Script Properties. Click Add script property (or Edit script properties if properties already exist).
3. Add/update these exact keys and values. Preserve unrelated property keys; do not clear the list:

| Property | Exact value |
| --- | --- |
| MEALS_ENV | development |
| MEALS_SPREADSHEET_ID | 1qqXeHVIi5WMqtXMSIYtB9iuV0gPfy_QdGUgLlv8BD2w |
| MEALS_SHARED_SHEET_DEV_ID | 1qqXeHVIi5WMqtXMSIYtB9iuV0gPfy_QdGUgLlv8BD2w |
| MEALS_ALLOW_SCHEMA_SETUP | false |
| MEALS_MAPS_LIVE_ENABLED | false |

4. Click Save script properties.

Do not set MEALS_PRODUCTION_ENABLED=true. No Maps keys, Cloud project ID or bootstrap administrator property is needed for this installation. ADMINUSERS controls access directly.

## D. Enter the two administrators in ADMINUSERS

1. Open the spreadsheet link above and click ADMINUSERS at the bottom.
2. Keep row 1 exactly Email / Active / Role.
3. In row 2, put your actual Google account email in A2, boolean TRUE in B2, and lowercase admin in C2.
4. In row 3, put the community paramedic's actual Google account email in A3, boolean TRUE in B3, and lowercase admin in C3.
5. Enter TRUE directly into the cell, without quotation marks or an apostrophe; Google Sheets should treat it as a boolean. Use lowercase email addresses. Avoid duplicate email rows. If records already exist, review them rather than overwriting them blindly.
6. Both Google accounts must have appropriate access to this spreadsheet for execute-as-user administration. Use the spreadsheet Share button to review access. Keep it restricted. This grants access to legacy tabs too; both administrators must be authorized to see that data. Do not publish the spreadsheet or use Anyone-with-link sharing.

No actual email addresses are built into this package. Removing/deactivating an ADMINUSERS row blocks subsequent protected calls. The backend independently checks the signed-in Google identity and active allowlist for every protected action.

## E. One-time setup and permissions

The six V1 tabs already exist with verified headers. NO schema/migration setup function needs running. Do not run setupDevelopmentSchema_ or legacy migration tooling for this installation.

The public and admin apps read those headers automatically. If a schema mismatch is reported, stop and send the error; do not rename/delete/overwrite tabs.

Google will request authorization for the manifest's scopes:

- View/edit Google spreadsheets (spreadsheets): needed to access the configured spreadsheet and write the atomic batch. This OAuth scope is broader than one spreadsheet; application code targets the configured ID and six V1 tabs.
- See your Google account email (userinfo.email): needed for server-side administrator identification.
- Connect to an external service (script.external_request): retained for the disabled Maps adapters. MEALS_MAPS_LIVE_ENABLED=false blocks those calls. No Maps billing is enabled by granting this scope.

No Gmail sending, Drive-wide access, contacts, payments or cloud-platform scope is requested by this manifest. Exact consent wording may vary. Authorize the required scopes for this project under the correct account. If your organization blocks authorization, or Google asks for unexpected permissions, stop and report the screen. Do not weaken authentication.

The editor helper testAdminIdentity is optional, not a setup action; an editor run cannot prove the other administrator's deployed identity. Both real accounts must be tested through the admin deployment.

## F. NEW authenticated admin test deployment

Do this after source/configuration installation is complete; the chat will guide it one step at a time.

1. At the editor's upper right, click Deploy -> New deployment.
2. Beside Select type, click the gear and choose Web app.
3. Description: DEV TEST - Community Meals Admin.
4. Execute as: User accessing the web app.
5. Who has access: Anyone with Google account (or the appropriate domain option only if BOTH administrators are in that domain). Never choose anonymous access or execute-as-owner for the admin.
6. Click Deploy. If prompted, click Authorize access and select the intended Google account; review and grant the listed permissions. If an unverified-app or organization-policy screen appears, send its exact wording before continuing so we can check the correct project/account.
7. Copy the Web app URL ending /exec and record the Deployment ID. Do not use the old deployed URL, and do not use /dev for these integration tests.
8. Append ?page=admin to this NEW URL and open it while signed into the first administrator account. The header must show that actual account email and development.
9. Repeat in a separate browser profile/session as the second account, including its consent flow. Its own email must appear. A blank/mismatched identity or Access unavailable message means STOP; do not change identity_ or allow anonymous administration.
10. A third non-allowlisted account and an anonymous browser session must not retrieve protected data. Keep these tests NOT YET TESTED until actually performed.

## G. NEW public API test deployment

Only after both admin identity checks pass:

1. Click Deploy -> New deployment -> gear -> Web app.
2. Description: DEV TEST - Community Meals Public API.
3. Execute as: Me (the spreadsheet-authorized owner deploying this project).
4. Who has access: Anyone. This applies ONLY to public event summaries/referral submission. The protected admin application and RPCs still fail closed under an anonymous/owner-identity mismatch.
5. Click Deploy and complete owner authorization if asked. Copy its NEW /exec URL and Deployment ID separately from the admin URL.
6. Open PUBLIC_URL?action=events. The response contains only Open-event summaries. With no events it should contain ok:true and an empty data array. It must not contain recipient/contact lists.
7. If organization policy prohibits anonymous public access, stop and report that restriction. Do not change the admin deployment to work around it.

We will configure a LOCAL development frontend with these URLs next; do not update main or publish over GitHub Pages. The Apps Script backend alone does not publish the static public form. Leave committed config.js endpoints blank until the approved development configuration step.

## H. Synthetic tests and Maps-disabled delivery sheets

Create DEV TEST - Thanksgiving with capacity 20 in the admin Event Settings interface. Use synthetic identities, example.test organization emails and reserved example phone numbers. No real recipient data. Use DEV TEST - Christmas for another event if needed. The six V1 tabs are the only development data store; Requests/Settings are ignored and untouched.

Follow docs/acceptance-tests.md for the 40 acceptance steps and extra security/concurrency/recovery tests. Record live results separately from local passes. Current package: 28 local mocked-backend tests and 10 local Chromium checks pass. Both actual identities, true live concurrency, live atomic failure/recovery, deployed API authorization and actual device behavior remain untested.

Maps remains disabled. Review each SAVED recipient address through Requests -> Edit -> Mark Saved Address Reviewed; explicitly confirm only after checking it. Review the SAVED pickup through Event Settings -> Mark Saved Pickup Reviewed. This is a recorded manual attestation, not Google validation or geocoding. Unsaved address edits are not reviewed. Editing an address clears its review.

Approved stops appear in Delivery Route. Use drag-and-drop or Move Up/Move Down, then Save Manual Order. Stop numbers/running totals update. Print enables only once every saved address is reviewed and the official order is saved. Unresolved addresses stay visible, and Optimize remains disabled. Actual Google validation/optimization and its cloud-platform scope will be enabled only in the separately approved Maps phase.

## Official setup references

- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/services/advanced
- https://developers.google.com/apps-script/concepts/scopes
- https://developers.google.com/apps-script/concepts/deployments

Installation is a manual action by the user. No script source was uploaded or web-app deployment created during package preparation. The old versioned deployment remains at its old code until explicitly edited; none of these instructions edits it.


# Complete file contents

## File 1: Code.gs

SHA-256: 61d2c09a46866cda40bb5b2dfa0d5833f64c4c63a91fdca56cf603a1ba8ed501

Copy only the contents of this code box into the matching Apps Script file.

```javascript
const MEALS_BACKEND_VERSION = "2026-11-06-delivery-pdf-v1";
function include_(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}
function doGet(e) {
  if (e && e.parameter && e.parameter.page === "admin") {
    const auth = safeBoundary_(() => {
      const a = requireAdmin_();
      return a.email;
    });
    if (!auth.ok)
      return HtmlService.createHtmlOutput(
        "<h1>Administrator access unavailable</h1><p>Open the authenticated admin deployment using an approved Google account. If Google cannot identify your account, stop and contact the program administrator.</p>",
      );
    return HtmlService.createTemplateFromFile("Admin")
      .evaluate()
      .setTitle("Community Meals Administration")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }
  const action = e && e.parameter && e.parameter.action;
  if (action === "submissionReceipt")
    return json_(safeBoundary_(() => publicSubmissionReceipt_(e.parameter.submissionId)));
  return json_(
    action === "events"
      ? safeBoundary_(publicEvents_)
      : {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "This public operation is unavailable.",
          },
        },
  );
}
function publicSubmissionReceipt_(submissionId) {
  // Possession of an unguessable submission UUID is required. Return only the
  // same minimal public receipt; never referral/recipient/contact information.
  const id = submissionId_(submissionId);
  const s = load_(), record = s.SUBMISSIONS.find(r => r.SubmissionID === id);
  if (!record) return { receipt: null };
  const referral = submissionReferral_(s, record);
  if (referral.SubmittedByAdmin !== false) return { receipt: null };
  const receipt = savedSubmissionReceipt_(s, record);
  return { receipt: {
    referralId: receipt.referralId, eventName: receipt.eventName,
    meals: receipt.meals, recipients: receipt.recipients, status: "Pending"
  } };
}
function doPost(e) {
  return json_(
    safeBoundary_(() => {
      const raw = e && e.postData && e.postData.contents;
      if (!raw || Utilities.newBlob(raw).getBytes().length > MEAL_LIMITS.bytes)
        fail_("INVALID", "The request is too large. Submit fewer recipients.");
      let p;
      try {
        p = JSON.parse(raw);
      } catch (_) {
        fail_("INVALID", "The request could not be read.");
      }
      if (
        p &&
        ["addressConfig", "addressSuggestions", "addressPreview"].includes(
          p.action,
        )
      )
        return publicAddressCall_(p.action, p);
      if (!p || p.action !== "submit")
        fail_("FORBIDDEN", "This public operation is unavailable.");
      return submit_(p, null);
    }),
  );
}
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function adminCall(action, p) {
  return safeBoundary_(() => {
    // Authorization must happen before dispatch, including every read.
    const auth = requireAdmin_();
    p = p || {};
    if (
      Utilities.newBlob(JSON.stringify(p)).getBytes().length > MEAL_LIMITS.bytes
    )
      fail_("INVALID", "The request is too large.");
    if (action === "addressConfig") return addressFeatures_();
    if (action === "addressSuggestions") return addressSuggestions_(p);
    if (action === "addressPreview") return addressPreview_(p);
    if (action === "publicFormLink") return publicFormLink_();
    if (action === "identity")
      return {
        email: auth.email,
        environment: properties_().getProperty("MEALS_ENV"),
        backendVersion: MEALS_BACKEND_VERSION,
      };
    if (action === "events")
      return auth.state.EVENTS.slice().sort((a, b) =>
        a.DeliveryDate.localeCompare(b.DeliveryDate),
      );
    if (action === "dashboard") return dashboard_(auth.state, p);
    if (action === "route") return route_(auth.state, id_(p.eventId));
    if (action === "deliveryPdf") return deliveryPdf_(auth.state, p);
    if (action === "reports") return reports_(auth.state, p);
    if (action === "createReferral") return submit_(p, auth.email);
    if (action === "submissionReceipt") {
      const record = auth.state.SUBMISSIONS.find(r => r.SubmissionID === submissionId_(p.submissionId));
      if (!record) return { receipt: null };
      const parent = submissionReferral_(auth.state, record);
      return { receipt: parent.SubmittedByAdmin === true ? savedSubmissionReceipt_(auth.state, record) : null };
    }
    if (action === "verifyAddress") return verifyAddress_(p);
    if (action === "optimize") return optimize_(p);
    return locked_((s) => {
      const admin = admin_(s);
      switch (action) {
        case "manualAddressReview":
          return manualAddressReview_(s, p, admin);
        case "saveEvent":
          return eventWrite_(s, p, admin);
        case "archive":
          return archiveWrite_(s, p, admin);
        case "statuses":
          return statuses_(s, p, admin);
        case "editReferral":
          return editReferral_(s, p, admin);
        case "reorder":
          return routeOrder_(s, p, admin, false);
        default:
          fail_("FORBIDDEN", "This administrator operation is unavailable.");
      }
    });
  });
}
function publicFormLink_() {
  const url = String(properties_().getProperty("MEALS_PUBLIC_FORM_URL") || "").trim();
  if (!url)
    fail_("CONFIG", "The public referral website link is not configured yet. Add MEALS_PUBLIC_FORM_URL in Apps Script Script Properties using the public form website URL, not an admin or API URL.");
  if (
    !/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::443)?(?:\/[^\s\\]*)?$/i.test(url) ||
    /[?&](?:page=admin|action=)/i.test(url)
  )
    fail_("CONFIG", "MEALS_PUBLIC_FORM_URL must be an HTTPS public referral website link, not an admin or API URL.");
  return { url };
}
```

## File 2: Validation.gs

SHA-256: cee868dd6061acecbc32f0bafa1d720ec383ff1c98188b619a484884101cecfb

Copy only the contents of this code box into the matching Apps Script file.

```javascript
const MEAL_LIMITS = Object.freeze({
  recipients: 100,
  bytes: 180000,
  text: 1000,
  meals: 10000,
});
function fail_(code, message) {
  const e = new Error(message);
  e.code = code;
  e.clientSafe = true;
  throw e;
}
function text_(value, label, max, required) {
  if (typeof value !== "string" && value != null)
    fail_("INVALID", label + " must be text.");
  const s = String(value == null ? "" : value).trim();
  if (
    (required && !s) ||
    s.length > max ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s)
  )
    fail_("INVALID", "Please check " + label + ".");
  return s;
}
function integer_(v, label, min, max) {
  if (v === "" || v == null || typeof v === "boolean")
    fail_("INVALID", "Please check " + label + ".");
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n < min || n > max)
    fail_("INVALID", "Please check " + label + ".");
  return n;
}
function id_(v) {
  return text_(v, "record ID", 100, true);
}
function submissionId_(v) {
  const id = String(v || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
    fail_("INVALID", "A valid submission ID is required.");
  return id;
}
function uuid_() {
  return Utilities.getUuid();
}
function now_() {
  return new Date().toISOString();
}
function normalize_(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9#]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
function addressKey_(s) {
  return normalize_(s)
    .replace(
      /\b(street|road|avenue|drive|boulevard|lane|court)\b/g,
      (v) =>
        ({
          street: "st",
          road: "rd",
          avenue: "ave",
          drive: "dr",
          boulevard: "blvd",
          lane: "ln",
          court: "ct",
        })[v],
    )
    .replace(/\b(apartment|suite)\b/g, "unit")
    .replace(/\bapt\b/g, "unit")
    .replace(/#\s*/g, "unit ")
    .replace(/\bvirginia\b/g, "va")
    .replace(/\bnorth\b/g, "n")
    .replace(/\bsouth\b/g, "s")
    .replace(/\beast\b/g, "e")
    .replace(/\bwest\b/g, "w");
}
function phoneKey_(s) {
  return String(s || "")
    .replace(/\D/g, "")
    .replace(/^1(?=\d{10}$)/, "");
}
function organization_(p) {
  const name = text_(p.organizationName, "organization name", 160, true);
  const email = text_(p.organizationEmail, "organization email", 254, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail_("INVALID", "Please enter a valid organization email.");
  const phone = text_(p.organizationPhone, "organization phone", 40, true);
  if (phoneKey_(phone).length < 7)
    fail_("INVALID", "Please enter an organization phone number.");
  return {
    OrganizationName: name,
    OrganizationKey: normalize_(name),
    OrganizationEmail: email,
    OrganizationPhone: phone,
  };
}
function recipients_(list, admin) {
  if (
    !Array.isArray(list) ||
    !list.length ||
    list.length > MEAL_LIMITS.recipients
  )
    fail_("INVALID", "Enter between 1 and 100 recipients.");
  return list.map((p) => {
    if (!p || typeof p !== "object")
      fail_("INVALID", "Please check the recipient information.");
    const address = text_(p.address, "street address", 500, true);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
      fail_("INVALID", "Enter the recipient's street address, not an email address.");
    const door = text_(
      p.doorPreference || "Front",
      "door preference",
      20,
      true,
    );
    if (!["Front", "Side", "Back", "Other"].includes(door))
      fail_("INVALID", "Please check the preferred door.");
    if (!admin && p.notes)
      fail_("INVALID", "Internal notes are administrator-only.");
    return {
      RecipientName: text_(p.recipientName, "recipient name", 160, true),
      Address: address,
      NormalizedAddress: addressKey_(address),
      Phone: text_(p.phone, "recipient phone", 40, false),
      MealCount: integer_(p.mealCount, "number of meals", 1, MEAL_LIMITS.meals),
      DietaryRestrictions: text_(
        p.dietaryRestrictions,
        "dietary restrictions",
        500,
        false,
      ),
      DoorPreference: door,
      DeliveryInstructions: text_(
        p.deliveryInstructions,
        "delivery instructions",
        1000,
        false,
      ),
      Notes: admin ? text_(p.notes, "internal notes", 1000, false) : "",
    };
  });
}
function canonicalSubmission_(p, admin) {
  return {
    EventID: id_(p.eventId),
    organization: organization_(p),
    recipients: recipients_(p.recipients, admin),
  };
}
function fingerprint_(v) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify(v),
    Utilities.Charset.UTF_8,
  )
    .map((n) => ("0" + ((n + 256) % 256).toString(16)).slice(-2))
    .join("");
}
function safeBoundary_(fn) {
  try {
    return { ok: true, data: fn() };
  } catch (e) {
    return {
      ok: false,
      error: {
        code: e.clientSafe ? e.code : "UNAVAILABLE",
        message: e.clientSafe
          ? e.message
          : "Your changes were not saved. Please try again.",
      },
    };
  }
}
```

## File 3: Store.gs

SHA-256: e7113abc495c6b736d657536ea3fc33901908760617115ac0badc876a8c7a1b4

Copy only the contents of this code box into the matching Apps Script file.

```javascript
const MEAL_SCHEMA = Object.freeze({
  EVENTS: [
    "EventID",
    "EventName",
    "DeliveryDate",
    "Capacity",
    "StartAddress",
    "Status",
    "Archived",
    "ArchivedDate",
    "CreatedAt",
    "UpdatedAt",
    "Version",
    "RouteVersion",
    "RouteNeedsReview",
    "StartAddressStatus",
  ],
  REFERRALS: [
    "ReferralID",
    "EventID",
    "OrganizationName",
    "OrganizationKey",
    "OrganizationEmail",
    "OrganizationPhone",
    "Status",
    "SubmittedAt",
    "UpdatedAt",
    "SubmittedByAdmin",
    "OriginalRequestedMeals",
    "OriginalRecipientCount",
    "Version",
  ],
  RECIPIENTS: [
    "RecipientID",
    "ReferralID",
    "EventID",
    "RecipientName",
    "Address",
    "NormalizedAddress",
    "Phone",
    "MealCount",
    "DietaryRestrictions",
    "DoorPreference",
    "DeliveryInstructions",
    "Notes",
    "DuplicateFlag",
    "RoutePosition",
    "CreatedAt",
    "UpdatedAt",
    "Version",
    "AddressStatus",
    "VerifiedAt",
  ],
  AUDITLOG: [
    "AuditID",
    "Timestamp",
    "Admin",
    "Action",
    "EntityType",
    "EntityID",
    "OldValue",
    "NewValue",
  ],
  ADMINUSERS: ["Email", "Active", "Role"],
  SUBMISSIONS: [
    "SubmissionID",
    "Fingerprint",
    "ReferralID",
    "Receipt",
    "CreatedAt",
  ],
});
const ID_FIELDS = {
  EVENTS: "EventID",
  REFERRALS: "ReferralID",
  RECIPIENTS: "RecipientID",
  AUDITLOG: "AuditID",
  ADMINUSERS: "Email",
  SUBMISSIONS: "SubmissionID",
};
function properties_() {
  return PropertiesService.getScriptProperties();
}
function database_() {
  const p = properties_();
  const id = p.getProperty("MEALS_SPREADSHEET_ID");
  if (!id) fail_("CONFIG", "The meal program is not configured yet.");
  const env = p.getProperty("MEALS_ENV");
  if (!["development", "production"].includes(env))
    fail_("CONFIG", "Set the backend environment before use.");
  if (
    env === "production" &&
    p.getProperty("MEALS_PRODUCTION_ENABLED") !== "true"
  )
    fail_("CONFIG", "Production writes have not been enabled.");
  if (
    env === "development" &&
    id === "1qqXeHVIi5WMqtXMSIYtB9iuV0gPfy_QdGUgLlv8BD2w" &&
    p.getProperty("MEALS_SHARED_SHEET_DEV_ID") !== id
  )
    fail_(
      "CONFIG",
      "Shared-spreadsheet development requires explicit backend configuration.",
    );
  return SpreadsheetApp.openById(id);
}
function load_() {
  const db = database_();
  const state = {};
  const meta = {};
  Object.keys(MEAL_SCHEMA).forEach((name) => {
    const sheet = db.getSheetByName(name);
    if (!sheet) fail_("SCHEMA", "Backend setup is incomplete.");
    const headers = MEAL_SCHEMA[name];
    const raw = sheet
      .getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length)
      .getValues();
    if (JSON.stringify(raw[0]) !== JSON.stringify(headers))
      fail_(
        "SCHEMA",
        "Schema mismatch in " + name + ". No changes were saved.",
      );
    const used = new Set();
    const rows = [];
    const positions = {};
    raw.slice(1).forEach((r, i) => {
      if (r.every((v) => v === "")) return;
      const obj = {};
      headers.forEach((h, j) => (obj[h] = r[j]));
      const key = String(obj[ID_FIELDS[name]]);
      if (!key || used.has(key))
        fail_("SCHEMA", "Invalid or duplicate permanent ID in " + name + ".");
      used.add(key);
      rows.push(obj);
      positions[key] = i + 1;
    });
    state[name] = rows;
    meta[name] = {
      sheetId: sheet.getSheetId(),
      positions,
      lastRow: raw.length,
      original: JSON.stringify(rows),
    };
  });
  Object.defineProperty(state, "_meta", { value: meta });
  Object.defineProperty(state, "_db", { value: db.getId() });
  return state;
}
function cell_(v) {
  if (typeof v === "number") return { userEnteredValue: { numberValue: v } };
  if (typeof v === "boolean") return { userEnteredValue: { boolValue: v } };
  return { userEnteredValue: { stringValue: String(v == null ? "" : v) } };
}
// Historical orphan rows are preserved. Only correctly linked recipients are
// included in referral accounting; administrators see the excluded totals.
function linkedRecipients_(s) {
  const events = new Set(s.EVENTS.map(e => e.EventID));
  const parents = new Map(s.REFERRALS.map(r => [r.ReferralID, r]));
  return s.RECIPIENTS.filter(r => {
    const parent = parents.get(r.ReferralID);
    return parent && parent.EventID === r.EventID && events.has(r.EventID);
  });
}
function relationshipIssues_(s, eventIds) {
  const ids = new Set(eventIds);
  const linked = new Set(linkedRecipients_(s).map(r => r.RecipientID));
  const excluded = s.RECIPIENTS.filter(r => ids.has(r.EventID) && !linked.has(r.RecipientID));
  const affected = new Set(excluded.map(r => r.ReferralID));
  return {
    recipientRecords: excluded.length,
    mealQuantities: excluded.reduce((n, r) => n + (Number(r.MealCount) || 0), 0),
    submissionRecords: s.SUBMISSIONS.filter(r => affected.has(r.ReferralID)).length,
  };
}
function submissionReferral_(s, record) {
  const parent = s.REFERRALS.find(r => r.ReferralID === record.ReferralID);
  const children = s.RECIPIENTS.filter(r => r.ReferralID === record.ReferralID);
  if (!parent || !s.EVENTS.some(e => e.EventID === parent.EventID) ||
      !["Pending", "Approved", "Rejected"].includes(parent.Status) ||
      !children.length || children.length !== Number(parent.OriginalRecipientCount) ||
      children.some(r => r.EventID !== parent.EventID ||
        !Number.isSafeInteger(Number(r.MealCount)) || Number(r.MealCount) < 1))
    fail_("INTEGRITY", "This saved request needs administrator review. Please contact the meal program before submitting it again.");
  return parent;
}
function savedSubmissionReceipt_(s, record) {
  const parent = submissionReferral_(s, record);
  let receipt;
  try { receipt = JSON.parse(record.Receipt); } catch (_) {}
  if (!receipt || receipt.referralId !== parent.ReferralID ||
      receipt.meals !== Number(parent.OriginalRequestedMeals) ||
      receipt.recipients !== Number(parent.OriginalRecipientCount) ||
      typeof receipt.eventName !== "string" || receipt.status !== "Pending")
    fail_("INTEGRITY", "This saved request needs administrator review. Please contact the meal program before submitting it again.");
  return receipt;
}
function commit_(s) {
  const requests = [];
  Object.keys(MEAL_SCHEMA).forEach((name) => {
    const m = s._meta[name];
    const previous = JSON.parse(m.original);
    const originals = new Map(
      previous.map((r) => [String(r[ID_FIELDS[name]]), r]),
    );
    const added = [];
    s[name].forEach((row) => {
      const key = String(row[ID_FIELDS[name]]);
      const old = originals.get(key);
      // Reject newly introduced broken relationships without modifying or
      // blocking unchanged historical orphan rows during normal operations.
      if (name === "RECIPIENTS" && (!old || old.ReferralID !== row.ReferralID || old.EventID !== row.EventID)) {
        const parent = s.REFERRALS.find(r => r.ReferralID === row.ReferralID);
        if (!parent || parent.EventID !== row.EventID || !s.EVENTS.some(e => e.EventID === row.EventID))
          fail_("INTEGRITY", "Recipient records must belong to a saved referral and meal event.");
      }
      if (name === "REFERRALS" && (!old || old.EventID !== row.EventID) &&
          !s.EVENTS.some(e => e.EventID === row.EventID))
        fail_("INTEGRITY", "Referral records must belong to a saved meal event.");
      if (name === "SUBMISSIONS" && (!old || old.ReferralID !== row.ReferralID))
        savedSubmissionReceipt_(s, row);
      if (!old) added.push(row);
      else {
        originals.delete(key);
        if (JSON.stringify(row) !== JSON.stringify(old))
          requests.push({
            updateCells: {
              range: {
                sheetId: m.sheetId,
                startRowIndex: m.positions[key],
                endRowIndex: m.positions[key] + 1,
                startColumnIndex: 0,
                endColumnIndex: MEAL_SCHEMA[name].length,
              },
              rows: [{ values: MEAL_SCHEMA[name].map((h) => cell_(row[h])) }],
              fields: "userEnteredValue",
            },
          });
      }
    });
    if (originals.size) fail_("INTEGRITY", "Record deletion is not supported.");
    if (added.length)
      requests.push({
        appendCells: {
          sheetId: m.sheetId,
          rows: added.map((row) => ({
            values: MEAL_SCHEMA[name].map((h) => cell_(row[h])),
          })),
          fields: "userEnteredValue",
        },
      });
  });
  if (requests.length) Sheets.Spreadsheets.batchUpdate({ requests }, s._db);
}
function locked_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000))
    fail_(
      "BUSY",
      "The system is busy. Please try again using the same submission.",
    );
  try {
    const s = load_();
    const value = fn(s);
    commit_(s);
    return value;
  } finally {
    lock.releaseLock();
  }
}
function byId_(s, name, id) {
  const row = s[name].find((r) => String(r[ID_FIELDS[name]]) === String(id));
  if (!row) fail_("NOT_FOUND", "That record could not be found.");
  return row;
}
function version_(row, v) {
  if (Number(row.Version) !== Number(v))
    fail_(
      "CONFLICT",
      "This record changed since you opened it. Refresh before saving.",
    );
}
function touch_(row) {
  row.Version = Number(row.Version) + 1;
  row.UpdatedAt = now_();
}
```

## File 4: Auth.gs

SHA-256: 0fb501f112d22555e6f572792428466975a50bb5cb43ef6aeb5fd47d42602b02

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function identity_() {
  const active = String(Session.getActiveUser().getEmail() || "").toLowerCase();
  const effective = String(
    Session.getEffectiveUser().getEmail() || "",
  ).toLowerCase();
  if (!active || active !== effective)
    fail_(
      "AUTH",
      "Sign in through the authenticated administrator application. Your Google identity could not be verified.",
    );
  return active;
}
function admin_(s) {
  const email = identity_();
  if (
    !s.ADMINUSERS.some(
      (r) =>
        String(r.Email).toLowerCase() === email &&
        (r.Active === true || r.Active === "true") &&
        r.Role === "admin",
    )
  )
    fail_("FORBIDDEN", "This Google account is not an approved administrator.");
  return email;
}
function requireAdmin_() {
  const email = identity_();
  const s = load_();
  admin_(s);
  return { email, state: s };
}
function testAdminIdentity() {
  return safeBoundary_(() => {
    const a = requireAdmin_();
    return {
      email: a.email,
      environment: properties_().getProperty("MEALS_ENV"),
      authorized: true,
    };
  });
}
```

## File 5: Audit.gs

SHA-256: 806c6adce23eacae6eb9c5665389d98713b3f117a8412dd3b9f0949a0023d22d

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function audit_(s, admin, action, type, id, oldValue, newValue) {
  // Keep operational history without copying private contact details, dietary
  // information or internal notes into a second long-lived record.
  const summary = value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const keys = type === "Recipient"
      ? ["MealCount", "AddressStatus", "DuplicateFlag", "RoutePosition", "Version"]
      : type === "Referral"
        ? ["Status", "meals", "recipients", "Version"]
        : type === "Event"
          ? ["EventName", "DeliveryDate", "Capacity", "Status", "Archived"]
          : [];
    return Object.fromEntries(keys.filter(k => Object.prototype.hasOwnProperty.call(value, k))
      .map(k => [k, value[k]]));
  };
  s.AUDITLOG.push({
    AuditID: uuid_(),
    Timestamp: now_(),
    Admin: admin,
    Action: action,
    EntityType: type,
    EntityID: id,
    OldValue: JSON.stringify(oldValue == null ? null : summary(oldValue)),
    NewValue: JSON.stringify(newValue == null ? null : summary(newValue)),
  });
}
```

## File 6: Events.gs

SHA-256: 651076f5d57f394be25e6e1137c06ac3e77c58c5461b59eeabb0b24538e1db81

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function reserved_(s, eventId) {
  const active = new Set(
    s.REFERRALS.filter(
      (r) =>
        r.EventID === eventId && ["Pending", "Approved"].includes(r.Status),
    ).map((r) => r.ReferralID),
  );
  return linkedRecipients_(s).filter((r) => r.EventID === eventId && active.has(r.ReferralID)).reduce(
    (n, r) => n + Number(r.MealCount),
    0,
  );
}
function available_(s, e) {
  return Number(e.Capacity) - reserved_(s, e.EventID);
}
function editable_(e) {
  if (e.Archived === true || e.Status === "Completed")
    fail_("READ_ONLY", "Reopen or unarchive this event before making changes.");
}
function routeDirty_(e) {
  e.RouteVersion = Number(e.RouteVersion) + 1;
  e.RouteNeedsReview = true;
}
function eventInput_(p) {
  const date = text_(p.deliveryDate, "delivery date", 10, true);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    new Date(date + "T12:00:00Z").toISOString().slice(0, 10) !== date
  )
    fail_("INVALID", "Please check the delivery date.");
  const status = p.status || "Draft";
  if (!["Draft", "Open", "Closed", "Completed"].includes(status))
    fail_("INVALID", "Please check event status.");
  const capacity = integer_(p.capacity, "meal capacity", 0, 100000);
  const startAddress = text_(p.startAddress, "pickup address", 500, status === "Open");
  if (status === "Open" && capacity < 1)
    fail_("INVALID", "Set a positive meal capacity before opening referrals.");
  return {
    EventName: text_(p.eventName, "event name", 160, true),
    DeliveryDate: date,
    Capacity: capacity,
    StartAddress: startAddress,
    Status: status,
  };
}
function eventWrite_(s, p, admin) {
  const input = eventInput_(p);
  if (!p.eventId) {
    const creationId = p.creationId ? submissionId_(p.creationId) : uuid_();
    const prior = s.EVENTS.find(e => e.EventID === creationId);
    if (prior) {
      if (Object.keys(input).some(k => input[k] !== prior[k]))
        fail_("IDEMPOTENCY", "This event creation was already saved with different settings. Refresh the event list before continuing.");
      return prior;
    }
    const e = Object.assign(input, {
      EventID: creationId,
      Archived: false,
      ArchivedDate: "",
      CreatedAt: now_(),
      UpdatedAt: now_(),
      Version: 1,
      RouteVersion: 1,
      RouteNeedsReview: true,
      StartAddressStatus: addressProofStatus_(
        input.StartAddress,
        p.addressReceipt,
      ),
    });
    s.EVENTS.push(e);
    audit_(s, admin, "Event Created", "Event", e.EventID, null, input);
    return e;
  }
  const e = byId_(s, "EVENTS", p.eventId);
  editable_(e);
  version_(e, p.version);
  const reserved = reserved_(s, e.EventID);
  if (input.Capacity < reserved)
    fail_(
      "CAPACITY",
      "Capacity cannot be reduced below the " +
        reserved +
        " meals already reserved.",
    );
  const old = {
    EventName: e.EventName,
    DeliveryDate: e.DeliveryDate,
    Capacity: e.Capacity,
    StartAddress: e.StartAddress,
    Status: e.Status,
  };
  if (input.StartAddress !== e.StartAddress) {
    e.StartAddressStatus = "Needs Review";
    routeDirty_(e);
  }
  if (p.addressReceipt) {
    e.StartAddressStatus = addressProofStatus_(
      input.StartAddress,
      p.addressReceipt,
    );
    routeDirty_(e);
  }
  Object.assign(e, input);
  touch_(e);
  audit_(
    s,
    admin,
    old.Capacity !== e.Capacity ? "Capacity Changed" : "Event Edited",
    "Event",
    e.EventID,
    old,
    input,
  );
  return e;
}
function archiveWrite_(s, p, admin) {
  const e = byId_(s, "EVENTS", p.eventId);
  version_(e, p.version);
  if (p.confirmed !== true)
    fail_("CONFIRM", "Confirm this event action first.");
  const old = { Status: e.Status, Archived: e.Archived };
  if (p.mode === "archive") {
    e.Archived = true;
    e.ArchivedDate = now_();
  } else if (p.mode === "reopen") {
    e.Archived = false;
    e.ArchivedDate = "";
    if (e.Status === "Completed") e.Status = "Closed";
  } else fail_("INVALID", "Unknown event action.");
  touch_(e);
  audit_(
    s,
    admin,
    p.mode === "archive" ? "Event Archived" : "Event Reopened / Unarchived",
    "Event",
    e.EventID,
    old,
    { Status: e.Status, Archived: e.Archived },
  );
  return e;
}
function acceptsPublicReferrals_(e) {
  return e.Status === "Open" && e.Archived !== true &&
    e.DeliveryDate >= Utilities.formatDate(new Date(), "America/New_York", "yyyy-MM-dd");
}
function publicEvents_() {
  const s = load_();
  return s.EVENTS.filter(acceptsPublicReferrals_)
    .map((e) => ({
      eventId: e.EventID,
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      remaining: available_(s, e),
    }))
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
}
```

## File 7: Referrals.gs

SHA-256: 544f1b087edd09c075297ee7c1105281f3a444c5a0e271ac2b12020bbed7ec2d

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function referralMeals_(s, id) {
  return linkedRecipients_(s).filter((r) => r.ReferralID === id).reduce(
    (n, r) => n + Number(r.MealCount),
    0,
  );
}
function submit_(p, adminEmail) {
  const canonical = canonicalSubmission_(p, Boolean(adminEmail)),
    submissionId = submissionId_(p.submissionId),
    hash = fingerprint_(canonical);
  return locked_((s) => {
    if (adminEmail) {
      if (admin_(s) !== adminEmail)
        fail_("AUTH", "Administrator identity changed.");
    }
    const prior = s.SUBMISSIONS.find((r) => r.SubmissionID === submissionId);
    if (prior) {
      if (prior.Fingerprint !== hash)
        fail_(
          "IDEMPOTENCY",
          "This submission ID was already used with different information.",
        );
      return savedSubmissionReceipt_(s, prior);
    }
    const e = byId_(s, "EVENTS", canonical.EventID);
    if (adminEmail) editable_(e);
    else if (!acceptsPublicReferrals_(e))
      fail_("CLOSED", "This event is no longer accepting requests.");
    const meals = canonical.recipients.reduce((n, r) => n + r.MealCount, 0),
      left = available_(s, e);
    if (meals > left)
      fail_(
        "CAPACITY",
        "Only " +
          left +
          " meals remain for this event. Please reduce the request before submitting.",
      );
    const referral = Object.assign(canonical.organization, {
      ReferralID: uuid_(),
      EventID: e.EventID,
      Status: "Pending",
      SubmittedAt: now_(),
      UpdatedAt: now_(),
      SubmittedByAdmin: Boolean(adminEmail),
      OriginalRequestedMeals: meals,
      OriginalRecipientCount: canonical.recipients.length,
      Version: 1,
    });
    s.REFERRALS.push(referral);
    canonical.recipients.forEach((r, i) =>
      s.RECIPIENTS.push(
        Object.assign(r, {
          RecipientID: uuid_(),
          ReferralID: referral.ReferralID,
          EventID: e.EventID,
          DuplicateFlag: false,
          RoutePosition: "",
          CreatedAt: now_(),
          UpdatedAt: now_(),
          Version: 1,
          AddressStatus: addressProofStatus_(
            r.Address,
            p.recipients[i].addressReceipt,
          ),
          VerifiedAt:
            addressProofStatus_(r.Address, p.recipients[i].addressReceipt) ===
            "Confirmed"
              ? now_()
              : "",
        }),
      ),
    );
    refreshDuplicates_(s, e.EventID);
    const receipt = {
      referralId: referral.ReferralID,
      eventName: e.EventName,
      meals,
      recipients: canonical.recipients.length,
      status: "Pending",
    };
    s.SUBMISSIONS.push({
      SubmissionID: submissionId,
      Fingerprint: hash,
      ReferralID: referral.ReferralID,
      Receipt: JSON.stringify(receipt),
      CreatedAt: now_(),
    });
    if (adminEmail)
      audit_(
        s,
        adminEmail,
        "Referral Created",
        "Referral",
        referral.ReferralID,
        null,
        { meals, recipients: canonical.recipients.length },
      );
    return receipt;
  });
}
function statuses_(s, p, admin) {
  if (!["Pending", "Approved", "Rejected"].includes(p.status))
    fail_("INVALID", "Please check referral status.");
  if (
    !Array.isArray(p.referrals) ||
    !p.referrals.length ||
    p.referrals.length > 200
  )
    fail_("INVALID", "Select up to 200 referrals.");
  const seen = new Set();
  const rows = p.referrals.map((x) => {
    const id = id_(x.referralId);
    if (seen.has(id)) fail_("INVALID", "Select each referral once.");
    seen.add(id);
    const r = byId_(s, "REFERRALS", id);
    version_(r, x.version);
    editable_(byId_(s, "EVENTS", r.EventID));
    return r;
  });
  const needed = {};
  rows.forEach((r) => {
    if (r.Status === "Rejected" && p.status !== "Rejected")
      needed[r.EventID] =
        (needed[r.EventID] || 0) + referralMeals_(s, r.ReferralID);
  });
  Object.keys(needed).forEach((id) => {
    if (needed[id] > available_(s, byId_(s, "EVENTS", id)))
      fail_(
        "CAPACITY",
        "There are not enough meals available to restore the selected referrals.",
      );
  });
  rows.forEach((r) => {
    const old = r.Status;
    if (old === p.status) return;
    r.Status = p.status;
    touch_(r);
    const e = byId_(s, "EVENTS", r.EventID);
    if (old === "Approved" || p.status === "Approved") routeDirty_(e);
    audit_(
      s,
      admin,
      "Referral " + (p.status === "Pending" ? "Returned to Pending" : p.status),
      "Referral",
      r.ReferralID,
      old,
      p.status,
    );
  });
  return { updated: rows.length };
}
function editReferral_(s, p, admin) {
  const r = byId_(s, "REFERRALS", p.referralId),
    e = byId_(s, "EVENTS", r.EventID);
  editable_(e);
  version_(r, p.version);
  const org = organization_(p),
    input = recipients_(p.recipients, true),
    existing = s.RECIPIENTS.filter((x) => x.ReferralID === r.ReferralID);
  if (p.recipients.length !== existing.length)
    fail_(
      "INVALID",
      "Use Add Referral to create additional recipient records. Existing recipients cannot be removed.",
    );
  const unique = new Set();
  p.recipients.forEach((x) => {
    const old = existing.find((y) => y.RecipientID === x.recipientId);
    if (!old || unique.has(x.recipientId))
      fail_("INVALID", "Recipient IDs do not match this referral.");
    unique.add(x.recipientId);
    version_(old, x.version);
  });
  const oldMeals = referralMeals_(s, r.ReferralID),
    newMeals = input.reduce((n, x) => n + x.MealCount, 0);
  if (
    ["Pending", "Approved"].includes(r.Status) &&
    newMeals - oldMeals > available_(s, e)
  )
    fail_("CAPACITY", "There are not enough meals available for this edit.");
  const oldOrg = {
    OrganizationName: r.OrganizationName,
    OrganizationEmail: r.OrganizationEmail,
    OrganizationPhone: r.OrganizationPhone,
  };
  Object.assign(r, org);
  touch_(r);
  audit_(s, admin, "Referral Edited", "Referral", r.ReferralID, oldOrg, org);
  input.forEach((x, i) => {
    const old = existing.find(
      (y) => y.RecipientID === p.recipients[i].recipientId,
    );
    const previous = Object.assign({}, old);
    if (old.Address !== x.Address) {
      old.AddressStatus = "Needs Review";
      old.VerifiedAt = "";
    }
    if (p.recipients[i].addressReceipt) {
      old.AddressStatus = addressProofStatus_(
        x.Address,
        p.recipients[i].addressReceipt,
      );
      old.VerifiedAt = old.AddressStatus === "Confirmed" ? now_() : "";
    }
    Object.assign(old, x);
    touch_(old);
    audit_(
      s,
      admin,
      "Recipient Edited",
      "Recipient",
      old.RecipientID,
      previous,
      old,
    );
  });
  if (r.Status === "Approved") routeDirty_(e);
  refreshDuplicates_(s, e.EventID);
  return { referralId: r.ReferralID };
}
```

## File 8: Duplicates.gs

SHA-256: e10adcfc3b606cc89a3e5cc0ef09332f40aa1703ffa30d9109ff569301210471

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function similarAddress_(a, b) {
  if (a === b) return Boolean(a);
  const numberA = a.match(/^\d+\w?\b/),
    numberB = b.match(/^\d+\w?\b/);
  if (!numberA || !numberB || numberA[0] !== numberB[0]) return false;
  const unitA = (a.match(/\bunit\s+(\w+)/) || [])[1] || "",
    unitB = (b.match(/\bunit\s+(\w+)/) || [])[1] || "";
  if (unitA !== unitB) return false;
  const first = new Set(a.split(" ")),
    second = new Set(b.split(" "));
  const common = [...first].filter((x) => second.has(x)).length;
  return common / Math.max(first.size, second.size) >= 0.85;
}
function duplicateMatches_(a, b) {
  if (a.RecipientID === b.RecipientID || a.EventID !== b.EventID) return false;
  const address = addressKey_(a.Address),
    other = addressKey_(b.Address);
  const name = normalize_(a.RecipientName) === normalize_(b.RecipientName);
  const phone = phoneKey_(a.Phone);
  // Read the complete unit token before address normalization removes hyphens.
  // Otherwise QA-1 and QA-2 both become unit "qa" in the fuzzy comparison.
  const unit = (value) => {
    const match = String(value || "").match(/(?:\b(?:unit|apt\.?|apartment|suite)\s*|#\s*)([a-z0-9]+(?:[-/][a-z0-9]+)*)/i);
    return match ? normalize_(match[1]) : "";
  };
  const unitsMatch = unit(a.Address) === unit(b.Address);
  return Boolean(
    (address && unitsMatch && similarAddress_(address, other)) ||
    (name && phone && phone === phoneKey_(b.Phone)),
  );
}
function refreshDuplicates_(s, eventId) {
  const rows = linkedRecipients_(s).filter((r) => r.EventID === eventId);
  rows.forEach(
    (a) => (a.DuplicateFlag = rows.some((b) => duplicateMatches_(a, b))),
  );
}
function matchesFor_(s, r) {
  return linkedRecipients_(s).filter((b) => duplicateMatches_(r, b)).map((b) => ({
    recipientId: b.RecipientID,
    referralId: b.ReferralID,
    recipientName: b.RecipientName,
    address: b.Address,
  }));
}
```

## File 9: Reports.gs

SHA-256: 8db2098acb16face56115f17624c3f60bba27f30849df23d4850d277c3d9978f

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function reports_(s, p) {
  const events = s.EVENTS.filter(
    (e) =>
      (!p.eventId || e.EventID === p.eventId) &&
      (!p.year || e.DeliveryDate.slice(0, 4) === String(p.year)),
  );
  const ids = new Set(events.map((e) => e.EventID)),
    refs = s.REFERRALS.filter((r) => ids.has(r.EventID));
  const rows = linkedRecipients_(s).filter((r) => ids.has(r.EventID));
  const totals = {
    events: events.length,
    originallyRequestedMeals: refs.reduce(
      (n, r) => n + Number(r.OriginalRequestedMeals),
      0,
    ),
    currentlyReservedMeals: 0,
    approvedMeals: 0,
    rejectedMeals: 0,
    recipientRecords: rows.length,
    approvedStops: 0,
    organizations: 0,
    capacity: events.reduce((n, e) => n + Number(e.Capacity), 0),
    pendingReferrals: refs.filter(r => r.Status === "Pending").length,
    approvedReferrals: refs.filter(r => r.Status === "Approved").length,
    rejectedReferrals: refs.filter(r => r.Status === "Rejected").length,
  };
  const organizations = Object.create(null);
  refs.forEach((r) => {
    const meals = referralMeals_(s, r.ReferralID);
    if (["Pending", "Approved"].includes(r.Status)) totals.currentlyReservedMeals += meals;
    if (r.Status === "Approved") {
      totals.approvedMeals += meals;
      totals.approvedStops += rows.filter(
        (x) => x.ReferralID === r.ReferralID,
      ).length;
    }
    if (r.Status === "Rejected") totals.rejectedMeals += meals;
    const key = r.OrganizationKey;
    if (!organizations[key])
      organizations[key] = {
        name: r.OrganizationName,
        referrals: 0,
        originallyRequestedMeals: 0,
        currentMeals: 0,
      };
    organizations[key].referrals++;
    organizations[key].originallyRequestedMeals += Number(
      r.OriginalRequestedMeals,
    );
    organizations[key].currentMeals += meals;
  });
  totals.organizations = Object.keys(organizations).length;
  totals.remainingCapacity = totals.capacity - totals.currentlyReservedMeals;
  return {
    totals,
    integrity: relationshipIssues_(s, [...ids]),
    organizations: Object.values(organizations).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}
function dashboard_(s, p) {
  const e = byId_(s, "EVENTS", p.eventId),
    refs = s.REFERRALS.filter((r) => r.EventID === e.EventID),
    recipients = s.RECIPIENTS.filter((r) => r.EventID === e.EventID);
  return {
    event: e,
    integrity: relationshipIssues_(s, [e.EventID]),
    capacity: Number(e.Capacity),
    reserved: reserved_(s, e.EventID),
    available: available_(s, e),
    pendingReferrals: refs.filter((r) => r.Status === "Pending").length,
    approvedReferrals: refs.filter((r) => r.Status === "Approved").length,
    deliveryStops: recipients.filter((x) =>
      refs.some(
        (r) => r.ReferralID === x.ReferralID && r.Status === "Approved",
      ),
    ).length,
    referrals: refs.map((r) =>
      Object.assign({}, r, {
        meals: referralMeals_(s, r.ReferralID),
        recipients: recipients
          .filter((x) => x.ReferralID === r.ReferralID)
          .map((x) => Object.assign({}, x, { matches: matchesFor_(s, x) })),
      }),
    ),
  };
}
```

## File 10: Addresses.gs

SHA-256: 2d6672082cde4745b5332918814335f685b360f662d914588b19ae7fe2cf6acf

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function mapsEnabled_() {
  if (properties_().getProperty("MEALS_MAPS_LIVE_ENABLED") !== "true")
    fail_(
      "API_DISABLED",
      "Live Maps APIs are disabled. Separate billing/API approval and configuration are required.",
    );
}
function addressLookup_(address) {
  mapsEnabled_();
  const key = properties_().getProperty("MEALS_ADDRESS_API_KEY");
  if (!key) fail_("CONFIG", "Address Validation is not configured.");
  mapsUsage_("validation", 1);
  const response = UrlFetchApp.fetch(
    "https://addressvalidation.googleapis.com/v1:validateAddress",
    {
      method: "post",
      contentType: "application/json",
      headers: { "X-Goog-Api-Key": key },
      payload: JSON.stringify({
        address: { regionCode: "US", addressLines: [address] },
      }),
      muteHttpExceptions: true,
    },
  );
  if (response.getResponseCode() !== 200)
    fail_("MAPS", "This address could not be confirmed. Please review it.");
  const result = JSON.parse(response.getContentText()).result || {},
    v = result.verdict || {},
    geo = result.geocode || {};
  const confirmed =
    v.addressComplete === true &&
    !v.hasUnconfirmedComponents &&
    !v.hasInferredComponents &&
    !v.hasReplacedComponents &&
    ["PREMISE", "SUB_PREMISE"].includes(v.validationGranularity) &&
    geo.location;
  return {
    confirmed: Boolean(confirmed),
    latitude: confirmed ? geo.location.latitude : "",
    longitude: confirmed ? geo.location.longitude : "",
  };
}
function verifyAddress_(p) {
  const a = requireAdmin_(),
    isStart = p.entity === "event",
    r = byId_(
      a.state,
      isStart ? "EVENTS" : "RECIPIENTS",
      isStart ? p.eventId : p.recipientId,
    ),
    e = isStart ? r : byId_(a.state, "EVENTS", r.EventID);
  editable_(e);
  version_(r, p.version);
  const address = isStart ? r.StartAddress : r.Address;
  const lookup = addressLookup_(address);
  return locked_((s) => {
    const admin = admin_(s),
      row = byId_(
        s,
        isStart ? "EVENTS" : "RECIPIENTS",
        isStart ? p.eventId : p.recipientId,
      ),
      event = isStart ? row : byId_(s, "EVENTS", row.EventID);
    editable_(event);
    version_(row, p.version);
    const old = isStart ? row.StartAddressStatus : row.AddressStatus;
    if (isStart) {
      row.StartAddressStatus = lookup.confirmed ? "Confirmed" : "Needs Review";
    } else {
      row.AddressStatus = lookup.confirmed ? "Confirmed" : "Needs Review";
      row.VerifiedAt = now_();
    }
    touch_(row);
    routeDirty_(event);
    audit_(
      s,
      admin,
      "Address Reviewed",
      isStart ? "Event" : "Recipient",
      isStart ? row.EventID : row.RecipientID,
      old,
      lookup.confirmed ? "Confirmed" : "Needs Review",
    );
    return {
      confirmed: lookup.confirmed,
      message: lookup.confirmed ? "Address confirmed." : "Address Needs Review",
    };
  });
}
// Reserve usage before the external call; failed calls count conservatively.
// No names, addresses or credentials are included in counters.
// Address budgets use Pacific calendar dates. Keep existing counters on installation.
// Application limits do not cap calls made outside this Apps Script project.
function mapsUsage_(kind, units) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000))
    fail_("BUSY", "The system is busy. Try again shortly.");
  try {
    const p = properties_(),
      date = Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd"),
      month = date.slice(0, 7);
    let daily, monthly;
    try {
      daily = JSON.parse(p.getProperty("MEALS_MAPS_USAGE_DAY") || "{}");
      monthly = JSON.parse(p.getProperty("MEALS_MAPS_USAGE_MONTH") || "{}");
    } catch (_) {
      fail_("CONFIG", "Maps usage counters need administrator review.");
    }
    if (daily.date !== date) daily = { date, validation: 0, optimization: 0 };
    if (monthly.month !== month)
      monthly = { month, validation: 0, optimization: 0 };
    const dailyLimit =
        kind === "autocomplete" ? 1500 : kind === "validation" ? 800 : 500,
      monthLimit = kind === "autocomplete" ? 10000 : kind === "validation" ? 800 : 3000;
    if (
      (daily[kind] || 0) + units > dailyLimit ||
      (monthly[kind] || 0) + units > monthLimit
    )
      fail_(
        "API_QUOTA",
        "The configured Maps usage limit has been reached. No additional API call was made.",
      );
    if (kind !== "optimization") {
      const minuteKey = Math.floor(Date.now() / 60000);
      let minute;
      try {
        minute = JSON.parse(
          p.getProperty("MEALS_ADDRESS_USAGE_MINUTE") || "{}",
        );
      } catch (_) {
        fail_("CONFIG", "Address usage counters need administrator review.");
      }
      if (minute.time !== minuteKey) minute = { time: minuteKey };
      if ((minute[kind] || 0) + units > (kind === "autocomplete" ? 60 : 20))
        fail_(
          "API_QUOTA",
          "Address checking is busy. Keep the address or try again shortly.",
        );
      minute[kind] = (minute[kind] || 0) + units;
      p.setProperty("MEALS_ADDRESS_USAGE_MINUTE", JSON.stringify(minute));
    }
    daily[kind] = (daily[kind] || 0) + units;
    monthly[kind] = (monthly[kind] || 0) + units;
    p.setProperty("MEALS_MAPS_USAGE_DAY", JSON.stringify(daily));
    p.setProperty("MEALS_MAPS_USAGE_MONTH", JSON.stringify(monthly));
  } finally {
    lock.releaseLock();
  }
}

// Manual review is an explicit admin attestation, never a Google geocode result.
function addressReviewed_(status) {
  return status === "Confirmed" || status === "Manually Reviewed";
}
function manualAddressReview_(s, p, admin) {
  if (p.confirmed !== true)
    fail_(
      "CONFIRM",
      "Confirm that you checked the saved address before marking it reviewed.",
    );
  if (!["event", "recipient"].includes(p.entity))
    fail_("INVALID", "Please select an address to review.");
  const isStart = p.entity === "event",
    row = byId_(
      s,
      isStart ? "EVENTS" : "RECIPIENTS",
      isStart ? p.eventId : p.recipientId,
    ),
    event = isStart ? row : byId_(s, "EVENTS", row.EventID);
  editable_(event);
  version_(row, p.version);
  const old = isStart ? row.StartAddressStatus : row.AddressStatus;
  if (isStart) row.StartAddressStatus = "Manually Reviewed";
  else {
    row.AddressStatus = "Manually Reviewed";
    row.VerifiedAt = now_();
  }
  touch_(row);
  routeDirty_(event);
  audit_(
    s,
    admin,
    "Address Manually Reviewed",
    isStart ? "Event" : "Recipient",
    isStart ? row.EventID : row.RecipientID,
    old,
    "Manually Reviewed",
  );
  return {
    reviewed: true,
    message:
      "Saved address manually reviewed; Google validation was not performed.",
  };
}
```

## File 11: AddressEntry.gs

SHA-256: efd22b8466d7fc571018b573cd88154379f689c750871f6707aa9cf92896d370

Copy only the contents of this code box into the matching Apps Script file.

```javascript
// Places API (New), separate from the route optimization feature flag.
function addressFeatures_() {
  const p = properties_();
  return {
    autocomplete:
      p.getProperty("MEALS_ADDRESS_AUTOCOMPLETE_ENABLED") === "true",
    validation: p.getProperty("MEALS_ADDRESS_VALIDATION_ENABLED") === "true",
  };
}
function addressSession_(p) {
  const token = text_(p.sessionToken, "address session", 36, false);
  if (token && !/^[a-zA-Z0-9_-]{1,36}$/.test(token))
    fail_("INVALID", "Please restart the address search.");
  return token;
}
function addressServiceRequest_(url, key, payload, mask) {
  if (!key) fail_("CONFIG", "Address services are not configured.");
  const headers = { "X-Goog-Api-Key": key };
  if (mask) headers["X-Goog-FieldMask"] = mask;
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200)
    fail_(
      "ADDRESS_UNAVAILABLE",
      "Address checking is unavailable. You can keep the address for administrator review.",
    );
  return JSON.parse(res.getContentText());
}
function addressSuggestions_(p) {
  if (!addressFeatures_().autocomplete)
    fail_("API_DISABLED", "Address suggestions are currently disabled.");
  const input = text_(p.address, "address", 500, true);
  if (input.length < 4) return { suggestions: [] };
  const token = addressSession_(p);
  if (!token) fail_("INVALID", "An address session is required.");
  mapsUsage_("autocomplete", 1);
  const result = addressServiceRequest_(
    "https://places.googleapis.com/v1/places:autocomplete",
    properties_().getProperty("MEALS_PLACES_API_KEY"),
    {
      input,
      sessionToken: token,
      includedRegionCodes: ["us"],
      languageCode: "en",
      includeQueryPredictions: false,
    },
    "suggestions.placePrediction.text.text,suggestions.placePrediction.placeId",
  );
  return {
    suggestions: (result.suggestions || [])
      .slice(0, 5)
      .filter((x) => x.placePrediction && x.placePrediction.text)
      .map((x) => ({
        address: text_(x.placePrediction.text.text, "suggestion", 500, true),
      })),
  };
}
function addressUnits_(address) {
  return (
    String(address).match(
      /(?:\b(?:apartment|apt|suite|ste|unit|floor|fl|building|bldg|room|rm)\.?\s*|#\s*)[a-z0-9][a-z0-9 -]*/gi,
    ) || []
  )
    .map((x) => addressKey_(x).replace(/\bste\b/g, "unit"))
    .sort();
}
function sameAddress_(a, b) {
  const clean = (x) =>
    addressKey_(x)
      .replace(/\b(?:usa|united states)\b/g, "")
      .trim()
      .replace(/\s+/g, " ");
  return clean(a) === clean(b);
}
function preserveAddressUnits_(original, recommended) {
  // Conservative: a missing or changed unit is never accepted silently.
  const units = addressUnits_(original),
    next = addressUnits_(recommended);
  const changed =
    units.length > 0 && JSON.stringify(units) !== JSON.stringify(next);
  if (!changed) return { address: recommended, unitIssue: false };
  const parts =
    String(original).match(
      /(?:\b(?:apartment|apt|suite|ste|unit|floor|fl|building|bldg|room|rm)\.?\s*|#\s*)[a-z0-9][a-z0-9 -]*/gi,
    ) || [];
  // Conflicting units: retain the original address rather than inventing a combination.
  return {
    address: next.length ? original : recommended + ", " + parts.join(", "),
    unitIssue: true,
  };
}
function addressReceipt_(address, status) {
  const props = properties_();
  let secret = props.getProperty("MEALS_ADDRESS_RECEIPT_SECRET");
  if (!secret) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000))
      fail_("BUSY", "Please try the address check again.");
    try {
      secret = props.getProperty("MEALS_ADDRESS_RECEIPT_SECRET");
      if (!secret) {
        secret = uuid_() + uuid_();
        props.setProperty("MEALS_ADDRESS_RECEIPT_SECRET", secret);
      }
    } finally {
      lock.releaseLock();
    }
  }
  // Only a hash is returned, never a name or an address inside this receipt.
  const body = Utilities.base64EncodeWebSafe(
    JSON.stringify({
      hash: fingerprint_(address),
      status,
      expires: Date.now() + 7200000,
    }),
  );
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(body, secret),
  );
  return body + "." + sig;
}
function addressProofStatus_(address, receipt) {
  if (typeof receipt !== "string" || receipt.length > 1000)
    return "Needs Review";
  const secret = properties_().getProperty("MEALS_ADDRESS_RECEIPT_SECRET");
  if (!secret) return "Needs Review";
  try {
    const parts = receipt.split(".");
    if (parts.length !== 2) return "Needs Review";
    const expected = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(parts[0], secret),
    );
    let diff = expected.length ^ parts[1].length;
    for (let i = 0; i < expected.length; i++)
      diff |= expected.charCodeAt(i) ^ (parts[1].charCodeAt(i) || 0);
    if (diff) return "Needs Review";
    const data = JSON.parse(
      Utilities.newBlob(
        Utilities.base64DecodeWebSafe(parts[0]),
      ).getDataAsString(),
    );
    return data.hash === fingerprint_(address) &&
      data.expires > Date.now() &&
      data.status === "Confirmed"
      ? "Confirmed"
      : "Needs Review";
  } catch (_) {
    return "Needs Review";
  }
}
function addressPreview_(p) {
  if (!addressFeatures_().validation)
    fail_(
      "API_DISABLED",
      "Address validation is currently disabled. You can keep the address for administrator review.",
    );
  const original = text_(p.address, "address", 500, true);
  const candidate = text_(
    p.candidate || original,
    "selected address",
    500,
    true,
  );
  const before = preserveAddressUnits_(original, candidate);
  const body = {
    address: { regionCode: "US", addressLines: [before.address] },
  };
  const token = addressSession_(p);
  if (token) body.sessionToken = token;
  mapsUsage_("validation", 1);
  const response = addressServiceRequest_(
    "https://addressvalidation.googleapis.com/v1:validateAddress",
    properties_().getProperty("MEALS_ADDRESS_API_KEY"),
    body,
  );
  const result = response.result || {},
    v = result.verdict || {},
    a = result.address || {};
  const safe = preserveAddressUnits_(
    original,
    text_(
      a.formattedAddress || before.address,
      "recommended address",
      500,
      true,
    ),
  );
  const unitIssue =
    safe.unitIssue ||
    (before.unitIssue && addressUnits_(safe.address).length === 0);
  const confident =
    v.addressComplete === true &&
    !v.hasUnconfirmedComponents &&
    ["PREMISE", "SUB_PREMISE"].includes(v.validationGranularity) &&
    !(a.missingComponentTypes || []).length &&
    !(a.unresolvedTokens || []).length &&
    !(a.addressComponents || []).some(
      (c) =>
        c.unexpected || c.confirmationLevel === "UNCONFIRMED_AND_SUSPICIOUS",
    ) &&
    !unitIssue &&
    (!addressUnits_(original).length ||
      v.validationGranularity === "SUB_PREMISE");
  const equivalent =
    sameAddress_(original, safe.address) &&
    !v.hasReplacedComponents &&
    !v.hasInferredComponents;
  return {
    original,
    recommended: safe.address,
    confident,
    equivalent,
    unitIssue,
    originalReceipt: addressReceipt_(
      original,
      confident && equivalent ? "Confirmed" : "Needs Review",
    ),
    recommendedReceipt: addressReceipt_(
      safe.address,
      confident ? "Confirmed" : "Needs Review",
    ),
  };
}
function publicAddressCall_(action, p) {
  if (action === "addressConfig") return addressFeatures_();
  // Public callers cannot use this interface to read saved addresses or recipients.
  const s = load_(),
    e = byId_(s, "EVENTS", id_(p.eventId));
  if (!acceptsPublicReferrals_(e) || available_(s, e) <= 0)
    fail_("CLOSED", "This event is no longer accepting requests.");
  if (action === "addressSuggestions") return addressSuggestions_(p);
  if (action === "addressPreview") return addressPreview_(p);
  fail_("FORBIDDEN", "This public operation is unavailable.");
}
```

## File 12: Routing.gs

SHA-256: 098fc63ac6fc81943a968d3edad4e1bb3560f6a4d9754c8083fcb461f300a0bb

Copy only the contents of this code box into the matching Apps Script file.

```javascript
function approvedStops_(s, eventId) {
  const ids = new Set(
    s.REFERRALS.filter(
      (r) => r.EventID === eventId && r.Status === "Approved",
    ).map((r) => r.ReferralID),
  );
  return s.RECIPIENTS.filter(
    (r) => r.EventID === eventId && ids.has(r.ReferralID),
  );
}
function route_(s, eventId) {
  const e = byId_(s, "EVENTS", eventId);
  const rows = approvedStops_(s, eventId).sort(
    (a, b) =>
      (Number(a.RoutePosition) || 1e9) - (Number(b.RoutePosition) || 1e9) ||
      a.CreatedAt.localeCompare(b.CreatedAt) ||
      a.RecipientID.localeCompare(b.RecipientID),
  );
  let running = 0;
  const stops = rows.map((r, i) => ({
    recipientId: r.RecipientID,
    stop: i + 1,
    recipientName: r.RecipientName,
    address: r.Address,
    phone: r.Phone,
    meals: Number(r.MealCount),
    runningMeals: (running += Number(r.MealCount)),
    dietaryRestrictions: r.DietaryRestrictions,
    doorPreference: r.DoorPreference,
    deliveryInstructions: r.DeliveryInstructions,
    addressStatus: r.AddressStatus,
  }));
  const unresolved = stops.filter((r) => !addressReviewed_(r.addressStatus));
  return {
    eventId: e.EventID,
    eventName: e.EventName,
    deliveryDate: e.DeliveryDate,
    startAddress: e.StartAddress,
    startAddressStatus: e.StartAddressStatus,
    version: Number(e.RouteVersion),
    readOnly: e.Archived === true || e.Status === "Completed",
    needsReview: Boolean(e.RouteNeedsReview),
    mapsEnabled:
      properties_().getProperty("MEALS_MAPS_LIVE_ENABLED") === "true",
    isFinal:
      !e.RouteNeedsReview &&
      addressReviewed_(e.StartAddressStatus) &&
      !unresolved.length,
    unresolved,
    stops,
    totalMeals: running,
  };
}
function deliverySheetHtml_(route) {
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
  const detail = (label, value) =>
    value ? `<p><strong>${label}</strong> ${escape(value)}</p>` : "";
  const stops = route.stops.map((r) => `
    <section class="stop">
      <h2><span class="check"></span>Stop ${escape(r.stop)} — ${escape(r.recipientName)}</h2>
      <p>${escape(r.address)}</p>
      <p><strong>Meals:</strong> ${escape(r.meals)} &nbsp; <strong>Running Meal Total:</strong> ${escape(r.runningMeals)}</p>
      ${detail("Phone:", r.phone)}
      ${detail("Dietary:", r.dietaryRestrictions)}
      ${detail("Door:", r.doorPreference)}
      ${detail("Delivery Instructions:", r.deliveryInstructions)}
    </section>`).join("");
  return `<!doctype html>
    <html lang="en"><head><meta charset="utf-8"><title>Delivery Sheet</title>
    <style>
      @page { size: letter; margin: 0.55in; }
      body { margin: 0; color: #000; background: #fff; font: 11pt/1.3 Arial, sans-serif; }
      h1, h2, p { overflow-wrap: anywhere; word-wrap: break-word; }
      h1 { font-size: 18pt; margin: 0 0 5pt; }
      h2 { font-size: 12pt; margin: 0 0 3pt; }
      p { margin: 2pt 0; white-space: pre-wrap; }
      header { margin-bottom: 10pt; break-after: avoid; page-break-after: avoid; }
      .stop { border: 1pt solid #555; padding: 7pt; margin: 0 0 8pt;
        break-inside: avoid; page-break-inside: avoid; }
      .check { display: inline-block; border: 1pt solid #000;
        width: 10pt; height: 10pt; margin-right: 6pt; vertical-align: -1pt; }
    </style></head><body>
    <header><h1>${escape(route.eventName)} Delivery Sheet</h1>
      ${detail("Delivery date:", route.deliveryDate)}
      ${detail("Pickup:", route.startAddress)}
      <p><strong>${route.stops.length} Stops · ${escape(route.totalMeals)} Meals</strong></p>
    </header>
    ${stops}
    </body></html>`;
}
function deliveryPdf_(s, p) {
  const route = route_(s, id_(p.eventId));
  if (route.version !== p.routeVersion || !route.isFinal || !route.stops.length)
    fail_("CONFLICT", "The delivery route changed. Review the current route and save its order before preparing the PDF.");
  try {
    const pdf = HtmlService.createHtmlOutput(deliverySheetHtml_(route)).getAs("application/pdf");
    const bytes = pdf.getBytes();
    if (bytes.slice(0, 5).join(",") !== "37,80,68,70,45")
      throw new Error("Invalid PDF output");
    return { filename: "delivery-sheet-" + route.deliveryDate + ".pdf", base64: Utilities.base64Encode(bytes) };
  } catch (_) {
    fail_("PDF", "The delivery PDF could not be generated. Try Prepare Delivery PDF again.");
  }
}
function routeOrder_(s, p, admin, optimized) {
  const e = byId_(s, "EVENTS", p.eventId);
  editable_(e);
  if (Number(e.RouteVersion) !== Number(p.routeVersion))
    fail_(
      "CONFLICT",
      "The delivery route changed. Refresh before saving this order.",
    );
  const stops = approvedStops_(s, e.EventID),
    ids = stops.map((r) => r.RecipientID),
    order = p.recipientIds;
  if (
    !Array.isArray(order) ||
    order.length !== ids.length ||
    new Set(order).size !== ids.length ||
    order.some((id) => !ids.includes(id))
  )
    fail_(
      "INVALID",
      "The route must include every approved recipient exactly once.",
    );
  const old = stops
    .slice()
    .sort(
      (a, b) =>
        (Number(a.RoutePosition) || 1e9) - (Number(b.RoutePosition) || 1e9),
    )
    .map((r) => r.RecipientID);
  order.forEach((id, i) => {
    const r = byId_(s, "RECIPIENTS", id);
    r.RoutePosition = i + 1;
  });
  e.RouteVersion = Number(e.RouteVersion) + 1;
  e.RouteNeedsReview =
    stops.some((r) => !addressReviewed_(r.AddressStatus)) ||
    !addressReviewed_(e.StartAddressStatus);
  audit_(
    s,
    admin,
    optimized ? "Route Optimized" : "Route Reordered",
    "Event",
    e.EventID,
    old,
    order,
  );
  return route_(s, e.EventID);
}
function optimize_(p) {
  const a = requireAdmin_(),
    e = byId_(a.state, "EVENTS", p.eventId);
  editable_(e);
  if (Number(p.routeVersion) !== Number(e.RouteVersion))
    fail_("CONFLICT", "The delivery route changed. Refresh before optimizing.");
  const stops = approvedStops_(a.state, e.EventID);
  if (!stops.length)
    fail_("INVALID", "Approve at least one recipient before optimizing.");
  if (
    !addressReviewed_(e.StartAddressStatus) ||
    stops.some((r) => !addressReviewed_(r.AddressStatus))
  )
    fail_(
      "ADDRESS_REVIEW",
      "Address Needs Review. Confirm the pickup address and every approved recipient before optimization.",
    );
  mapsEnabled_();
  const project = properties_().getProperty("MEALS_CLOUD_PROJECT_ID");
  if (!project) fail_("CONFIG", "Route Optimization is not configured.");
  // Google-derived coordinates stay transient: never write them to Sheets or audit history.
  const pickup = addressLookup_(e.StartAddress);
  const locations = stops.map((r) => addressLookup_(r.Address));
  if (!pickup.confirmed || locations.some((x) => !x.confirmed))
    fail_(
      "ADDRESS_REVIEW",
      "An address could not be reconfirmed. Review the addresses before routing.",
    );
  // Route Optimization rejects nonzero timestamp nanos (millisecond fractions).
  const start = new Date(Math.floor(Date.now() / 1000) * 1000 + 60000),
    end = new Date(start.getTime() + 86400000);
  const payload = {
    model: {
      globalStartTime: start.toISOString(),
      globalEndTime: end.toISOString(),
      vehicles: [
        {
          startLocation: {
            latitude: pickup.latitude,
            longitude: pickup.longitude,
          },
          costPerHour: 1,
        },
      ],
      shipments: stops.map((r, i) => ({
        label: r.RecipientID,
        deliveries: [
          {
            arrivalLocation: {
              latitude: locations[i].latitude,
              longitude: locations[i].longitude,
            },
          },
        ],
      })),
    },
    timeout: "30s",
  };
  mapsUsage_("optimization", stops.length);
  const res = UrlFetchApp.fetch(
    "https://routeoptimization.googleapis.com/v1/projects/" +
      encodeURIComponent(project) +
      ":optimizeTours",
    {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    },
  );
  if (res.getResponseCode() !== 200)
    fail_("MAPS", routingFailureMessage_(res));
  const result = JSON.parse(res.getContentText());
  if ((result.skippedShipments || []).length)
    fail_(
      "MAPS",
      "The routing service could not include every stop. The previous order is unchanged.",
    );
  const visits = (result.routes || []).flatMap((r) => r.visits || []);
  const ids = visits.map(
    (v) => v.shipmentLabel || (stops[v.shipmentIndex || 0] || {}).RecipientID,
  );
  return locked_((s) =>
    routeOrder_(
      s,
      { eventId: e.EventID, routeVersion: p.routeVersion, recipientIds: ids },
      admin_(s),
      true,
    ),
  );
}

// Return only bounded machine codes. Never expose Google's raw message/body.
function routingFailureMessage_(response) {
  let error = {};
  try { error = JSON.parse(response.getContentText()).error || {}; } catch (_) {}
  const safeCode = value => /^[A-Z][A-Z0-9_]{0,80}$/.test(String(value || "")) ? String(value) : "";
  const details = Array.isArray(error.details) ? error.details.slice(0, 5) : [];
  const codes = [safeCode(error.status), ...details.map(d => safeCode(d && d.reason))].filter(Boolean);
  let guidance = "";
  if (codes.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT"))
    guidance = " Authorize Google Cloud routing permission and deploy a New version with the updated appsscript.json.";
  else if (codes.includes("SERVICE_DISABLED"))
    guidance = " Enable Route Optimization API in the configured Google Cloud project.";
  else if (codes.includes("BILLING_DISABLED"))
    guidance = " Check billing on the configured Google Cloud project.";
  return "Route optimization failed: HTTP " + response.getResponseCode() +
    (codes.length ? " — " + codes.join(" / ") : "") + "." + guidance +
    " The previous order is unchanged.";
}
function checkRoutingConnection() {
  requireAdmin_();
  const project = properties_().getProperty("MEALS_CLOUD_PROJECT_ID");
  if (!project) fail_("CONFIG", "MEALS_CLOUD_PROJECT_ID is missing.");
  const response = UrlFetchApp.fetch(
    "https://routeoptimization.googleapis.com/v1/projects/" + encodeURIComponent(project) + ":optimizeTours",
    {
      method: "post", contentType: "application/json",
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({ solvingMode: "VALIDATE_ONLY", model: {
        vehicles: [{ startLocation: { latitude: 36.69, longitude: -79.87 }, costPerHour: 1 }], shipments: []
      }}), muteHttpExceptions: true
    }
  );
  const message = response.getResponseCode() === 200 ? "Routing connection: HTTP 200 | OK" : routingFailureMessage_(response);
  console.log(message);
  return message;
}
function authorizeRouting() {
  requireAdmin_();
  ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ["https://www.googleapis.com/auth/cloud-platform"]);
  return checkRoutingConnection();
}
```

## File 13: Schema.gs

SHA-256: 624ea09cd51a93d3b4f61df727c52b7ba63402b8b8c25d0979e3b700ce5c6c7f

Copy only the contents of this code box into the matching Apps Script file.

```javascript
// Editor-only helpers: names ending in _ cannot be called with google.script.run.
function schemaPlan_() {
  const db = database_();
  const plans = [];
  Object.keys(MEAL_SCHEMA).forEach((name) => {
    const sheet = db.getSheetByName(name);
    if (!sheet)
      plans.push({ name, action: "create", headers: MEAL_SCHEMA[name] });
    else {
      const header = sheet
        .getRange(1, 1, 1, MEAL_SCHEMA[name].length)
        .getValues()[0];
      if (JSON.stringify(header) !== JSON.stringify(MEAL_SCHEMA[name]))
        fail_(
          "SCHEMA",
          "Existing " +
            name +
            " headers differ. No automatic overwrite is allowed.",
        );
      plans.push({ name, action: "preserve" });
    }
  });
  return plans;
}
function setupDevelopmentSchema_() {
  const p = properties_();
  if (
    p.getProperty("MEALS_ENV") !== "development" ||
    p.getProperty("MEALS_ALLOW_SCHEMA_SETUP") !== "true"
  )
    fail_("CONFIG", "Development schema setup is not explicitly enabled.");
  const email = identity_();
  const bootstrap = String(p.getProperty("MEALS_BOOTSTRAP_ADMIN_EMAILS") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (
    !bootstrap.includes(email) ||
    bootstrap.length !== 2 ||
    new Set(bootstrap).size !== 2
  )
    fail_(
      "AUTH",
      "Configure exactly two administrator accounts securely in Script Properties.",
    );
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) fail_("BUSY", "Try setup again.");
  try {
    const db = database_(),
      plan = schemaPlan_();
    let next =
      Math.max.apply(
        null,
        db
          .getSheets()
          .map((s) => s.getSheetId())
          .concat([0]),
      ) + 1;
    const requests = [];
    plan
      .filter((x) => x.action === "create")
      .forEach((x) => {
        const sid = next++;
        requests.push({
          addSheet: { properties: { sheetId: sid, title: x.name } },
        });
        const rows = [{ values: x.headers.map(cell_) }];
        if (x.name === "ADMINUSERS")
          bootstrap.forEach((email) =>
            rows.push({ values: [cell_(email), cell_(true), cell_("admin")] }),
          );
        requests.push({
          updateCells: {
            start: { sheetId: sid, rowIndex: 0, columnIndex: 0 },
            rows,
            fields: "userEnteredValue",
          },
        });
      });
    // Connector-created headers may already exist. Bootstrap only an empty
    // ADMINUSERS tab; never overwrite or replace an existing account record.
    const admins = db.getSheetByName("ADMINUSERS");
    if (admins && admins.getLastRow() === 1) {
      requests.push({
        appendCells: {
          sheetId: admins.getSheetId(),
          rows: bootstrap.map((email) => ({
            values: [cell_(email), cell_(true), cell_("admin")],
          })),
          fields: "userEnteredValue",
        },
      });
    }
    if (requests.length)
      Sheets.Spreadsheets.batchUpdate({ requests }, db.getId());
    return plan;
  } finally {
    lock.releaseLock();
  }
}
function legacyMigrationPlan_() {
  const db = database_(),
    sheet = db.getSheetByName("Requests");
  if (!sheet)
    return {
      records: 0,
      action: "No legacy Requests tab in this development spreadsheet.",
    };
  const rows = sheet
    .getRange(1, 1, Math.max(sheet.getLastRow(), 1), sheet.getLastColumn())
    .getValues();
  const comments = rows[0].indexOf("Comments");
  return {
    records: rows.slice(1).filter((r) => r.some((v) => v !== "")).length,
    recordsWithComments:
      comments < 0
        ? 0
        : rows.slice(1).filter((r) => String(r[comments] || "").trim()).length,
    headers: rows[0],
    proposedMapping: {
      Name: "RecipientName",
      "Address Raw": "Address",
      Phone: "Phone",
      "Dietary Restrictions": "DietaryRestrictions",
      "Door Of Entry": "DoorPreference",
      Comments:
        "UNRESOLVED: preserve original field; obtain explicit mapping approval",
    },
    missingFields: [
      "Event assignment",
      "Organization details",
      "Meal quantities",
      "Permanent IDs",
    ],
    canMigrate: false,
    message:
      "Legacy tabs remain untouched. Do not import until event, organization, quantities and Comments mapping are explicitly approved.",
  };
}
```

## File 14: Admin.html

SHA-256: 12f47d7312d164246c6ba70455c7b2b69088d6b75fa658b4b4a3ed7648c1a0f2

Copy only the contents of this code box into the matching Apps Script file.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <base target="_top" />
    <style>
      <?!= include_('AdminStyles'); ?>
    </style>
  </head>
  <body>
    <header class="site-header no-print">
      <div class="page-wrap">
        <h1>Community Meals</h1>
        <p id="adminIdentity"></p>
      </div>
    </header>
    <main class="page-wrap">
      <section class="no-print">
        <div class="grid">
          <label>Meal event<select id="adminEvents"></select></label
          ><label class="check-label"
            ><input type="checkbox" id="showArchived" />Show archived
            events</label
          >
        </div>
        <div class="actions">
          <button id="createEvent">Create Event</button
          ><button id="archiveEvent" class="secondary">Archive Event</button
          ><button id="reopenEvent" class="secondary" hidden>
            Reopen / Unarchive</button
          ><button id="refreshAdmin" class="secondary">Refresh</button
          ><button id="publicLink" class="secondary">Copy Public Link</button>
        </div>
        <div id="metrics" class="metrics"></div>
        <p id="readonlyNotice" class="warning"></p>
        <p id="integrityNotice" class="warning" role="status"></p>
        <nav class="tabs" aria-label="Admin sections">
          <button data-view="requestsView" aria-selected="true">Requests</button
          ><button data-view="routeView" aria-selected="false">
            Delivery Route</button
          ><button data-view="settingsView" aria-selected="false">
            Event Settings</button
          ><button data-view="reportsView" aria-selected="false">
            Reports
          </button>
        </nav>
        <p id="adminMessage" role="status" aria-live="polite"></p>
      </section>
      <section id="requestsView">
        <h2>Requests</h2>
        <div class="actions">
          <button id="addReferral">Add Referral</button
          ><button id="selectAll" class="secondary">Select All Pending</button
          ><button id="approveSelected">Approve Selected</button
          ><button id="rejectSelected" class="danger">Reject Selected</button>
        </div>
        <div id="requestCards"></div>
      </section>
      <section id="routeView" hidden>
        <p class="print-verification-warning">Open the prepared delivery PDF to print the delivery sheet.</p>
        <div class="route-header">
          <h2 id="routeTitle">Delivery Route</h2>
          <p id="routeDate"></p>
          <p id="routePickup"></p>
          <p id="routeSummary"></p>
          <p id="routeStatus" class="route-status warning"></p>
          <p id="routingAvailability" class="hint no-print"></p>
        </div>
        <div class="actions no-print">
          <button id="optimizeRoute">Optimize Route</button
          ><button id="saveRoute">Save Manual Order</button
          ><button id="printRoute" class="secondary" disabled>
            Prepare Delivery PDF
          </button>
        </div>
        <div id="deliveryPdf" class="no-print" hidden>
          <p role="status">US Letter PDF ready. On iPhone, open it and use Share → Print. If the viewer does not open, download the PDF and open it in Files.</p>
          <div class="actions">
            <a id="openDeliveryPdf" class="button" target="_blank" rel="noopener noreferrer">Open PDF</a>
            <a id="downloadDeliveryPdf" class="button" target="_blank" rel="noopener noreferrer">Download PDF</a>
          </div>
        </div>
        <div id="routeStops"></div>
      </section>
      <section id="settingsView" hidden>
        <h2>Event Settings</h2>
        <form id="settingsForm">
          <div class="grid">
            <label
              >Event name<input
                name="eventName"
                required
                maxlength="160" /></label
            ><label
              >Delivery date<input
                type="date"
                name="deliveryDate"
                required /></label
            ><label
              >Meal capacity<input
                type="number"
                name="capacity"
                min="0"
                max="100000"
                step="1"
                required /></label
            ><label
              >Status<select name="status">
                <option>Draft</option>
                <option>Open</option>
                <option>Closed</option>
                <option>Completed</option>
              </select></label
            ><label class="full"
              >Starting / pickup address<input
                name="startAddress"
                maxlength="500"
            /></label>
          </div>
          <div class="actions">
            <button type="submit">Save Event Settings</button
            ><button type="button" id="verifyPickup" class="secondary">
              Validate Pickup Address
            </button>
          </div>
          <button type="button" id="manualPickup" class="secondary">Mark Saved Pickup Reviewed</button>
          <p id="pickupStatus"></p>
          <p class="hint" translate="no">Address validation: Google Maps</p>
        </form>
      </section>
      <section id="reportsView" hidden>
        <h2>Reports</h2>
        <p class="hint">
          Archived events are included. Recipient totals count delivery records
          across events.
        </p>
        <div class="grid">
          <label
            >Event<select id="reportEvent">
              <option value="">All events</option>
            </select></label
          ><label
            >Year<select id="reportYear">
              <option value="">All years</option>
            </select></label
          >
        </div>
        <div id="reportTotals" class="metrics"></div>
        <p id="reportIntegrityNotice" class="warning" role="status"></p>
        <h3>Referring organizations</h3>
        <div id="organizationReports"></div>
      </section>
    </main>
    <dialog id="referralDialog">
      <div class="dialog-header">
        <h2 id="referralHeading">Referral</h2>
        <button type="button" id="closeReferral" class="secondary">
          Close
        </button>
      </div>
      <form id="referralEditor">
        <fieldset>
          <legend>Referring organization</legend>
          <div class="grid">
            <label
              >Organization name<input
                name="organizationName"
                maxlength="160"
                required /></label
            ><label
              >Email address<input
                type="email"
                name="organizationEmail"
                maxlength="254"
                required /></label
            ><label
              >Phone number<input
                name="organizationPhone"
                type="tel"
                maxlength="40"
                required
            /></label>
          </div>
        </fieldset>
        <div id="editorRecipients"></div>
        <div class="actions">
          <button type="button" id="editorAddRecipient" class="secondary">
            + Add Another Recipient</button
          ><button type="submit" id="saveReferral">Save Referral</button>
        </div>
      </form>
      <p id="editorMessage" role="status"></p>
    </dialog>
    <dialog id="eventDialog">
      <div class="dialog-header">
        <h2>Create Event</h2>
        <button id="closeEvent" class="secondary">Close</button>
      </div>
      <form id="eventEditor">
        <div class="grid">
          <label
            >Event name<input
              name="eventName"
              required
              maxlength="160" /></label
          ><label
            >Delivery date<input
              type="date"
              name="deliveryDate"
              required /></label
          ><label
            >Meal capacity<input
              type="number"
              name="capacity"
              min="0"
              max="100000"
              step="1"
              required /></label
          ><label
            >Status<select name="status">
              <option>Draft</option>
              <option>Open</option>
              <option>Closed</option>
            </select></label
          ><label class="full"
            >Starting / pickup address<input
              name="startAddress"
              maxlength="500"
          /></label>
        </div>
        <div class="actions"><button type="submit">Create Event</button></div>
      </form>
      <p id="eventEditorMessage" role="status"></p>
    </dialog>
    <dialog id="publicLinkDialog" aria-labelledby="publicLinkTitle">
      <h2 id="publicLinkTitle">Public Referral Link</h2>
      <p>Share this link with organizations requesting meals.</p>
      <label>Website link<input id="publicLinkValue" type="url" readonly /></label>
      <div class="actions">
        <button id="copyPublicLink" type="button">Copy Link</button>
        <a id="openPublicLink" target="_blank" rel="noopener noreferrer">Open Public Form</a>
        <button id="closePublicLink" type="button" class="secondary">Close</button>
      </div>
      <p id="publicLinkMessage" role="status" aria-live="polite"></p>
    </dialog>
    <script>
      <?!= include_('AddressClient'); ?>
      <?!= include_('AdminClient'); ?>
    </script>
  </body>
</html>
```

## File 15: AdminClient.html

SHA-256: c36e03348dd6b14a54b1e922610af28e959330f07aaa47196b788ba5116a816a

Copy only the contents of this code box into the matching Apps Script file.

```javascript
"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  let events = [],
    dashboard = null,
    route = null,
    editing = null,
    viewOnly = false,
    view = "requestsView",
    busy = false,
    dragId = null,
    createId = null,
    routeUnsaved = false,
    deliveryPdfUrl = null,
    referralAddressControls = [];
  const el = (tag, text, cls) => {
    const n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };
  const button = (text, fn, cls) => {
    const b = el("button", text, cls);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  };
  const addressCall = (action, p) => rpc(action, p);
  const pickupSettings = MealAddresses.attach(
    $("settingsForm").elements.startAddress,
    addressCall,
  );
  const pickupCreate = MealAddresses.attach(
    $("eventEditor").elements.startAddress,
    addressCall,
  );
  const addressReviewed = (status) =>
    ["Confirmed", "Manually Reviewed"].includes(status);
  const readonly = () =>
    !dashboard ||
    dashboard.event.Archived === true ||
    dashboard.event.Status === "Completed";
  function rpc(action, p = {}) {
    return new Promise((resolve, reject) =>
      google.script.run
        .withSuccessHandler((r) =>
          r.ok
            ? resolve(r.data)
            : reject(
                Object.assign(new Error(
                  r.error?.message ||
                    "Your changes were not saved. Please try again.",
                ), { code: r.error?.code }),
              ),
        )
        .withFailureHandler(() =>
          reject(
            new Error(
              "The service could not be reached. Refresh and try again.",
            ),
          ),
        )
        .adminCall(action, p),
    );
  }
  const pendingCreates = new Map();
  for (const action of ["createReferral", "saveEvent"]) {
    try {
      const pending = JSON.parse(sessionStorage.getItem("community-meals-admin-" + action) || "null");
      if (pending) pendingCreates.set(action, pending);
    } catch (_) { /* Storage may be unavailable; this tab still deduplicates. */ }
  }
  function retainCreate(action, pending) {
    if (pending) pendingCreates.set(action, pending);
    else pendingCreates.delete(action);
    try {
      const key = "community-meals-admin-" + action;
      if (pending) sessionStorage.setItem(key, JSON.stringify(pending));
      else sessionStorage.removeItem(key);
    } catch (_) { /* No recipient details are stored in browser storage. */ }
  }
  async function createOnce(action, payload) {
    const canonical = { ...payload };
    delete canonical.submissionId;
    delete canonical.creationId;
    delete canonical.addressReceipt;
    if (canonical.recipients)
      canonical.recipients = canonical.recipients.map(({ addressReceipt, ...r }) => r);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(canonical)));
    const fingerprint = [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, "0")).join("");
    let pending = pendingCreates.get(action);
    const wasPending = Boolean(pending);
    if (pending && pending.fingerprint !== fingerprint)
      throw new Error("A previous save is unconfirmed. Restore the same information and retry before creating a different record. Refresh the dashboard to check whether it was saved.");
    if (!pending) pending = { id: crypto.randomUUID(), fingerprint, eventId: payload.eventId || "" };
    retainCreate(action, pending);
    try {
      const result = await rpc(action, { ...payload,
        [action === "createReferral" ? "submissionId" : "creationId"]: pending.id });
      retainCreate(action, null);
      return result;
    } catch (error) {
      // A later authentication/validation failure cannot disprove an earlier
      // lost response. Keep that original operation identity until reconciled.
      if (!wasPending && ["INVALID", "CAPACITY", "CLOSED", "READ_ONLY", "AUTH", "FORBIDDEN"].includes(error.code))
        retainCreate(action, null);
      throw error;
    }
  }
  async function task(fn, trigger = MealButtonFeedback.current()) {
    if (busy) return;
    busy = true;
    const finishFeedback = MealButtonFeedback.begin(trigger);
    $("adminEvents").disabled = true;
    $("showArchived").disabled = true;
    $("adminMessage").textContent = "Working…";
    try {
      await fn();
      $("adminMessage").textContent = "";
    } catch (e) {
      $("adminMessage").textContent = e.message;
    } finally {
      busy = false;
      finishFeedback();
      $("adminEvents").disabled = false;
      $("showArchived").disabled = false;
    }
  }
  const dateLabel = (s) =>
    new Date(s + "T12:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  function today() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  function metric(node, pairs) {
    node.replaceChildren(...pairs.map(([k, v]) => el("span", k + ": " + v)));
  }
  function eventOptions() {
    const list = events.filter(
        (e) => $("showArchived").checked || e.Archived !== true,
      ),
      old = dashboard?.event.EventID || $("adminEvents").value;
    const options = list.map((e) => {
      const o = el("option", e.EventName + (e.Archived ? " (Archived)" : ""));
      o.value = e.EventID;
      return o;
    });
    $("adminEvents").replaceChildren(...options);
    $("adminEvents").value = list.some((e) => e.EventID === old)
      ? old
      : (list.find((e) => e.DeliveryDate >= today()) || list[0])?.EventID || "";
  }
  async function refreshEvents(preferred) {
    events = await rpc("events");
    const pendingEvent = pendingCreates.get("saveEvent");
    if (pendingEvent && events.some(e => e.EventID === pendingEvent.id))
      retainCreate("saveEvent", null);
    if (preferred) {
      dashboard = null;
      $("adminEvents").value = preferred;
    }
    eventOptions();
    if (
      preferred &&
      events.some(
        (e) =>
          e.EventID === preferred &&
          (!$("showArchived").checked ? e.Archived !== true : true),
      )
    )
      $("adminEvents").value = preferred;
    await refresh();
  }
  async function refresh() {
    clearDeliveryPdf();
    const id = $("adminEvents").value;
    if (!id) {
      dashboard = null;
      route = null;
      metric($("metrics"), []);
      $("requestCards").replaceChildren(
        el("p", "No events available. Create an event to get started."),
      );
      $("routeStops").replaceChildren();
      $("routeTitle").textContent = "Delivery Route";
      $("routeDate").textContent = "";
      $("routePickup").textContent = "";
      $("routeSummary").textContent = "";
      $("routeStatus").textContent = "No event selected.";
      $("printRoute").disabled = true;
      $("archiveEvent").disabled = true;
      $("reopenEvent").hidden = true;
      $("settingsForm").inert = true;
      $("readonlyNotice").textContent = "";
      $("integrityNotice").textContent = "";
      $("addReferral").disabled = true;
      await reports();
      return;
    }
    dashboard = await rpc("dashboard", { eventId: id });
    route = await rpc("route", { eventId: id });
    routeUnsaved = false;
    renderDashboard();
    renderRequests();
    renderRoute();
    renderSettings();
    if (view === "reportsView") await reports();
  }
  function renderDashboard() {
    $("integrityNotice").textContent = integrityMessage(dashboard.integrity);
    metric($("metrics"), [
      ["Capacity", dashboard.capacity],
      ["Reserved", dashboard.reserved],
      ["Available", dashboard.available],
      ["Pending Referrals", dashboard.pendingReferrals],
      ["Approved Referrals", dashboard.approvedReferrals],
      ["Delivery Stops", dashboard.deliveryStops],
    ]);
    const ro = readonly();
    $("readonlyNotice").textContent = ro
      ? "This event is read-only. Use Reopen / Unarchive to make corrections."
      : "";
    $("archiveEvent").disabled = dashboard.event.Archived === true;
    $("reopenEvent").hidden = !ro;
    [
      "addReferral",
      "selectAll",
      "approveSelected",
      "rejectSelected",
      "optimizeRoute",
      "saveRoute",
      "verifyPickup",
    ].forEach((id) => ($(id).disabled = ro));
    $("settingsForm").inert = ro;
  }
  function integrityMessage(issues) {
    if (!issues || !(issues.recipientRecords || issues.submissionRecords)) return "";
    return "Historical records need review: " + issues.recipientRecords +
      " unlinked recipient records (" + issues.mealQuantities + " meal quantities) and " +
      issues.submissionRecords + " unlinked submission records. These records are preserved and excluded from referral totals; their delivery status must be reviewed before restoring them.";
  }
  function selectedRefs() {
    return [...$("requestCards").querySelectorAll("input:checked")].map(
      (x) => ({
        referralId: x.dataset.referralId,
        version: Number(x.dataset.version),
      }),
    );
  }
  async function changeStatus(referrals, status) {
    if (!referrals.length) throw new Error("Select at least one referral.");
    if (
      status === "Rejected" &&
      !confirm(
        "Reject " +
          referrals.length +
          " referral(s) and release their reserved meals?",
      )
    )
      return;
    await rpc("statuses", { referrals, status });
    await refresh();
  }
  function renderRequests() {
    const refs = dashboard.referrals
      .slice()
      .sort(
        (a, b) =>
          (a.Status === "Pending" ? 0 : 1) - (b.Status === "Pending" ? 0 : 1) ||
          a.SubmittedAt.localeCompare(b.SubmittedAt),
      );
    $("requestCards").replaceChildren();
    if (!refs.length) $("requestCards").append(el("p", "No referrals yet."));
    refs.forEach((r) => {
      const card = el("article", null, "request-card"),
        header = el("header");
      const check = el("input");
      check.type = "checkbox";
      check.dataset.referralId = r.ReferralID;
      check.dataset.version = r.Version;
      check.disabled = readonly();
      const label = el("label", null, "check-label");
      label.append(check, el("span", "Select " + r.OrganizationName));
      header.append(label, el("span", r.Status, "badge"));
      card.append(
        header,
        el(
          "h3",
          r.OrganizationName +
            " — " +
            r.recipients.length +
            " Recipients — " +
            r.meals +
            " Meals",
        ),
        el(
          "p",
          "Submitted " + new Date(r.SubmittedAt).toLocaleString(),
          "hint",
        ),
      );
      const recipients = el("ol", null, "request-recipient-list");
      r.recipients.forEach((recipient) => {
        const item = el("li");
        item.append(
          el("strong", recipient.RecipientName),
          el("p", recipient.Address),
          el("p", recipient.MealCount + (Number(recipient.MealCount) === 1 ? " meal" : " meals")),
        );
        if (!addressReviewed(recipient.AddressStatus))
          item.append(el("span", "Address Needs Review", "badge"));
        else item.append(el("span", recipient.AddressStatus === "Confirmed"
          ? "Address Verified" : "Address Manually Reviewed", "hint"));
        if (recipient.DuplicateFlag)
          item.append(el("span", "Possible Duplicate", "warning"));
        recipients.append(item);
      });
      card.append(recipients);
      if (r.recipients.some((x) => x.DuplicateFlag))
        card.append(
          el(
            "p",
            "Possible Duplicate — open View to see matching records.",
            "warning",
          ),
        );
      if (r.recipients.some((x) => !addressReviewed(x.AddressStatus)))
        card.append(el("p", "Address Needs Review", "badge"));
      const actions = el("div", null, "actions");
      actions.append(button("View", () => openReferral(r, true), "secondary"));
      if (!readonly()) {
        actions.append(
          button("Edit", () => openReferral(r, false), "secondary"),
          button("Review Addresses with Google", () =>
            task(() => reviewReferralAddresses(r)), "secondary"),
        );
        ["Approved", "Rejected", "Pending"]
          .filter((s) => s !== r.Status)
          .forEach((status) =>
            actions.append(
              button(
                status === "Approved"
                  ? "Approve"
                  : status === "Rejected"
                    ? "Reject"
                    : "Return to Pending",
                () =>
                  task(() =>
                    changeStatus(
                      [{ referralId: r.ReferralID, version: r.Version }],
                      status,
                    ),
                  ),
                status === "Rejected" ? "danger" : "secondary",
              ),
            ),
          );
      }
      card.append(actions);
      $("requestCards").append(card);
    });
  }
  function field(label, name, value, type = "text", max = 1000) {
    const wrap = el("label", label),
      input = el(type === "textarea" ? "textarea" : "input");
    input.name = name;
    if (type !== "textarea") input.type = type;
    input.value = value ?? "";
    input.maxLength = max;
    if (type === "number") {
      input.min = "1";
      input.max = "10000";
      input.step = "1";
    }
    if (["recipientName", "address", "mealCount"].includes(name))
      input.required = true;
    wrap.append(input);
    return wrap;
  }
  function recipientEditor(r) {
    const card = el("fieldset", null, "recipient-card");
    if (r) {
      card.dataset.recipientId = r.RecipientID;
      card.dataset.version = r.Version;
    }
    card.append(
      el("legend", "Recipient " + ($("editorRecipients").children.length + 1)),
    );
    const grid = el("div", null, "grid");
    grid.append(
      field("Recipient name", "recipientName", r?.RecipientName, "text", 160),
      field(
        "Street address (include apartment/unit)",
        "address",
        r?.Address,
        "text",
        500,
      ),
      field("Phone (optional)", "phone", r?.Phone, "tel", 40),
      field("Number of meals", "mealCount", r?.MealCount || 1, "number"),
      field(
        "Dietary restrictions / allergies",
        "dietaryRestrictions",
        r?.DietaryRestrictions,
        "textarea",
        500,
      ),
    );
    const door = el("label", "Preferred door"),
      select = el("select");
    select.name = "doorPreference";
    ["Front", "Side", "Back", "Other"].forEach((s) => {
      const o = el("option", s);
      o.value = s;
      select.append(o);
    });
    select.value = r?.DoorPreference || "Front";
    door.append(select);
    grid.append(
      door,
      field(
        "Delivery instructions (printed)",
        "deliveryInstructions",
        r?.DeliveryInstructions,
        "textarea",
      ),
      field(
        "Internal notes (admin only; never printed)",
        "notes",
        r?.Notes,
        "textarea",
      ),
    );
    card.append(grid);
    if (!viewOnly)
      referralAddressControls.push(MealAddresses.attach(
        grid.querySelector('[name="address"]'),
        addressCall,
        () => ({}),
        r?.AddressStatus,
      ));
    if (r) {
      card.append(
        el(
          "p",
          addressReviewed(r.AddressStatus)
            ? r.AddressStatus === "Manually Reviewed"
              ? "Address manually reviewed (Google validation not performed)"
              : "Address confirmed"
            : "Address Needs Review",
          addressReviewed(r.AddressStatus) ? "hint" : "warning",
        ),
      );
      if (r.matches?.length) {
        const details = el("details"),
          summary = el("summary", "Possible Duplicate — matching recipients");
        details.append(summary);
        r.matches.forEach((m) =>
          details.append(
            el(
              "p",
              m.recipientName +
                " — " +
                m.address +
                " — Referral " +
                m.referralId,
            ),
          ),
        );
        card.append(details);
      }
      if (!readonly()) {
        card.append(
          button(
            "Mark Saved Address Reviewed",
            () => {
              if (
                !confirm(
                  "Have you checked the SAVED address and confirmed it is usable for delivery? Unsaved edits are not reviewed. This is manual review, not Google validation.",
                )
              )
                return;
              task(async () => {
                await rpc("manualAddressReview", {
                  entity: "recipient",
                  recipientId: r.RecipientID,
                  version: r.Version,
                  confirmed: true,
                });
                $("referralDialog").close();
                await refresh();
              });
            },
            "secondary",
          ),
        );
      }
    } else {
      card.append(
        button(
          "Remove Recipient",
          () => {
            if ($("editorRecipients").children.length > 1) {
              card.remove();
              [...$("editorRecipients").children].forEach(
                (c, i) =>
                  (c.querySelector("legend").textContent =
                    "Recipient " + (i + 1)),
              );
            }
          },
          "secondary",
        ),
      );
    }
    $("editorRecipients").append(card);
    if (viewOnly)
      grid
        .querySelectorAll("input,select,textarea")
        .forEach((x) => (x.disabled = true));
  }
  function openReferral(r, read) {
    editing = r || null;
    viewOnly = read || readonly();
    createId = r ? null : crypto.randomUUID();
    $("referralHeading").textContent = r
      ? viewOnly
        ? "View Referral"
        : "Edit Referral"
      : "Add Referral";
    $("editorMessage").textContent = "";
    referralAddressControls = [];
    $("saveReferral").textContent = "Save Referral";
    $("saveReferral").disabled = false;
    ["organizationName", "organizationEmail", "organizationPhone"].forEach(
      (n) => {
        const key = n[0].toUpperCase() + n.slice(1);
        $("referralEditor").elements[n].value = r?.[key] || "";
        $("referralEditor").elements[n].disabled = viewOnly;
      },
    );
    $("editorRecipients").replaceChildren();
    if (r) r.recipients.forEach(recipientEditor);
    else recipientEditor();
    $("editorAddRecipient").hidden = !!r || viewOnly;
    $("saveReferral").hidden = viewOnly;
    $("referralDialog").showModal();
  }
  async function reviewReferralAddresses(r) {
    if (readonly()) return;
    openReferral(r, false);
    $("referralHeading").textContent = "Review Addresses with Google";
    $("saveReferral").textContent = "Save Reviewed Addresses";
    $("saveReferral").disabled = true;
    const controls = referralAddressControls.slice();
    const current = () => editing?.ReferralID === r.ReferralID && $("referralDialog").open;
    try {
      for (let i = 0; i < controls.length; i++) {
        if (!current()) return;
        $("editorMessage").textContent = "Checking address " + (i + 1) + " of " + controls.length + "…";
        const ready = await controls[i].check();
        if (!current()) return;
        if (!ready) {
          $("editorMessage").textContent = "Edit the address, then click Save Reviewed Addresses. Changes have not been saved yet.";
          return;
        }
      }
      if (current()) $("editorMessage").textContent =
        "Address checks finished. Click Save Reviewed Addresses to save your choices. Any unconfirmed address remains Address Needs Review.";
    } catch (error) {
      if (current()) $("editorMessage").textContent = error.message;
      throw error;
    } finally {
      if (current()) $("saveReferral").disabled = false;
    }
  }
  function editorPayload() {
    const f = $("referralEditor"),
      p = { eventId: dashboard.event.EventID };
    ["organizationName", "organizationEmail", "organizationPhone"].forEach(
      (n) => (p[n] = f.elements[n].value.trim()),
    );
    p.recipients = [...$("editorRecipients").children].map((c) => {
      const x = Object.fromEntries(
        [...c.querySelectorAll("[name]")].map((n) => [
          n.name,
          n.name === "mealCount" ? Number(n.value) : n.value.trim(),
        ]),
      );
      x.addressReceipt = MealAddresses.receipt(
        c.querySelector('[name="address"]'),
      );
      if (editing) {
        x.recipientId = c.dataset.recipientId;
        x.version = Number(c.dataset.version);
      }
      return x;
    });
    if (editing) {
      p.referralId = editing.ReferralID;
      p.version = editing.Version;
    } else p.submissionId = createId;
    return p;
  }
  function mapsUrl(address) {
    return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
      ? "https://maps.apple.com/?daddr=" + encodeURIComponent(address)
      : "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(address);
  }
  function renumberRoute() {
    let n = 0;
    route.stops.forEach((r, i) => {
      r.stop = i + 1;
      n += r.meals;
      r.runningMeals = n;
    });
    route.totalMeals = n;
  }
  function move(id, delta) {
    const i = route.stops.findIndex((s) => s.recipientId === id),
      j = i + delta;
    if (j < 0 || j >= route.stops.length) return;
    [route.stops[i], route.stops[j]] = [route.stops[j], route.stops[i]];
    routeUnsaved = true;
    renumberRoute();
    renderRoute();
  }
  function renderRoute() {
    if (!route) return;
    clearDeliveryPdf();
    $("routeTitle").textContent = route.eventName + " Delivery Route";
    $("routeDate").textContent = dateLabel(route.deliveryDate);
    $("routePickup").textContent = "Pickup: " + (route.startAddress || "Not configured");
    $("routeSummary").textContent =
      route.stops.length + " Stops · " + route.totalMeals + " Meals";
    const addressesReady = !route.unresolved.length && addressReviewed(route.startAddressStatus);
    $("routeStatus").textContent = !route.stops.length
      ? "Approve at least one recipient to build a delivery route."
      : routeUnsaved
        ? "Order changed. Click Save Manual Order to save your changes before printing."
        : route.isFinal
          ? "Official delivery order saved. You can print the delivery sheet."
          : addressesReady
            ? "All addresses are reviewed. Check the stop order, then click Save Manual Order to finalize the route and enable printing."
            : "Route is not final. " +
              (route.unresolved.length
                ? route.unresolved.length + " recipient address(es) need review. "
                : "") +
              (!addressReviewed(route.startAddressStatus)
                ? "Pickup address needs review in Event Settings. "
                : "") +
              "Review the addresses, then click Save Manual Order to finalize the route.";
    $("printRoute").disabled = !route.stops.length || routeUnsaved || !route.isFinal;
    const optimizationReason = readonly()
      ? "This event is read-only. Reopen / Unarchive it before changing the route."
      : !route.mapsEnabled
        ? "Automatic route optimization is off. Use Move Up / Move Down or drag stops into order, then click Save Manual Order. You can print a reviewed, saved route without automatic optimization."
        : !route.stops.length
          ? "Approve at least one recipient before optimizing."
          : !addressesReady
            ? "Review the pickup address and every recipient address before optimizing."
            : "Google route optimization is enabled in configuration. You may optimize or save a manual order.";
    $("routingAvailability").textContent = optimizationReason;
    $("optimizeRoute").disabled = readonly() || !route.mapsEnabled || !route.stops.length || !addressesReady;
    $("optimizeRoute").title = optimizationReason;
    $("saveRoute").disabled = readonly() || !route.stops.length;
    $("routeStops").replaceChildren();
    route.stops.forEach((r) => {
      const card = el("article", null, "stop");
      card.dataset.recipientId = r.recipientId;
      const head = el("header");
      head.append(
        el("span", null, "print-check"),
        el("h3", "Stop " + r.stop + " — " + r.recipientName),
      );
      card.append(head);
      const address = el("p", null, "address"),
        link = el("a", r.address);
      link.href = mapsUrl(r.address);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      address.append(link);
      card.append(address);
      const dl = el("dl");
      const pair = (k, v) => {
        if (v) {
          dl.append(el("dt", k), el("dd", String(v)));
        }
      };
      pair("Phone:", r.phone);
      pair("Meals:", r.meals);
      pair("Running Meal Total:", r.runningMeals);
      pair("Dietary:", r.dietaryRestrictions);
      pair("Door:", r.doorPreference);
      pair("Delivery Instructions:", r.deliveryInstructions);
      card.append(dl);
      if (!addressReviewed(r.addressStatus))
        card.append(el("p", "Address Needs Review", "badge"));
      if (!readonly()) {
        const controls = el("div", null, "actions no-print"),
          up = button("Move Up", () => move(r.recipientId, -1), "secondary"),
          down = button("Move Down", () => move(r.recipientId, 1), "secondary");
        up.disabled = r.stop === 1;
        down.disabled = r.stop === route.stops.length;
        controls.append(up, down);
        card.append(controls);
        card.draggable = matchMedia("(pointer:fine)").matches;
        card.addEventListener("dragstart", (ev) => {
          dragId = r.recipientId;
          ev.dataTransfer.setData("text/plain", r.recipientId);
        });
        card.addEventListener("dragover", (ev) => ev.preventDefault());
        card.addEventListener("drop", (ev) => {
          ev.preventDefault();
          const i = route.stops.findIndex((x) => x.recipientId === dragId),
            j = route.stops.findIndex((x) => x.recipientId === r.recipientId);
          if (i < 0 || j < 0 || i === j) return;
          const [row] = route.stops.splice(i, 1);
          route.stops.splice(j, 0, row);
          routeUnsaved = true;
          renumberRoute();
          renderRoute();
        });
      }
      $("routeStops").append(card);
    });
    if (!route.stops.length)
      $("routeStops").append(el("p", "No Approved recipients for this event."));
  }
  function renderSettings() {
    const e = dashboard.event;
    const values = {
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      capacity: e.Capacity,
      startAddress: e.StartAddress,
      status: e.Status,
    };
    Object.entries(values).forEach(
      ([k, v]) => ($("settingsForm").elements[k].value = v),
    );
    $("verifyPickup").disabled = readonly();
    pickupSettings.reset(e.StartAddressStatus);
    $("manualPickup").disabled = readonly();
    $("pickupStatus").textContent = addressReviewed(e.StartAddressStatus)
      ? e.StartAddressStatus === "Manually Reviewed"
        ? "Pickup address manually reviewed (Google validation not performed)."
        : "Pickup address confirmed."
      : "Pickup Address Needs Review";
  }
  function eventPayload(f) {
    return {
      addressReceipt: MealAddresses.receipt(f.elements.startAddress),
      ...Object.fromEntries(
        ["eventName", "deliveryDate", "capacity", "startAddress", "status"].map(
          (n) => [
            n,
            n === "capacity"
              ? Number(f.elements[n].value)
              : f.elements[n].value.trim(),
          ],
        ),
      ),
    };
  }
  async function reports() {
    const old = $("reportEvent").value,
      year = $("reportYear").value;
    $("reportEvent").replaceChildren(el("option", "All events"));
    $("reportEvent").firstChild.value = "";
    events.forEach((e) => {
      const o = el("option", e.EventName + (e.Archived ? " (Archived)" : ""));
      o.value = e.EventID;
      $("reportEvent").append(o);
    });
    $("reportEvent").value = old;
    const years = [...new Set(events.map((e) => e.DeliveryDate.slice(0, 4)))]
      .sort()
      .reverse();
    $("reportYear").replaceChildren(el("option", "All years"));
    $("reportYear").firstChild.value = "";
    years.forEach((y) => {
      const o = el("option", y);
      o.value = y;
      $("reportYear").append(o);
    });
    $("reportYear").value = year;
    const r = await rpc("reports", {
      eventId: $("reportEvent").value,
      year: $("reportYear").value,
    });
    $("reportIntegrityNotice").textContent = integrityMessage(r.integrity);
    metric($("reportTotals"), [
      ["Events", r.totals.events],
      ["Originally Requested Meals", r.totals.originallyRequestedMeals],
      ["Currently Reserved Meals", r.totals.currentlyReservedMeals],
      ["Approved Meals", r.totals.approvedMeals],
      ["Rejected Meals", r.totals.rejectedMeals],
      ["Recipient Records", r.totals.recipientRecords],
      ["Approved Stops", r.totals.approvedStops],
      ["Organizations", r.totals.organizations],
      ["Capacity", r.totals.capacity],
      ["Remaining Capacity", r.totals.remainingCapacity],
      ["Pending Referrals", r.totals.pendingReferrals],
      ["Approved Referrals", r.totals.approvedReferrals],
      ["Rejected Referrals", r.totals.rejectedReferrals],
    ]);
    $("organizationReports").replaceChildren(
      ...r.organizations.map((o) =>
        el(
          "div",
          o.name +
            " — " +
            o.referrals +
            " Referrals · " +
            o.originallyRequestedMeals +
            " Originally Requested Meals · " +
            o.currentMeals +
            " Current Meals",
          "report-row",
        ),
      ),
    );
  }
  document.querySelectorAll("[data-view]").forEach((b) =>
    b.addEventListener("click", () =>
      task(async () => {
        view = b.dataset.view;
        if (view !== "routeView") clearDeliveryPdf();
        ["requestsView", "routeView", "settingsView", "reportsView"].forEach(
          (id) => ($(id).hidden = id !== view),
        );
        document
          .querySelectorAll("[data-view]")
          .forEach((x) => x.setAttribute("aria-selected", String(x === b)));
        if (view === "reportsView") await reports();
      }),
    ),
  );
  $("adminEvents").addEventListener("change", () => task(refresh));
  $("showArchived").addEventListener("change", () =>
    task(async () => {
      eventOptions();
      await refresh();
    }),
  );
  $("refreshAdmin").addEventListener("click", () =>
    task(() => refreshEvents()),
  );
  async function copyPublicLink() {
    const input = $("publicLinkValue");
    try {
      await navigator.clipboard.writeText(input.value);
      $("publicLinkMessage").textContent = "Public link copied. Ready to share.";
    } catch (_) {
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
      $("publicLinkMessage").textContent = "Automatic copying is unavailable in this browser. Copy the selected website link above.";
    }
  }
  $("publicLink").addEventListener("click", () =>
    task(async () => {
      const { url } = await rpc("publicFormLink");
      $("publicLinkValue").value = url;
      $("openPublicLink").href = url;
      $("publicLinkMessage").textContent = "";
      $("publicLinkDialog").showModal();
      await copyPublicLink();
    }),
  );
  $("copyPublicLink").addEventListener("click", () => task(copyPublicLink));
  $("closePublicLink").addEventListener("click", () => $("publicLinkDialog").close());
  $("createEvent").addEventListener("click", () => {
    $("eventEditor").reset();
    pickupCreate.reset();
    $("eventEditorMessage").textContent = "";
    $("eventDialog").showModal();
  });
  $("closeEvent").addEventListener("click", () => $("eventDialog").close());
  $("closeReferral").addEventListener("click", () =>
    $("referralDialog").close(),
  );
  $("addReferral").addEventListener("click", () => task(async () => {
    const pending = pendingCreates.get("createReferral");
    if (pending) {
      const { receipt } = await rpc("submissionReceipt", { submissionId: pending.id });
      if (receipt) {
        retainCreate("createReferral", null);
        await refreshEvents(pending.eventId);
        alert("Your previous referral was saved once. Referral ID: " + receipt.referralId);
        return;
      }
    }
    openReferral(null, false);
    if (pending) $("editorMessage").textContent = "Previous save unconfirmed. Re-enter the same information to retry safely. Recipient details were not stored in this browser.";
  }));
  $("editorAddRecipient").addEventListener("click", () => {
    if ($("editorRecipients").children.length < 100) recipientEditor();
  });
  $("selectAll").addEventListener("click", () => {
    $("requestCards")
      .querySelectorAll('input[type="checkbox"]')
      .forEach(
        (x) =>
          (x.checked =
            dashboard.referrals.find(
              (r) => r.ReferralID === x.dataset.referralId,
            )?.Status === "Pending"),
      );
  });
  $("approveSelected").addEventListener("click", () =>
    task(() => changeStatus(selectedRefs(), "Approved")),
  );
  $("rejectSelected").addEventListener("click", () =>
    task(() => changeStatus(selectedRefs(), "Rejected")),
  );
  $("referralEditor").addEventListener("submit", (e) => {
    e.preventDefault();
    if (busy) return;
    task(async () => {
      if (!(await MealAddresses.prepareAll($("referralEditor")))) return;
      const payload = editorPayload();
      try {
        if (editing) await rpc("editReferral", payload);
        else await createOnce("createReferral", payload);
        $("referralDialog").close();
        await refresh();
      } catch (err) {
        $("editorMessage").textContent = err.message;
        throw err;
      }
    }, e.submitter || e.target.querySelector('button[type="submit"]'));
  });
  $("eventEditor").addEventListener("submit", (e) => {
    e.preventDefault();
    task(async () => {
      try {
        if (!(await MealAddresses.prepareAll($("eventEditor")))) return;
        const event = await createOnce("saveEvent", eventPayload($("eventEditor")));
        $("eventDialog").close();
        await refreshEvents(event.EventID);
      } catch (err) {
        $("eventEditorMessage").textContent = err.message;
        throw err;
      }
    }, e.submitter || e.target.querySelector('button[type="submit"]'));
  });
  $("settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    task(async () => {
      const d = dashboard.event;
      if (!(await MealAddresses.prepareAll($("settingsForm")))) return;
      await rpc("saveEvent", {
        ...eventPayload($("settingsForm")),
        eventId: d.EventID,
        version: d.Version,
      });
      await refreshEvents(d.EventID);
    }, e.submitter || e.target.querySelector('button[type="submit"]'));
  });
  $("archiveEvent").addEventListener("click", () =>
    task(async () => {
      if (
        !confirm(
          "Archive this event? Its records will remain available in Reports.",
        )
      )
        return;
      await rpc("archive", {
        eventId: dashboard.event.EventID,
        version: dashboard.event.Version,
        mode: "archive",
        confirmed: true,
      });
      dashboard = null;
      await refreshEvents();
    }),
  );
  $("reopenEvent").addEventListener("click", () =>
    task(async () => {
      if (
        !confirm(
          "Reopen / Unarchive this event for corrections? This action will be audit logged.",
        )
      )
        return;
      const id = dashboard.event.EventID;
      await rpc("archive", {
        eventId: id,
        version: dashboard.event.Version,
        mode: "reopen",
        confirmed: true,
      });
      await refreshEvents(id);
    }),
  );
  $("manualPickup").addEventListener("click", () => {
    if (
      !confirm(
        "Have you checked the SAVED pickup address and confirmed it is usable? This is manual review, not Google validation.",
      )
    )
      return;
    task(async () => {
      await rpc("manualAddressReview", {
        entity: "event",
        eventId: dashboard.event.EventID,
        version: dashboard.event.Version,
        confirmed: true,
      });
      await refresh();
    });
  });
  $("verifyPickup").addEventListener("click", () =>
    task(() => pickupSettings.check()),
  );
  $("optimizeRoute").addEventListener("click", () =>
    task(async () => {
      route = await rpc("optimize", {
        eventId: route.eventId,
        routeVersion: route.version,
      });
      await refresh();
    }),
  );
  $("saveRoute").addEventListener("click", () =>
    task(async () => {
      route = await rpc("reorder", {
        eventId: route.eventId,
        routeVersion: route.version,
        recipientIds: route.stops.map((r) => r.recipientId),
      });
      routeUnsaved = false;
      renderRoute();
    }),
  );
  function clearDeliveryPdf() {
    if (deliveryPdfUrl) URL.revokeObjectURL(deliveryPdfUrl);
    deliveryPdfUrl = null;
    $("openDeliveryPdf").removeAttribute("href");
    $("downloadDeliveryPdf").removeAttribute("href");
    $("deliveryPdf").hidden = true;
  }
  $("printRoute").addEventListener("click", () => task(async () => {
    if (!route || routeUnsaved || !route.isFinal || !route.stops.length) return;
    clearDeliveryPdf();
    try {
      const pdf = await rpc("deliveryPdf", { eventId: route.eventId, routeVersion: route.version });
      const bytes = Uint8Array.from(atob(pdf.base64), (c) => c.charCodeAt(0));
      deliveryPdfUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      $("openDeliveryPdf").href = deliveryPdfUrl;
      $("downloadDeliveryPdf").href = deliveryPdfUrl;
      $("downloadDeliveryPdf").download = pdf.filename;
      $("deliveryPdf").hidden = false;
      $("openDeliveryPdf").focus();
    } catch (error) {
      if (error.code === "CONFLICT") await refresh();
      throw error;
    }
  }));
  window.addEventListener("pagehide", clearDeliveryPdf);
  ["reportEvent", "reportYear"].forEach((id) =>
    $(id).addEventListener("change", () => task(reports)),
  );
  task(async () => {
    const identity = await rpc("identity");
    $("adminIdentity").textContent =
      identity.email + " · " + identity.environment;
    await refreshEvents();
  });
})();
```

## File 16: AddressClient.html

SHA-256: c154a5e62901bf8498eed59987b50880d9cacd854ae29ccdb7f4c00a524914d8

Copy only the contents of this code box into the matching Apps Script file.

```javascript
/* Shared public/admin address controls. Address data and receipts stay in memory. */
"use strict";
window.MealButtonFeedback = (() => {
  const active = new WeakMap();
  let clicked = null;
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("button");
    if (!button) return;
    if (active.has(button)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    clicked = button;
    button.setAttribute("data-click-feedback", "true");
    setTimeout(() => button.removeAttribute("data-click-feedback"), 250);
    setTimeout(() => { if (clicked === button) clicked = null; }, 0);
  }, true);
  function begin(button) {
    if (!button || active.has(button)) return () => {};
    const before = ["aria-busy", "aria-disabled", "aria-label"].map(name => [name, button.getAttribute(name)]);
    active.set(button, true);
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("aria-label", button.textContent.trim() + " — Loading");
    return () => {
      active.delete(button);
      for (const [name, value] of before)
        if (value == null) button.removeAttribute(name);
        else button.setAttribute(name, value);
    };
  }
  return { begin, current: () => clicked };
})();
window.MealAddresses = (() => {
  const states = new WeakMap();
  let counter = 0;
  const node = (tag, text) => {
    const n = document.createElement(tag);
    if (text != null) n.textContent = text;
    return n;
  };
  function choose(result) {
    return new Promise((resolve) => {
      const d = node("dialog"),
        heading = node("h2", "Check this address");
      d.className = "address-check";
      heading.id = "address-check-" + ++counter;
      d.setAttribute("aria-labelledby", heading.id);
      d.append(
        heading,
        node(
          "p",
          result.confident
            ? "Please confirm the address for delivery."
            : "This address could not be confidently confirmed. You may edit it or keep it for administrator review.",
        ),
      );
      if (result.unitIssue)
        d.append(
          node(
            "p",
            "Apartment / suite / unit information needs review. Your entered unit has been preserved.",
          ),
        );
      d.append(node("h3", "You entered:"), node("p", result.original));
      if (result.recommended)
        d.append(
          node("h3", "Recommended:"),
          node("p", result.recommended),
          attribution(),
        );
      const actions = node("div");
      actions.className = "actions";
      const finish = (value) => {
        d.close();
        d.remove();
        resolve(value);
      };
      for (const [label, value] of [
        ["Use Recommended", "recommended"],
        ["Keep What I Entered", "original"],
        ["Edit", "edit"],
      ]) {
        if (value === "recommended" && !result.recommended) continue;
        const b = node("button", label);
        b.type = "button";
        b.addEventListener("click", () => finish(value));
        actions.append(b);
      }
      d.append(actions);
      d.addEventListener("cancel", (e) => {
        e.preventDefault();
        finish("edit");
      });
      document.body.append(d);
      d.showModal();
    });
  }
  function attribution() {
    const n = node("span");
    const logo = node("img");
    logo.alt = "Google Maps";
    logo.height = 18;
    logo.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAAASCAYAAACghwvPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABDBJREFUeNrcWI1R4lAQjgwFhAouVHBQwYUKDA0oVACpQKkArIBoA8QKEiswHZir4GIF3q7z7c3nmxci3gwyvJk3Itl9b3++/XbDRUDr6uoqlj8L2UnwceWy7x8eHvLgG5fYN5I/a/0stkyCM1o9clIdLDxJCPDdTmS232xvKDvG/moyb3V3yISQmx01EUjCEt9VsqeyB4K6C3wuzwh8N7o7gryG3PWxjOqDjiwJmQR/zgKgo1wNl8/ZGSVkLT7l4lPjob/ZsY3poSfoqmWnbYJdSdCEyo4+QQ0qF3bIRADIIZQTIYiH0NyypRqOvi7E+Dd8TiXYmwOdD2E4I6jGWTkHCXKJIzcXudLTjC0JDWgxBGU+oo8FoE3VSaATkc6qzRf4W+FM1RmKbE1n7XCn2lDaUOC554Of8rzAua8AdwhbMtjTUBuY4XmA52mfbKw8RhctOVDZFYLiojBCY9cgZ0jWM13cUBAKeT5VZ5CEguQMtZy8R8c+CxwnNwLtNHuqWG24k71FcKdONaSw2XePASeGnxOAiYeICneMUHVq05R6cY0ExEhK1OsAfdyyjUctCXMgdIALdG2pYgwdavQAcpXj/JqQP8R5Y+jta6oWHB0uhhi1rQeEHVSrdyWgy1sETPukC0oLnPo5QZVYL104sqo/hsyQ7kgoXnqGVpP6p5V7z4nw8evE2YywS7o4g3MN0NTQ2GuIXhkNQc5QaP0gJrkachWQ2/ZOYTSxwiT0h+6rneryrZQSuoDdqSdpRouXyhJgikuq2n+VxsMO/Fzh31+wKQATrJEc9TfrEYIWLoI0cLwpWE8k9tvRaQjtERlaOXK1U3k8pfEq9zRbWwVKPgRYxkBlvS8L8CkHCFX3zp2ikPQZqCnpAG7VQoMmn8K+CPbqmS96fo8QF+0rZyrdgJKn64engceEysYNNjXwwD0PKAl8SWpxkCe+ARBZHzBzWAXUotv2ondNFGzUNPbIjfYARs9/rxjQ7gS09E7fPaDCJgzN/LNmCOOgvmEmKMUbyGyoVN915PmSkrCjQOVOxSWUhB0ZWBHytza60k8uQQtd1HyXOgqdF5R+FzVZZY4RmK6Vd4y5IRoyg9Li9gRaU9tCsExqE1wfxqTy8BVKEaYJ38qgrDob0bkGCtZsAI3DGpgUMiNMGe6Zc0KmTU2FR8635jS5vTg6MfFzVzKqDhFLuN5R4r62d6YlwFCBykKMwTpB/oRdCvac4lL3yJhbasiNBwlT962bysulianTwN1Gb9w/pgZeQS53zqocOiqteqA79vSRDJOJb+IqW7h8n5xxe0jBnXvOKpH8iN4VMhtMAOINvUzG0Jme1G8OoMSR851W25vs3Sn/XgIbi//+9fUEHNmCErfWyFHiM9/L3Lmt/gnZcoey9/F95VDW2a2TqQjqEYfw/Skt7Q33X1X+K8AAJX03+VzRIA4AAAAASUVORK5CYII=";
    n.append(logo);
    n.className = "address-attribution";
    n.setAttribute("translate", "no");
    return n;
  }
  function attach(
    input,
    call,
    context = () => ({}),
    initialStatus = "Needs Review",
  ) {
    if (states.has(input)) return states.get(input);
    const label = input.parentElement,
      holder = node("div");
    holder.className =
      "address-entry" + (label.classList.contains("full") ? " full" : "");
    label.replaceWith(holder);
    holder.append(label);
    const list = node("div"),
      status = node("p"),
      check = node("button", "Check Address");
    list.className = "address-suggestions";
    list.id = "address-list-" + ++counter;
    list.hidden = true;
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", "Google address suggestions");
    status.className = "hint address-state";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    check.type = "button";
    check.className = "secondary address-check-button";
    holder.append(list, check, status);
    const privacy = node(
      "p",
      "Address search and checking send only this address text to Google. Keep recipient names and delivery notes in their separate fields.",
    );
    privacy.className = "hint";
    holder.append(privacy);
    input.setAttribute("autocomplete", "off");
    input.setAttribute("aria-controls", list.id);
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-autocomplete", "list");
    let revision = 0,
      timer,
      session = null,
      features = null,
      configRequest = null,
      suggesting = false,
      lastSuggestionAt = 0,
      receipt = "",
      checked = input.value.trim(),
      running = null;
    const labelStatus = (s) =>
      s === "Confirmed"
        ? "Address Verified"
        : s === "Manually Reviewed"
          ? "Address manually reviewed"
          : "Needs Review";
    status.textContent = labelStatus(initialStatus);
    const clear = () => {
      list.hidden = true;
      list.replaceChildren();
      input.setAttribute("aria-expanded", "false");
    };
    const reset = (s = "Needs Review") => {
      revision++;
      clearTimeout(timer);
      timer = null;
      session = null;
      receipt = "";
      checked = input.value.trim();
      status.textContent = labelStatus(s);
      clear();
    };
    async function config() {
      if (features) return features;
      if (!configRequest)
        configRequest = call("addressConfig", {}).then(
          (value) => (features = value),
          (error) => { configRequest = null; throw error; },
        );
      return configRequest;
    }
    async function validate(candidate) {
      if (running) return running;
      const original = input.value.trim(),
        rev = revision;
      if (!original) return true;
      const finishFeedback = MealButtonFeedback.begin(check);
      clear();
      clearTimeout(timer);
      timer = null;
      running = (async () => {
        let result;
        try {
          if (!(await config()).validation) {
            checked = original;
            receipt = "";
            status.textContent =
              "Needs Review — address checking is currently unavailable.";
            return true;
          }
          status.textContent = "Checking address…";
          result = await call("addressPreview", {
            ...context(),
            address: original,
            candidate: candidate || original,
            sessionToken: session || "",
          });
        } catch (_) {
          result = { original, confident: false };
        } finally {
          session = null;
        }
        if (
          rev !== revision ||
          input.value.trim() !== original ||
          !input.isConnected
        )
          return false;
        let choice = "original";
        if (!result.confident || !result.equivalent)
          choice = await choose(result);
        if (rev !== revision || !input.isConnected) return false;
        if (choice === "edit") {
          checked = "";
          receipt = "";
          status.textContent =
            "Needs Review — edit the address and check again.";
          input.focus();
          return false;
        }
        if (choice === "recommended") {
          input.value = result.recommended;
          receipt = result.recommendedReceipt || "needs-review";
        } else receipt = result.originalReceipt || "needs-review";
        checked = input.value.trim();
        status.textContent =
          result.confident && (choice === "recommended" || result.equivalent)
            ? "Address Verified"
            : "Needs Review";
        return true;
      })();
      try {
        return await running;
      } finally {
        running = null;
        finishFeedback();
      }
    }
    function selectSuggestion(address) {
      if (running) return;
      const entered = input.value.trim();
      const units = (value) => value.match(
        /(?:\b(?:apartment|apt|suite|ste|unit|floor|fl|building|bldg|room|rm)\.?\s*|#\s*)[a-z0-9][a-z0-9 -]*/gi,
      ) || [];
      const enteredUnits = units(entered), selectedUnits = units(address);
      const key = (parts) => parts.map(x => x.toLowerCase().replace(/\./g, "")
        .replace(/\b(?:apartment|apt)\b/g, "apt")
        .replace(/\b(?:suite|ste)\b/g, "suite").replace(/\s+/g, " ").trim()).sort().join("|");
      // A conflicting unit still needs the original-versus-recommended review.
      if (enteredUnits.length && selectedUnits.length && key(enteredUnits) !== key(selectedUnits))
        return validate(address);
      input.value = address + (enteredUnits.length && !selectedUnits.length
        ? ", " + enteredUnits.join(", ") : "");
      revision++;
      receipt = "";
      checked = "";
      // Clicking a suggestion explicitly selects it. Validate that selected value now.
      return validate();
    }
    function scheduleSuggestions() {
      if (timer || suggesting || running || input.value.trim().length < 4 ||
          input.disabled || !input.isConnected || document.activeElement !== input) return;
      // Start during typing; coalesce edits and allow only one request in flight.
      const delay = Math.max(150, 1000 - (Date.now() - lastSuggestionAt));
      timer = setTimeout(() => {
        timer = null;
        suggest(revision);
      }, delay);
    }
    async function suggest(rev) {
      const address = input.value.trim();
      if (address.length < 4 || input.disabled || suggesting || running ||
          !input.isConnected || document.activeElement !== input) return;
      suggesting = true;
      try {
        if (!(await config()).autocomplete || rev !== revision) return;
        session ||= crypto.randomUUID();
        lastSuggestionAt = Date.now();
        status.textContent = "Searching addresses…";
        const data = await call("addressSuggestions", {
          ...context(),
          address,
          sessionToken: session,
        });
        if (
          rev !== revision ||
          running || checked === input.value.trim() ||
          !input.isConnected ||
          document.activeElement !== input
        )
          return;
        clear();
        for (const suggestion of data.suggestions || []) {
          const b = node("button", suggestion.address);
          b.type = "button";
          b.className = "address-suggestion";
          // Keep Safari/touch blur from removing the button before its click.
          b.addEventListener("pointerdown", (event) => event.preventDefault());
          b.addEventListener("click", () => selectSuggestion(suggestion.address));
          b.addEventListener("keydown", (e) => {
            const buttons = [...list.querySelectorAll("button")],
              at = buttons.indexOf(b);
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              buttons[
                (at + (e.key === "ArrowDown" ? 1 : buttons.length - 1)) %
                  buttons.length
              ].focus();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              clear();
              input.focus();
            }
          });
          list.append(b);
        }
        if (list.children.length) {
          list.append(attribution());
          list.hidden = false;
          input.setAttribute("aria-expanded", "true");
        }
      } catch (_) {
        if (rev === revision) {
          clear();
          status.textContent =
            "Suggestions unavailable. Enter the full address; it can still be submitted.";
        }
      } finally {
        suggesting = false;
        if (rev !== revision) scheduleSuggestions();
        else if (!running && status.textContent === "Searching addresses…")
          status.textContent = "Needs Review";
      }
    }
    input.addEventListener("focus", () => {
      // Warm configuration before the first address-search request.
      config().catch(() => {});
    });
    input.addEventListener("input", () => {
      revision++;
      receipt = "";
      checked = "";
      clear();
      status.textContent = suggesting ? "Searching addresses…" : "Needs Review";
      scheduleSuggestions();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") clear();
      if (e.key === "ArrowDown" && !list.hidden) {
        e.preventDefault();
        list.querySelector("button")?.focus();
      }
    });
    holder.addEventListener("focusout", (e) => {
      if (!holder.contains(e.relatedTarget)) clear();
    });
    check.addEventListener("click", () => validate());
    const state = {
      reset,
      check: () => validate(),
      prepare: () =>
        running ||
        (checked === input.value.trim() ? Promise.resolve(true) : validate()),
      receipt: () => (checked === input.value.trim() ? receipt : ""),
    };
    states.set(input, state);
    return state;
  }
  async function prepareAll(root) {
    for (const input of root.querySelectorAll(
      '[name="address"], [name="startAddress"]',
    ))
      if (
        !input.disabled &&
        states.has(input) &&
        !(await states.get(input).prepare())
      )
        return false;
    return true;
  }
  return {
    attach,
    prepareAll,
    receipt: (input) => states.get(input)?.receipt() || "",
    reset: (input, status) => states.get(input)?.reset(status),
  };
})();
```

## File 17: AdminStyles.html

SHA-256: e4d7e970bd0bc5a3d03df8a121192cda94e588c750d74d6e6c91609dc7347acf

Copy only the contents of this code box into the matching Apps Script file.

```css
:root {
  --navy: #15324d;
  --blue: #1668ad;
  --green: #126c56;
  --red: #9d2222;
  --border: #ccd7e1;
  --muted: #526478;
  --paper: #f3f6f9;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: var(--navy);
  background: var(--paper);
  font-size: 16px;
  line-height: 1.5;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
h1 {
  font-size: clamp(1.75rem, 5vw, 2.4rem);
  line-height: 1.2;
}
h2 {
  font-size: 1.35rem;
}
h3 {
  font-size: 1.1rem;
}
h1,
h2,
h3,
p,
legend {
  overflow-wrap: anywhere;
}
.stop header h3 {
  min-width: 0;
  flex: 1;
}
.page-wrap {
  width: min(100% - 2rem, 1040px);
  margin: auto;
  padding: 1.5rem 0;
}
.narrow {
  max-width: 640px;
}
.site-header {
  background: var(--navy);
  color: white;
}
.site-header p {
  margin: 0.4rem 0;
}
.eyebrow {
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
}
.event-panel,
fieldset,
.stop,
.request-card,
.panel {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: white;
  padding: 1.25rem;
  margin: 0 0 1.25rem;
  min-width: 0;
}
.event-panel {
  border-left: 5px solid var(--green);
}
legend {
  font-weight: 750;
  font-size: 1.2rem;
  padding: 0 0.4rem;
}
label {
  display: block;
  font-weight: 650;
}
input,
select,
textarea,
button {
  font: inherit;
}
input,
select,
textarea {
  display: block;
  width: 100%;
  margin: 0.35rem 0 0;
  border: 1px solid #8e9eae;
  border-radius: 6px;
  padding: 0.7rem;
  min-height: 46px;
  background: white;
  color: var(--navy);
}
textarea {
  resize: vertical;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.full {
  grid-column: 1/-1;
}
button,
.button {
  display: inline-block;
  min-height: 46px;
  border: 0;
  border-radius: 7px;
  padding: 0.7rem 1rem;
  background: var(--blue);
  color: white;
  cursor: pointer;
  text-decoration: none;
  font-weight: 650;
}
button.secondary {
  background: #e8eef4;
  color: var(--navy);
}
button.danger {
  background: var(--red);
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
:focus-visible {
  outline: 3px solid #efb718;
  outline-offset: 3px;
}
.hint {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--muted);
}
.capacity {
  font-size: 1.2rem;
}
.capacity strong {
  font-size: 1.75rem;
}
.totals,
.metrics,
.actions,
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin: 1rem 0;
}
.totals {
  background: #e1eef5;
  padding: 1rem;
  border-radius: 8px;
  justify-content: space-between;
}
.warning {
  color: var(--red);
  font-weight: 650;
}
.badge {
  display: inline-block;
  background: #fff0cc;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
  font-size: 0.875rem;
}
.request-card header,
.stop header {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
}
.request-card h3,
.stop h3 {
  margin: 0.3rem 0;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.check-label input {
  width: 22px;
  min-height: 22px;
  margin: 0;
}
.metrics span {
  background: #e8eef4;
  border-radius: 7px;
  padding: 0.6rem 1rem;
}
.tabs button[aria-selected="true"] {
  background: var(--navy);
}
.recipient-card .remove {
  margin-bottom: 1rem;
}
.stop dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 0.7rem;
}
.stop dt {
  font-weight: 650;
}
.stop dd {
  margin: 0;
  overflow-wrap: anywhere;
}
a {
  color: #105a9b;
  overflow-wrap: anywhere;
}
dialog {
  width: min(95vw, 800px);
  max-height: 90dvh;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  color: var(--navy);
}
dialog::backdrop {
  background: #132a42a6;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}
.dialog-header h2 {
  margin: 0;
}
.print-check {
  display: none;
}
.hidden,
[hidden] {
  display: none !important;
}
.busy {
  opacity: 0.65;
}
.report-row {
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border);
}
#adminMessage,
#submissionMessage {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.print-route-title {
  display: none;
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .page-wrap {
    width: calc(100% - 1.4rem);
  }
  .event-panel,
  fieldset,
  .stop,
  .request-card,
  .panel {
    padding: 1rem;
  }
  .actions button {
    flex: 1 1 auto;
  }
  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .tabs button {
    padding: 0.65rem 0.4rem;
  }
  .metrics {
    gap: 0.4rem;
  }
  .metrics span {
    flex: 1 1 40%;
    padding: 0.5rem;
  }
  .stop dl {
    grid-template-columns: 1fr;
  }
  .stop dd {
    margin-bottom: 0.45rem;
  }
  dialog {
    padding: 1rem;
  }
}
@media print {
  @page {
    size: letter;
    margin: 0.55in;
  }
  :root {
    background: white;
    color: black;
    font-size: 11pt;
  }
  body {
    background: white;
  }
  .site-header,
  .no-print,
  nav,
  footer,
  dialog,
  #adminMessage,
  #requestsView,
  #settingsView,
  #reportsView {
    display: none !important;
  }
  main.page-wrap {
    width: 100%;
    padding: 0;
  }
  #routeView {
    display: block !important;
  }
  #routeView .actions,
  #routeView button,
  .route-status {
    display: none !important;
  }
  .print-route-title {
    display: block;
  }
  .stop {
    border: 1px solid #888;
    border-radius: 0;
    break-inside: avoid;
    page-break-inside: avoid;
    margin: 0 0 0.15in;
    padding: 0.12in;
  }
  .stop header {
    gap: 0.1in;
  }
  .stop h3 {
    font-size: 12pt;
  }
  .print-check {
    display: inline-block;
    width: 13pt;
    height: 13pt;
    border: 1.2pt solid black;
    flex: none;
  }
  .stop dl {
    display: block;
    margin: 0.04in 0;
  }
  .stop dt,
  .stop dd {
    display: inline;
    margin: 0;
  }
  .stop dt {
    margin-right: 0.2em;
  }
  .stop dd::after {
    content: "";
    display: block;
  }
  .stop a {
    color: black;
    text-decoration: none;
  }
  .stop .address {
    margin: 0.04in 0;
  }
  .stop .badge {
    display: none;
  }
  .route-header {
    break-after: avoid;
  }
  .route-header h2 {
    margin: 0.05in 0;
  }
  .page-wrap {
    margin: 0;
  }
  #routeStops {
    display: block;
  }
  .stop .no-print {
    display: none !important;
  }
}

.address-entry {
  min-width: 0;
  position: relative;
}
.address-suggestions {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  margin: 0.35rem 0;
  padding: 0.3rem;
}
.address-suggestion {
  display: block;
  width: 100%;
  text-align: left;
  background: white;
  color: var(--navy);
  border-radius: 0;
  border-bottom: 1px solid var(--border);
  overflow-wrap: anywhere;
}
.address-suggestion:focus-visible {
  background: #e1eef5;
}
.address-attribution {
  display: block;
  white-space: nowrap;
  font:
    400 1rem Roboto,
    sans-serif;
  letter-spacing: normal;
  color: #5e5e5e;
  padding: 10px 10px 5px;
}
.address-state {
  margin: 0.4rem 0;
}
.address-check-button {
  margin-top: 0.35rem;
}
.address-check p {
  overflow-wrap: anywhere;
}
@media print {
  .address-entry,
  .address-check {
    display: none !important;
  }
}

.request-recipient-list { padding-left: 1.5rem; margin: 1rem 0; }
.request-recipient-list li { padding: .65rem .25rem; border-bottom: 1px solid #dbe2e8; overflow-wrap: anywhere; }
.request-recipient-list li:last-child { border-bottom: 0; }
.request-recipient-list p { margin: .25rem 0; }

button[data-click-feedback="true"] { outline: 3px solid #78a9da; outline-offset: 2px; }
button[aria-busy="true"] { cursor: wait; opacity: .8; }
button[aria-busy="true"]::before {
  content: ""; display: inline-block; width: .85em; height: .85em;
  margin-right: .5em; border: 2px solid currentColor; border-right-color: transparent;
  border-radius: 50%; vertical-align: -.1em; animation: meal-button-spin .8s linear infinite;
}
button[aria-busy="true"]::after { content: " — Loading…"; }
@keyframes meal-button-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { button[aria-busy="true"]::before { animation: none; } }

/* Printing uses a freshly verified saved route. Direct browser print is safe. */
.print-verification-warning { display: none; }
@media print {
  body:not(.route-print-ready) #routeView > :not(.print-verification-warning) { display: none !important; }
  body:not(.route-print-ready) .print-verification-warning { display: block !important; }
}
```

## File 18: appsscript.json

SHA-256: 562a065b0daf2b8a887929dc61414e4c414f4150f830d367569fc2455127b749

Copy only the contents of this code box into the matching Apps Script file.

```json
{
  "timeZone": "America/New_York",
  "exceptionLogging": "NONE",
  "runtimeVersion": "V8",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Sheets",
        "serviceId": "sheets",
        "version": "v4"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/cloud-platform"
  ],
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "ANYONE"
  }
}
```
