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
    "Status",
    "RejectionReason",
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
// Identify the protected workbook without embedding its raw identifier in the source.
const RESTRICTED_SHARED_SHEET_FINGERPRINT_ = "5bd31a8dd6f9ceaf970ee0eb4a45b2e3f2b4ab9d5779047f8a27ef4ce82761f4";
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
    fingerprint_(id) === RESTRICTED_SHARED_SHEET_FINGERPRINT_ &&
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
  return recipientRequests_(s).map(({ row }) => row);
}
// Blank status on pre-upgrade rows inherits the original submission decision.
// Never roll child decisions back up into REFERRALS.Status.
function recipientRequests_(s, eventId) {
  const events = new Set(s.EVENTS.map(e => e.EventID));
  const parents = new Map(s.REFERRALS.map(r => [r.ReferralID, r]));
  return s.RECIPIENTS.flatMap(row => {
    const parent = parents.get(row.ReferralID);
    if (!parent || parent.EventID !== row.EventID || !events.has(row.EventID) ||
        (eventId && eventId !== row.EventID)) return [];
    return [{ row, parent, status: row.Status || parent.Status }];
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
  // Keep the original receipt recoverable even after an authorized deletion.
  // Count only distinct, missing IDs recorded for this referral in its audit log.
  const knownIds = new Set(children.map(r => r.RecipientID));
  if (parent && knownIds.size < Number(parent.OriginalRecipientCount)) {
    for (const a of s.AUDITLOG) {
      if (a.Action !== "Recipient Permanently Deleted" || a.EntityType !== "Recipient") continue;
      let old;
      try { old = JSON.parse(a.OldValue); } catch (_) { continue; }
      if (old?.ReferralID === parent.ReferralID && old.Status === "Rejected") knownIds.add(a.EntityID);
    }
  }
  if (!parent || !s.EVENTS.some(e => e.EventID === parent.EventID) ||
      !["Pending", "Approved", "Rejected"].includes(parent.Status) ||
      knownIds.size !== Number(parent.OriginalRecipientCount) ||
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
function commit_(s, deleteRecipientId) {
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
    if (originals.size) {
      if (name !== "RECIPIENTS" || originals.size !== 1 ||
          !originals.has(deleteRecipientId))
        fail_("INTEGRITY", "Record deletion is not supported.");
      const index = m.positions[deleteRecipientId];
      requests.push({ deleteDimension: { range: {
        sheetId: m.sheetId, dimension: "ROWS", startIndex: index, endIndex: index + 1,
      } } });
    }
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
function locked_(fn, deleteRecipientId) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000))
    fail_(
      "BUSY",
      "The system is busy. Please try again using the same submission.",
    );
  try {
    const s = load_();
    const value = fn(s);
    commit_(s, deleteRecipientId);
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
