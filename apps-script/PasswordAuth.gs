const PASSWORD_ROUNDS_ = 600000;
const PASSWORD_COLUMNS_ = ["PasswordVerifier", "CredentialVersion", "SetupVerifier", "SetupExpiresAt"];
const PASSWORD_IDLE_MS_ = 30 * 60 * 1000;
const PASSWORD_MAX_MS_ = 8 * 60 * 60 * 1000;

function passwordEnabled_() {
  return properties_().getProperty("MEALS_PASSWORD_LOGIN") === "true";
}

function passwordConfig_() {
  const p = properties_();
  const owner = String(p.getProperty("MEALS_PASSWORD_OWNER") || "").trim().toLowerCase();
  const key = p.getProperty("MEALS_PASSWORD_KEY") || "";
  const url = p.getProperty("MEALS_PASSWORD_URL") || "";
  if (!passwordEnabled_() || !/^[a-f0-9]{64}$/.test(key) ||
      !/^[^@\s]+@[^@\s]+$/.test(owner) ||
      !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url) ||
      String(Session.getEffectiveUser().getEmail() || "").toLowerCase() !== owner)
    fail_("AUTH", "Username sign-in is unavailable.");
  return { key, url, owner };
}

function passwordOwner_() {
  const cfg = passwordConfig_();
  if (identity_() !== cfg.owner)
    fail_("FORBIDDEN", "Only the program owner can manage username accounts.");
  const registry = passwordRegistry_();
  admin_({ ADMINUSERS: registry.rows.slice(1).map(([Email, Active, Role]) =>
    ({ Email, Active, Role })) });
  return { cfg, registry };
}

function passwordName_(value) {
  if (typeof value !== "string" || value.length > 64) return "";
  const name = value.trim().toLowerCase();
  return /^[a-z][a-z0-9_-]{2,31}$/.test(name) ? name : "";
}

function passwordInput_(value) {
  if (typeof value !== "string" || value.length > 256) return false;
  try {
    return Array.from(value).length >= 15 &&
      sjcl.bitArray.bitLength(sjcl.codec.utf8String.toBits(value)) <= 2048;
  } catch (_) {
    return false;
  }
}

function passwordMac_(cfg, purpose, input) {
  return Utilities.computeHmacSha256Signature(purpose + ":" + input, cfg.key)
    .map(b => (b & 255).toString(16).padStart(2, "0")).join("");
}

function passwordRandom_(cfg, purpose) {
  // Use the independently generated secret for unpredictability. UUIDs provide uniqueness.
  return passwordMac_(cfg, purpose, uuid_() + ":" + uuid_());
}

function passwordEqual_(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function passwordDerive_(password, salt) {
  return sjcl.codec.hex.fromBits(
    sjcl.misc.pbkdf2(password, sjcl.codec.hex.toBits(salt), PASSWORD_ROUNDS_, 256)
  );
}

function passwordLocked_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) fail_("BUSY", "Sign-in is busy. Try again shortly.");
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function passwordRegistry_() {
  const db = database_();
  const sheet = db.getSheetByName("ADMINUSERS");
  const headers = MEAL_SCHEMA.ADMINUSERS.concat(PASSWORD_COLUMNS_);
  if (!sheet) fail_("CONFIG", "Username accounts are unavailable.");
  const rows = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length).getValues();
  if (JSON.stringify(rows[0]) !== JSON.stringify(headers))
    fail_("CONFIG", "Username accounts are unavailable.");
  return { db, sheet, rows };
}

function passwordRow_(registry, name) {
  const id = "local:" + name;
  const rows = registry.rows;
  const index = rows.findIndex((row, i) => i > 0 && row[0] === id);
  if (index < 0) return null;
  if (rows.some((row, i) => i !== index && row[0] === id))
    fail_("CONFIG", "Username accounts are unavailable.");
  const [, active, role, verifier, version, setup, setupExpires] = rows[index];
  return { index, id, active: (active === true || active === "true") && role === "admin",
    verifier, version, setup, setupExpires };
}

function passwordWriteRow_(registry, index, values) {
  const row = { values: values.map(cell_) };
  const sheetId = registry.sheet.getSheetId();
  const request = index == null
    ? { appendCells: { sheetId, rows: [row], fields: "userEnteredValue" } }
    : { updateCells: { start: { sheetId, rowIndex: index, columnIndex: 0 },
        rows: [row], fields: "userEnteredValue" } };
  Sheets.Spreadsheets.batchUpdate({ requests: [request] }, registry.db.getId());
}

// Run once from the editor on a staging copy, then separately at approved rollout.
function setupPasswordColumns_() {
  const cfg = passwordConfig_();
  if (identity_() !== cfg.owner) fail_("FORBIDDEN", "Use the owner account.");
  return passwordLocked_(() => {
    const db = database_();
    const sheet = db.getSheetByName("ADMINUSERS");
    const headers = sheet.getRange(1, 1, 1, 7).getValues()[0];
    const expected = MEAL_SCHEMA.ADMINUSERS.concat(PASSWORD_COLUMNS_);
    if (JSON.stringify(headers) === JSON.stringify(expected)) return;
    if (JSON.stringify(headers.slice(0, 3)) !== JSON.stringify(MEAL_SCHEMA.ADMINUSERS) ||
        headers.slice(3).some(Boolean) || sheet.getLastColumn() > 3)
      fail_("CONFIG", "Unexpected ADMINUSERS columns. Nothing was changed.");
    Sheets.Spreadsheets.batchUpdate({ requests: [{
      updateCells: {
        start: { sheetId: sheet.getSheetId(), rowIndex: 0, columnIndex: 3 },
        rows: [{ values: PASSWORD_COLUMNS_.map(cell_) }],
        fields: "userEnteredValue",
      },
    }] }, db.getId());
  });
}

function passwordReserveAttempt_(cfg, name, kind) {
  const key = "MEALS_PASSWORD_ATTEMPTS";
  const user = passwordMac_(cfg, "attempt", kind + ":" + name).slice(0, 24);
  const p = properties_();
  const currentRate = () => {
    const slot = Math.floor(Date.now() / 300000);
    let rate = JSON.parse(p.getProperty(key) || "null");
    if (!rate || rate.slot !== slot) rate = { slot, count: 0, users: {} };
    if (rate.count >= 25 || (rate.users[user] || 0) >= 5)
      fail_("RATE_LIMIT", "Too many attempts. Wait a few minutes and try again.");
    return rate;
  };
  currentRate();
  passwordLocked_(() => {
    const rate = currentRate();
    rate.count++;
    rate.users[user] = (rate.users[user] || 0) + 1;
    p.setProperty(key, JSON.stringify(rate));
  });
}

function passwordSessionKey_(name) {
  return "MEALS_PASSWORD_SESSION:" + name;
}

function passwordReject_() {
  fail_("AUTH", "Your session ended. Sign in again.");
}

function passwordSessionRecord_(token) {
  const cfg = passwordConfig_();
  const match = typeof token === "string" && token.length <= 97 &&
    /^([a-z][a-z0-9_-]{2,31})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return null;
  const name = match[1];
  const key = passwordSessionKey_(name);
  const session = JSON.parse(properties_().getProperty(key) || "null");
  if (!session || !passwordEqual_(session.digest, passwordMac_(cfg, "session", token)))
    return null;
  return { name, key, session };
}

function passwordSession_(token) {
  const record = passwordSessionRecord_(token);
  if (!record) passwordReject_();
  const { name, key, session } = record;
  const now = Date.now();
  if (now >= session.expires || now >= session.seen + PASSWORD_IDLE_MS_)
    passwordReject_();
  const row = passwordRow_(passwordRegistry_(), name);
  if (!row || !row.active || !row.verifier || row.version !== session.version)
    passwordReject_();
  return { id: row.id, name, key, session };
}

function passwordRefreshSession_(token) {
  const auth = passwordSession_(token);
  if (Date.now() >= auth.session.seen + 60000) {
    passwordLocked_(() => {
      const { key, session } = passwordSession_(token);
      session.seen = Date.now();
      properties_().setProperty(key, JSON.stringify(session));
    });
  }
  return auth;
}

function passwordAccountAction(action, username) {
  return safeBoundary_(() => passwordLocked_(() => {
    const { cfg, registry } = passwordOwner_();
    const name = passwordName_(username);
    if (!name || !["setup", "disable"].includes(action))
      fail_("INVALID", "Use 3–32 letters, numbers, underscores or dashes, starting with a letter.");
    const row = passwordRow_(registry, name);
    if (action === "disable" && !row)
      fail_("INVALID", "That username has not been set up.");
    const code = action === "setup" ? passwordRandom_(cfg, "setup code") : "";
    const version = passwordRandom_(cfg, "credential version");
    passwordWriteRow_(registry, row?.index, [
      "local:" + name, action === "setup", "admin", "", version,
      code ? passwordMac_(cfg, "setup verifier", name + ":" + code) : "",
      code ? Date.now() + 60 * 60 * 1000 : "",
    ]);
    return code ? { username: name, code, url: cfg.url + "?page=password" } : { username: name };
  }));
}

function passwordAccountAccess() {
  return safeBoundary_(() => {
    passwordOwner_();
    return { allowed: true };
  });
}

function passwordSet(username, code, password) {
  return safeBoundary_(() => {
    const cfg = passwordConfig_();
    const name = passwordName_(username);
    passwordReserveAttempt_(cfg, name, "setup");
    if (!passwordInput_(password))
      fail_("INVALID", "Use a password with at least 15 characters and no more than 256 UTF-8 bytes.");
    const row = passwordRow_(passwordRegistry_(), name);
    const supplied = typeof code === "string" && code.length === 64 ? code : "";
    const digest = passwordMac_(cfg, "setup verifier", name + ":" + supplied);
    const valid = (r) => r && r.active && r.setupExpires > Date.now() &&
      passwordEqual_(r.setup, digest);
    if (!valid(row)) fail_("AUTH", "The username or setup code is invalid or expired.");
    const salt = passwordRandom_(cfg, "salt").slice(0, 32);
    const verifier = "pbkdf2-sha256$600000$" + salt + "$" + passwordDerive_(password, salt);
    return passwordLocked_(() => {
      const registry = passwordRegistry_();
      const current = passwordRow_(registry, name);
      if (!valid(current) || current.version !== row.version)
        fail_("AUTH", "The username or setup code is invalid or expired.");
      passwordWriteRow_(registry, current.index,
        [current.id, true, "admin", verifier, current.version, "", ""]);
      return { ready: true };
    });
  });
}

function passwordLogin(username, password) {
  return safeBoundary_(() => {
    const cfg = passwordConfig_();
    const name = passwordName_(username);
    passwordReserveAttempt_(cfg, name, "login");
    const row = passwordRow_(passwordRegistry_(), name);
    const match = row?.active &&
      /^pbkdf2-sha256\$600000\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(row.verifier);
    const inputOk = passwordInput_(password);
    const salt = match ? match[1] : passwordMac_(cfg, "dummy salt", name).slice(0, 32);
    const actual = passwordDerive_(inputOk ? password : "Invalid password input", salt);
    const verified = passwordEqual_(actual, match ? match[2] : "0".repeat(64));
    const reject = () => fail_("AUTH", "The username or password is incorrect.");
    if (!match || !inputOk || !verified) reject();
    return passwordLocked_(() => {
      const current = passwordRow_(passwordRegistry_(), name);
      if (!current || !current.active || current.version !== row.version ||
          current.verifier !== row.verifier) reject();
      const token = name + "." + passwordRandom_(cfg, "session token");
      const now = Date.now();
      properties_().setProperty(passwordSessionKey_(name), JSON.stringify({
        digest: passwordMac_(cfg, "session", token),
        version: current.version,
        seen: now,
        expires: now + PASSWORD_MAX_MS_,
      }));
      return { token, idleMs: PASSWORD_IDLE_MS_, maxMs: PASSWORD_MAX_MS_ };
    });
  });
}

function passwordLogout(token) {
  return safeBoundary_(() => passwordLocked_(() => {
    const record = passwordSessionRecord_(token);
    if (record) properties_().deleteProperty(record.key);
    return { signedOut: true };
  }));
}

function passwordAdminCall(token, action, p) {
  return safeBoundary_(() => {
    const session = passwordRefreshSession_(token);
    const maps = properties_().getProperty("MEALS_PASSWORD_MAPS") === "true";
    if (["addressSuggestions", "addressPreview", "verifyAddress", "optimize"].includes(action) &&
        !maps)
      fail_("API_DISABLED", "Automatic address and routing tools are disabled for username sign-in.");
    const result = adminDispatch_(action, p, { email: session.id, label: session.name,
      state: load_(), recheck: () => passwordSession_(token).id,
      passwordMaps: maps });
    passwordSession_(token);
    return result;
  });
}
