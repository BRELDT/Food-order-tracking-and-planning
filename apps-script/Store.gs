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
  const orphans = s.RECIPIENTS.filter(r => ids.has(r.EventID) && !linked.has(r.RecipientID));
  const affected = new Set(orphans.map(r => r.ReferralID));
  const reviewedRecipients = new Set(), reviewedSubmissions = new Set();
  // An audit entry suppresses only exact owner-confirmed historical test IDs.
  // It does not affect records, referral accounting, or receipt validation.
  (s.AUDITLOG || []).forEach(entry => {
    if (entry.Action !== "Historical Test Orphans Reviewed" ||
        entry.EntityType !== "Event" || !ids.has(entry.EntityID)) return;
    let review;
    try { review = JSON.parse(entry.NewValue); } catch (_) { return; }
    if (!review || review.kind !== "historical-test-orphan-exclusion" ||
        review.version !== 1 || review.eventId !== entry.EntityID ||
        !Array.isArray(review.recipientIds) || !Array.isArray(review.submissionIds))
      return;
    const eligible = orphans.filter(r => r.EventID === entry.EntityID);
    const eligibleIds = new Set(eligible.map(r => r.RecipientID));
    const eligibleRefs = new Set(eligible.map(r => r.ReferralID));
    const eligibleSubmissions = new Set(s.SUBMISSIONS.filter(r =>
      eligibleRefs.has(r.ReferralID)).map(r => r.SubmissionID));
    review.recipientIds.forEach(id => { if (eligibleIds.has(id)) reviewedRecipients.add(id); });
    review.submissionIds.forEach(id => { if (eligibleSubmissions.has(id)) reviewedSubmissions.add(id); });
  });
  const outstanding = orphans.filter(r => !reviewedRecipients.has(r.RecipientID));
  return {
    recipientRecords: outstanding.length,
    mealQuantities: outstanding.reduce((n, r) => n + (Number(r.MealCount) || 0), 0),
    submissionRecords: s.SUBMISSIONS.filter(r =>
      affected.has(r.ReferralID) && !reviewedSubmissions.has(r.SubmissionID)).length,
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
