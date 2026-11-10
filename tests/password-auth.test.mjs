import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { createEvent, harness, payload } from "./harness.mjs";

const secret = "synthetic multiword password";
const endpoint = "https://script.google.com/macros/s/synthetic-deployment/exec";
const eventInput = {
  eventName: "Synthetic test event",
  deliveryDate: "2026-12-01",
  capacity: 20,
  status: "Draft",
};

function ok(result) {
  assert.equal(result.ok, true, result.error?.message);
  return result.data;
}

function configure(h) {
  Object.assign(h.props, {
    MEALS_PASSWORD_LOGIN: "true",
    MEALS_PASSWORD_OWNER: "admin-one@example.test",
    MEALS_PASSWORD_KEY: crypto.randomBytes(32).toString("hex"),
    MEALS_PASSWORD_URL: endpoint,
  });
  h.ctx.setupPasswordColumns_();
  h.ctx.setupPasswordColumns_();
}

test("server-side PBKDF2 matches Node's native implementation at the production work factor", () => {
  const h = harness();
  const salt = "00112233445566778899aabbccddeeff";
  const password = secret + " 🔐";
  const expected = crypto.pbkdf2Sync(password, Buffer.from(salt, "hex"), 600000, 32, "sha256");
  assert.equal(h.ctx.passwordDerive_(password, salt), expected.toString("hex"));
});

test("signed-out account setup, event and referral writes, expiration, reset and logout", () => {
  const h = harness();
  const { ctx, state, props, tables } = h;
  assert.equal(ctx.passwordLogin("paramedic", secret).error.code, "AUTH");
  configure(h);
  state.active = state.effective = "admin-two@example.test";
  assert.equal(h.admin("identity").ok, true);
  assert.equal(ctx.passwordAccountAction("setup", "paramedic").error.code, "AUTH");
  state.active = state.effective = "admin-one@example.test";
  const { code } = ok(ctx.passwordAccountAction("setup", "Paramedic"));
  state.active = "";
  assert.match(ctx.doGet({ parameter: { page: "password" } }).getContent(),
    /data-password-url="https:\/\/script\.google\.com/);
  assert.equal(ctx.passwordAccountAction("setup", "unapproved").error.code, "AUTH");
  assert.equal(h.admin("identity").error.code, "AUTH");
  assert.equal(ctx.passwordSet("paramedic", "x".repeat(64), secret).error.code, "AUTH");
  assert.equal(ok(ctx.passwordSet("paramedic", code, secret)).ready, true);
  assert.equal(ctx.passwordSet("paramedic", code, secret).error.code, "AUTH");
  const registry = tables.get("ADMINUSERS").rows;
  assert.deepEqual(registry[0].slice(0, 3), ["Email", "Active", "Role"]);
  assert.match(registry.at(-1)[3], /^pbkdf2-sha256\$600000\$[a-f0-9]{32}\$[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(registry).includes(secret), false);
  assert.equal(JSON.stringify(registry).includes(code), false);

  const unknown = ctx.passwordLogin("unlisted", secret);
  const wrong = ctx.passwordLogin("paramedic", "wrong password for testing");
  assert.deepEqual(unknown, wrong);
  const { token } = ok(ctx.passwordLogin("PARAMEDIC", secret));
  const key = "MEALS_PASSWORD_SESSION:paramedic";
  assert.equal(props[key].includes(token), false);
  assert.equal(ok(ctx.passwordAdminCall(token, "identity")).email, "paramedic");
  assert.equal(JSON.stringify(ctx.passwordAdminCall(token, "identity")).includes(registry.at(-1)[3]), false);
  const event = ok(ctx.passwordAdminCall(token, "saveEvent", eventInput));
  assert.equal(event.Status, "Draft");
  ok(ctx.passwordAdminCall(token, "createReferral", payload(event.EventID)));
  assert.equal(h.get("AUDITLOG").at(-1).Admin, "local:paramedic");
  assert.equal(ctx.passwordAdminCall(token, "optimize", {}).error.code, "API_DISABLED");
  assert.equal(JSON.parse(ctx.doGet({ parameter: { action: "events" } }).text).data.length, 0);
  assert.equal(h.public(payload(event.EventID)).error.code, "CLOSED");

  const original = JSON.parse(props[key]);
  props[key] = JSON.stringify({ ...original, seen: Date.now() - 31 * 60000 });
  assert.equal(ctx.passwordAdminCall(token, "dashboard", { eventId: event.EventID }).error.code, "AUTH");
  props[key] = JSON.stringify({ ...original, expires: Date.now() - 1 });
  assert.equal(ctx.passwordAdminCall(token, "reports").error.code, "AUTH");
  props[key] = JSON.stringify(original);
  assert.equal(ok(ctx.passwordLogout(token)).signedOut, true);
  assert.equal(ctx.passwordAdminCall(token, "events").error.code, "AUTH");

  const second = ok(ctx.passwordLogin("paramedic", secret)).token;
  state.active = "admin-one@example.test";
  const reset = ok(ctx.passwordAccountAction("setup", "paramedic"));
  assert.equal(ctx.passwordAdminCall(second, "events").error.code, "AUTH");
  ok(ctx.passwordAccountAction("disable", "paramedic"));
  state.active = "";
  assert.equal(ctx.passwordSet("paramedic", reset.code, secret).error.code, "AUTH");
  assert.equal(ctx.passwordLogin("paramedic", secret).error.code, "AUTH");
  assert.equal(ctx.passwordAdminCall(second, "saveEvent", eventInput).error.code, "AUTH");
  assert.equal(h.get("EVENTS").length, 1);
});

test("every password RPC rejects before dispatch without a session, including for a Google admin", () => {
  const h = harness();
  configure(h);
  const event = createEvent(h);
  const before = h.snapshot();
  const actions = [
    "identity", "events", "dashboard", "route", "deliveryPdf", "reports", "publicFormLink",
    "addressConfig", "addressSuggestions", "addressPreview", "verifyAddress", "optimize",
    "createReferral", "submissionReceipt", "manualAddressReview", "saveEvent", "archive",
    "statuses", "editReferral", "reorder",
  ];
  for (const action of actions) {
    const p = { ...eventInput, eventId: event.EventID };
    assert.equal(h.ctx.passwordAdminCall("", action, p).error.code, "AUTH", action);
    assert.equal(h.ctx.passwordAdminCall("paramedic." + "f".repeat(64), action, p).error.code, "AUTH", action);
    if (!["addressConfig", "addressSuggestions", "addressPreview"].includes(action)) {
      assert.equal(JSON.parse(h.ctx.doPost({ postData: { contents: JSON.stringify({ action, ...p }) } }).text).ok,
        false, action);
    }
  }
  assert.equal(h.snapshot(), before);
  assert.equal(h.state.apiCalls, 0);
});

test("persistent rate limits apply before verification to known and unknown usernames", () => {
  const h = harness();
  configure(h);
  h.ctx.passwordDerive_ = () => "0".repeat(64);
  for (let i = 0; i < 5; i++)
    assert.equal(h.ctx.passwordLogin("missing", secret).error.code, "AUTH");
  assert.equal(h.ctx.passwordLogin("MISSING", secret).error.code, "RATE_LIMIT");
  for (let i = 0; i < 20; i++)
    assert.equal(h.ctx.passwordLogin("missing" + i, secret).error.code, "AUTH");
  assert.equal(h.ctx.passwordLogin("another", secret).error.code, "RATE_LIMIT");
  const counters = h.props.MEALS_PASSWORD_ATTEMPTS;
  assert.equal(JSON.parse(counters).count, 25);
  assert.equal(counters.includes("missing"), false);
});

test("local browser RPC sends its in-memory session explicitly and discards a late response", async () => {
  const source = fs.readFileSync("apps-script/AdminClient.html", "utf8");
  const seen = [];
  const call = {
    withSuccessHandler(fn) { this.success = fn; return this; },
    withFailureHandler() { return this; },
    passwordAdminCall(...args) { seen.push(args); },
    adminCall() { assert.fail("Username sign-in must not fall back to Google RPC"); },
  };
  const ctx = vm.createContext({
    passwordUrl: endpoint, sessionToken: "synthetic-token", sessionClosed: false,
    checkPasswordExpiry() {}, schedulePasswordExpiry() {},
    google: { script: { run: call } },
  });
  vm.runInContext(source.slice(source.indexOf("  function rpc("),
    source.indexOf("  const pendingCreates")), ctx);
  const result = ctx.rpc("events");
  assert.deepEqual(JSON.parse(JSON.stringify(seen)), [["synthetic-token", "events", {}]]);
  ctx.sessionToken = "";
  ctx.sessionClosed = true;
  call.success({ ok: true, data: ["must not display"] });
  await assert.rejects(result, /Sign in again/);
  await assert.rejects(ctx.rpc("events"), /Sign in again/);
  assert.equal(seen.length, 1);
});
