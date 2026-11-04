import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
function controller() {
  const ctx = vm.createContext({ window: {}, setTimeout });
  vm.runInContext(fs.readFileSync("submission-confirmation.js", "utf8"), ctx);
  return ctx.window.MealSubmission;
}
const receipt = { referralId: "synthetic-id", meals: 5 };
test("successful POST returns immediately without recovery reads", async () => {
  const c = controller(); let checks = 0;
  assert.equal(await c.confirm({send: async () => receipt, check: async () => { checks++; }}), receipt);
  assert.equal(checks, 0);
});
test("availability refresh keeps a closed selected event instead of retargeting a draft", async () => {
  const source = fs.readFileSync("app.js", "utf8");
  const original = {eventId: "closed-event", eventName: "Original event", deliveryDate: "2026-11-26", remaining: 5};
  const selectNode = {value: "", replaceChildren(...options) {this.options = options;}};
  const nodes = new Map([["eventSelect", selectNode], ["availabilityChecked", {textContent: ""}]]);
  const ctx = vm.createContext({loading: false, events: [], selected: original, pending: null,
    $: id => nodes.get(id), totals: () => {}, utcLocalDate: () => "2026-11-04", Date,
    document: {createElement: () => ({})},
    api: async () => [{eventId: "different-event", eventName: "Different event", deliveryDate: "2026-11-27", remaining: 10}],
    select: id => {ctx.selected = ctx.events.find(e => e.eventId === id);}});
  vm.runInContext(source.slice(source.indexOf("  async function load("), source.indexOf("  async function hash(")), ctx);
  await ctx.load();
  assert.equal(selectNode.value, original.eventId);
  assert.equal(ctx.selected.remaining, 0);
  assert.equal(ctx.selected.unavailable, true);
  await ctx.load("different-event");
  assert.equal(selectNode.value, "different-event");
  assert.equal(ctx.selected.remaining, 10);
});
test("lost POST response is confirmed by a read without submitting again", async () => {
  const c = controller(); let posts = 0, checks = 0, messages = 0;
  const result = await c.confirm({ send: async () => { posts++; throw Object.assign(new Error("network"), { uncertain: true }); },
    check: async () => { checks++; return { receipt }; }, onChecking: () => messages++ });
  assert.equal(result, receipt); assert.equal(posts, 1); assert.equal(checks, 1); assert.equal(messages, 1);
});
test("definitive capacity error is shown without recovery or another POST", async () => {
  const c = controller(); const error = Object.assign(new Error("Only 2 meals remain"), { code: "CAPACITY" });
  await assert.rejects(c.confirm({ send: async () => { throw error; }, check: async () => { assert.fail("Unexpected read"); }}), e => e === error);
});
test("a temporarily absent receipt is rechecked and a later atomic save is recognized", async () => {
  const c = controller(); let checks = 0;
  assert.equal(await c.confirm({ send: async () => { throw { uncertain: true }; },
    check: async () => ({receipt: ++checks === 1 ? null : receipt}), pause: async () => {} }), receipt);
  assert.equal(checks, 2);
});
test("unconfirmed save remains uncertain; never infer success from availability or retry the write", async () => {
  const c = controller(); let posts = 0, checks = 0;
  await assert.rejects(c.confirm({ send: async () => { posts++; throw { uncertain: true }; }, check: async () => { checks++; throw new Error("read failed"); }, pause: async () => {} }),
    e => e.uncertain === true && /could not confirm/.test(e.message));
  assert.equal(posts, 1); assert.equal(checks, 2);
});
test("public transport bounds POST time, disables caching and keeps recipient data out of URLs", async () => {
  const source = fs.readFileSync("app.js", "utf8");
  let ms, cleared = 0, request;
  const ctx = vm.createContext({ window: { MEALS_CONFIG: { publicApiUrl: "https://example.test/exec" } }, AbortController,
    setTimeout: (fn, delay) => { ms = delay; return 1; }, clearTimeout: () => cleared++,
    fetch: async (url, options) => { request = { url, options }; return {ok: true, json: async () => ({ok: true, data: receipt})}; },
    encodeURIComponent, Date });
  vm.runInContext(source.slice(source.indexOf("  async function api("), source.indexOf("  async function load(")), ctx);
  await ctx.api({address: "Synthetic secret address", action: "submit"});
  assert.equal(ms, 12000); assert.equal(cleared, 1);
  assert.equal(request.options.cache, "no-store"); assert.equal(request.options.credentials, "omit");
  assert.ok(!request.url.includes("Synthetic")); assert.match(request.options.body, /Synthetic/);
  await ctx.api(null, "synthetic-submission-id");
  assert.equal(ms, 15000); assert.match(request.url, /action=submissionReceipt/);
});
test("Safari numeric AbortError triggers receipt recovery instead of escaping as a backend error", async () => {
  const source = fs.readFileSync("app.js", "utf8");
  let calls = 0;
  const ctx = vm.createContext({ window: { MEALS_CONFIG: { publicApiUrl: "https://example.test/exec" } }, AbortController,
    setTimeout: () => 1, clearTimeout: () => {}, encodeURIComponent, Date,
    fetch: async () => {
      if (++calls === 1) throw new DOMException("Fetch is aborted", "AbortError");
      return {ok: true, json: async () => ({ok: true, data: {receipt}})};
    } });
  vm.runInContext(source.slice(source.indexOf("  async function api("), source.indexOf("  async function load(")), ctx);
  const c = controller();
  const result = await c.confirm({send: () => ctx.api({action: "submit"}), check: () => ctx.api(null, "synthetic-submission-id")});
  assert.equal(result, receipt);
  assert.equal(calls, 2);
});
test("standalone receipt recovery uses only reads and surfaces damaged-record errors immediately", async () => {
  const c = controller();
  assert.equal(await c.recover({check: async () => ({receipt})}), receipt);
  let reads = 0;
  await assert.rejects(c.recover({check: async () => {
    reads++;
    throw Object.assign(new Error("Contact administrator"), {code: "INTEGRITY"});
  }, pause: async () => { assert.fail("An integrity error must not be retried"); }}), e => e.code === "INTEGRITY");
  assert.equal(reads, 1);
  await assert.rejects(c.confirm({send: async () => {throw {uncertain: true};}, check: async () => {
    throw Object.assign(new Error("Contact administrator"), {code: "INTEGRITY"});
  }}), e => e.code === "INTEGRITY");
});
test("reload recovery restores a saved receipt without requiring recipient re-entry or issuing a POST", async () => {
  const source = fs.readFileSync("app.js", "utf8");
  const nodes = new Map(["submissionMessage", "successPanel", "successMessage", "receiptId"].map(id => [id, {hidden: true, textContent: ""}]));
  const pending = {id: "retained-submission", fingerprint: "retained-hash", event: {eventId: "retained-event"}};
  let reads = 0;
  const ctx = vm.createContext({busy: false, pending, form: {inert: false, hidden: false},
    $: id => nodes.get(id), totals: () => {}, MealSubmission: controller(),
    api: async (payload, id) => {assert.equal(payload, null);assert.equal(id, pending.id);reads++;return {receipt};},
    retain: value => {ctx.pending = value;}, load: async id => {assert.equal(id, pending.event.eventId);}});
  vm.runInContext(source.slice(source.indexOf("  function showReceipt("), source.indexOf('  $("checkSavedRequest").addEventListener')), ctx);
  await ctx.recoverPending();
  assert.equal(reads, 1);
  assert.equal(ctx.pending.id, pending.id);
  assert.equal(ctx.pending.receipt, receipt);
  assert.equal(ctx.form.hidden, true);
  assert.equal(ctx.form.inert, false);
  assert.equal(ctx.busy, false);
  assert.equal(nodes.get("successPanel").hidden, false);
});
test("availability refresh disables sending during a read and preserves unsaved recipient fields on failure", async () => {
  const source = fs.readFileSync("app.js", "utf8");
  const nodes = new Map(["eventMessage", "availabilityChecked"].map(id => [id, {textContent: ""}]));
  const form = {elements: {organizationName: {value: "Unsaved organization"}}};
  let release;
  const gate = new Promise(resolve => {release = resolve;});
  let calls = 0;
  const ctx = vm.createContext({loading: false, selected: {eventId: "old-event"}, form,
    $: id => nodes.get(id), totals: () => {}, api: async () => {calls++;await gate;throw new Error("network unavailable");}});
  vm.runInContext(source.slice(source.indexOf("  async function load("), source.indexOf("  async function hash(")), ctx);
  const first = ctx.load();
  assert.equal(ctx.loading, true);
  await ctx.load();
  assert.equal(calls, 1);
  release();
  await first;
  assert.equal(ctx.loading, false);
  assert.equal(ctx.selected, null);
  assert.equal(form.elements.organizationName.value, "Unsaved organization");
  assert.match(nodes.get("availabilityChecked").textContent, /could not be refreshed/);
});
