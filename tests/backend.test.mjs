import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import vm from "node:vm";
import {
  harness,
  payload,
  createEvent,
  approve,
  editPayload,
  selection,
} from "./harness.mjs";
const ok = (r) => {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.data;
};
const code = (r, c) => {
  assert.equal(r.ok, false);
  assert.equal(r.error.code, c);
};
test("public receipt recovery confirms only a known public submission without returning protected data or writing", () => {
  const h = harness(), e = createEvent(h), p = payload(e.EventID);
  const receipt = ok(h.public(p));
  h.state.active = h.state.effective = "";
  const before = h.snapshot();
  const read = id => JSON.parse(h.ctx.doGet({ parameter: { action: "submissionReceipt", submissionId: id } }).text);
  assert.deepEqual(ok(read(p.submissionId)).receipt, receipt);
  assert.equal(ok(read(crypto.randomUUID())).receipt, null);
  code(read("not-a-uuid"), "INVALID");
  code(read(""), "INVALID");
  assert.equal(h.snapshot(), before);
  assert.deepEqual(Object.keys(ok(read(p.submissionId)).receipt).sort(), ["eventName", "meals", "recipients", "referralId", "status"]);
});
test("public receipt lookup does not reveal admin-created requests", () => {
  const h = harness(), e = createEvent(h), p = payload(e.EventID, [1]);
  ok(h.admin("createReferral", p));
  h.state.active = h.state.effective = "";
  const response = JSON.parse(h.ctx.doGet({parameter: {action: "submissionReceipt", submissionId: p.submissionId}}).text);
  assert.equal(ok(response).receipt, null);
});
test("historical orphan rows are preserved and visible in admin diagnostics while intact referrals keep working", () => {
  const h = harness(), e = createEvent(h), p = payload(e.EventID, [4]);
  const receipt = ok(h.public(p));
  // Simulate an out-of-application parent removal in the existing mock store.
  const table = h.tables.get("REFERRALS");
  table.rows = table.rows.filter((r, i) => i === 0 || r[0] !== receipt.referralId);
  const orphan = JSON.stringify(h.get("RECIPIENTS")[0]);
  const before = h.snapshot();
  code(h.public(p), "INTEGRITY");
  code(JSON.parse(h.ctx.doGet({parameter: {action: "submissionReceipt", submissionId: p.submissionId}}).text), "INTEGRITY");
  assert.equal(h.snapshot(), before);
  const next = ok(h.public(payload(e.EventID, [2])));
  assert.ok(next.referralId !== receipt.referralId);
  assert.equal(h.ctx.publicEvents_()[0].remaining, 18);
  assert.equal(JSON.stringify(h.get("RECIPIENTS")[0]), orphan);
  const report = ok(h.admin("reports", {}));
  assert.equal(report.totals.recipientRecords, 1);
  assert.equal(report.totals.currentlyReservedMeals, 2);
  assert.deepEqual(report.integrity, {recipientRecords: 1, mealQuantities: 4, submissionRecords: 1});
  assert.deepEqual(ok(h.admin("dashboard", {eventId: e.EventID})).integrity, report.integrity);
  assert.equal(h.get("SUBMISSIONS").length, 2);
});
test("mismatched event relationships and missing recipients cannot return a successful saved receipt", () => {
  for (const corruption of ["event", "recipient", "receipt"]) {
    const h = harness(), e = createEvent(h), p = payload(e.EventID, [2]);
    ok(h.public(p));
    if (corruption === "event") h.tables.get("RECIPIENTS").rows[1][2] = "missing-event";
    if (corruption === "recipient") h.tables.get("RECIPIENTS").rows.splice(1, 1);
    if (corruption === "receipt") h.tables.get("SUBMISSIONS").rows[1][3] = '{"private":"Synthetic secret"}';
    const before = h.snapshot();
    const retry = h.public(p);
    code(retry, "INTEGRITY");
    assert.ok(!JSON.stringify(retry).includes("Synthetic secret"));
    code(JSON.parse(h.ctx.doGet({parameter: {action: "submissionReceipt", submissionId: p.submissionId}}).text), "INTEGRITY");
    assert.equal(h.snapshot(), before);
  }
});
test("new broken relationships are rejected before the atomic batch", () => {
  const h = harness(), e = createEvent(h);
  ok(h.public(payload(e.EventID, [1])));
  const before = h.snapshot();
  assert.throws(() => h.seed(s => {
    s.RECIPIENTS.push({...s.RECIPIENTS[0], RecipientID: crypto.randomUUID(), ReferralID: "missing-parent"});
  }), error => error.code === "INTEGRITY");
  assert.equal(h.snapshot(), before);
});
test("submission and recovery consistently require a v4 submission ID without writes on invalid input", () => {
  const h = harness(), e = createEvent(h), before = h.snapshot();
  const id = "00000000-0000-1000-8000-000000000000";
  code(h.public(payload(e.EventID, [1], {submissionId: id})), "INVALID");
  code(JSON.parse(h.ctx.doGet({parameter: {action: "submissionReceipt", submissionId: id}}).text), "INVALID");
  assert.equal(h.snapshot(), before);
});
test("public form sharing requires administrator authorization and an explicit safe website URL", () => {
  const h = harness();
  code(h.admin("publicFormLink"), "CONFIG");
  for (const url of [
    "javascript:alert(1)",
    "https://user:password@example.test/",
    "https://example.test/?page=admin",
    "https://example.test/?action=events",
    "https://example.test/ bad",
  ]) {
    h.props.MEALS_PUBLIC_FORM_URL = url;
    code(h.admin("publicFormLink"), "CONFIG");
  }
  h.props.MEALS_PUBLIC_FORM_URL = "https://example.test/community-meals/";
  assert.equal(ok(h.admin("publicFormLink")).url, h.props.MEALS_PUBLIC_FORM_URL);
  h.state.active = h.state.effective = "unauthorized@example.test";
  code(h.admin("publicFormLink"), "FORBIDDEN");
});
test("typed public addresses reserve meals and require admin review without invoking enabled Maps services", () => {
  const h = harness(), e = createEvent(h);
  h.props.MEALS_MAPS_LIVE_ENABLED = "true";
  h.props.MEALS_ADDRESS_AUTOCOMPLETE_ENABLED = "true";
  h.props.MEALS_ADDRESS_VALIDATION_ENABLED = "true";
  const p = payload(e.EventID, [2, 3]);
  p.recipients[0].address = "100 Synthetic Street, Unit 2, Example City, VA 00000";
  ok(h.public(p));
  assert.equal(h.state.apiCalls, 0);
  assert.equal(h.get("REFERRALS")[0].Status, "Pending");
  assert.ok(h.get("RECIPIENTS").every(r => r.AddressStatus === "Needs Review"));
  assert.equal(h.get("RECIPIENTS")[0].Address, p.recipients[0].address);
  assert.equal(h.ctx.publicEvents_()[0].remaining, 15);
});
test("20-meal workflow: reservations, bulk approval, edit, reject, restore, reports and archive", () => {
  const h = harness(),
    e = createEvent(h);
  assert.equal(h.ctx.publicEvents_()[0].remaining, 20);
  const a = ok(h.public(payload(e.EventID, [3, 2]))),
    b = ok(h.public(payload(e.EventID, [4])));
  assert.equal(h.ctx.publicEvents_()[0].remaining, 11);
  code(h.public(payload(e.EventID, [12])), "CAPACITY");
  assert.ok(h.get("REFERRALS").every((r) => r.Status === "Pending"));
  ok(approve(h, [a.referralId, b.referralId]));
  assert.equal(h.ctx.publicEvents_()[0].remaining, 11);
  let p = editPayload(h, a.referralId);
  p.mealCount = 5;
  ok(h.admin("editRecipient", p));
  assert.equal(h.ctx.publicEvents_()[0].remaining, 9);
  let r = h.get("RECIPIENTS").find((x) => x.ReferralID === b.referralId);
  ok(
    h.admin("statuses", {
      status: "Rejected",
      recipients: [selection(r)],
    }),
  );
  assert.equal(h.ctx.publicEvents_()[0].remaining, 13);
  r = h.get("RECIPIENTS").find((x) => x.ReferralID === b.referralId);
  ok(
    h.admin("statuses", {
      status: "Pending",
      recipients: [selection(r)],
    }),
  );
  assert.equal(h.ctx.publicEvents_()[0].remaining, 9);
  const rep = ok(h.admin("reports", { year: "2026" }));
  assert.equal(rep.totals.originallyRequestedMeals, 9);
  assert.equal(rep.totals.currentlyReservedMeals, 11);
  const current = h.get("EVENTS")[0];
  ok(
    h.admin("archive", {
      eventId: e.EventID,
      version: current.Version,
      mode: "archive",
      confirmed: true,
    }),
  );
  assert.equal(h.ctx.publicEvents_().length, 0);
  assert.equal(ok(h.admin("reports", {})).totals.originallyRequestedMeals, 9);
  code(h.admin("editRecipient", editPayload(h, a.referralId)), "READ_ONLY");
  const archived = h.get("EVENTS")[0];
  code(
    h.admin("archive", {
      eventId: e.EventID,
      version: archived.Version,
      mode: "reopen",
    }),
    "CONFIRM",
  );
  ok(
    h.admin("archive", {
      eventId: e.EventID,
      version: archived.Version,
      mode: "reopen",
      confirmed: true,
    }),
  );
  assert.equal(h.get("EVENTS")[0].Archived, false);
  assert.ok(
    h.get("AUDITLOG").some((x) => x.Action === "Event Reopened / Unarchived"),
  );
});
test("submission retry returns original receipt; changed payload with same ID is rejected", () => {
  const h = harness(),
    e = createEvent(h),
    p = payload(e.EventID);
  const first = ok(h.public(p));
  assert.deepEqual(ok(h.public(p)), first);
  assert.equal(h.get("REFERRALS").length, 1);
  assert.equal(h.get("RECIPIENTS").length, 2);
  p.recipients[0].mealCount++;
  code(h.public(p), "IDEMPOTENCY");
  assert.equal(h.ctx.publicEvents_()[0].remaining, 15);
});
test("atomic failure leaves no referral, recipient, receipt or audit; same ID can recover", () => {
  const h = harness(),
    e = createEvent(h),
    p = payload(e.EventID);
  const before = h.snapshot();
  h.failNext();
  code(h.public(p), "UNAVAILABLE");
  assert.equal(h.snapshot(), before);
  ok(h.public(p));
  assert.equal(h.get("REFERRALS").length, 1);
  assert.equal(h.get("RECIPIENTS").length, 2);
  assert.equal(h.get("SUBMISSIONS").length, 1);
});
test("failure in recipient edit leaves the recipient, siblings, parent and audit unchanged", () => {
  const h = harness(),
    e = createEvent(h),
    r = ok(h.public(payload(e.EventID)));
  const p = editPayload(h, r.referralId);
  p.mealCount = 4;
  const before = h.snapshot();
  h.failNext();
  code(h.admin("editRecipient", p), "UNAVAILABLE");
  assert.equal(h.snapshot(), before);
});
test("capacity reductions, quantity increases and restores cannot overbook", () => {
  const h = harness(),
    e = createEvent(h, 5),
    a = ok(h.public(payload(e.EventID, [5])));
  code(
    h.admin("saveEvent", {
      eventId: e.EventID,
      version: 1,
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      capacity: 4,
      startAddress: e.StartAddress,
      status: "Open",
    }),
    "CAPACITY",
  );
  const p = editPayload(h, a.referralId);
  p.mealCount = 6;
  code(h.admin("editRecipient", p), "CAPACITY");
  const ref = h.get("RECIPIENTS")[0];
  ok(
    h.admin("statuses", {
      status: "Rejected",
      recipients: [selection(ref)],
    }),
  );
  ok(h.public(payload(e.EventID, [5])));
  const rejected = h.get("RECIPIENTS")[0];
  code(
    h.admin("statuses", {
      status: "Pending",
      recipients: [selection(rejected)],
    }),
    "CAPACITY",
  );
});
test("all capacity mutations and writes acquire shared lock; contention refuses operation", () => {
  const h = harness(),
    e = createEvent(h);
  let result;
  h.seed(() => {
    result = h.public(payload(e.EventID));
  });
  code(result, "BUSY");
  assert.equal(h.get("REFERRALS").length, 0);
  assert.ok(h.state.lockAcquires >= 3);
});
test("local interleaved public/admin submissions never exceed capacity (not a live concurrency test)", async () => {
  const h = harness(),
    e = createEvent(h, 20);
  const responses = await Promise.all(
    Array.from({ length: 30 }, (_, i) =>
      Promise.resolve().then(() =>
        i % 2
          ? h.public(payload(e.EventID, [2]))
          : h.admin("createReferral", payload(e.EventID, [2])),
      ),
    ),
  );
  assert.equal(responses.filter((r) => r.ok).length, 10);
  assert.equal(h.ctx.publicEvents_()[0].remaining, 0);
  assert.equal(h.get("REFERRALS").length, 10);
});
test("bulk approval/restoration validates the entire selection atomically", () => {
  const h = harness(),
    e = createEvent(h, 5),
    a = ok(h.public(payload(e.EventID, [3]))),
    b = ok(h.public(payload(e.EventID, [2])));
  const refs = h
    .get("RECIPIENTS")
    .map(selection);
  ok(h.admin("statuses", { status: "Rejected", recipients: refs }));
  ok(h.public(payload(e.EventID, [1])));
  const restored = h
    .get("RECIPIENTS")
    .filter((r) => r.Status === "Rejected")
    .map(selection);
  const before = h.snapshot();
  code(
    h.admin("statuses", { status: "Pending", recipients: restored }),
    "CAPACITY",
  );
  assert.equal(h.snapshot(), before);
});
test("duplicate warnings within and across referrals; units are preserved; never reject automatically", () => {
  const h = harness(),
    e = createEvent(h);
  const p = payload(e.EventID, [1, 1]);
  p.recipients[1].address = p.recipients[0].address;
  ok(h.public(p));
  assert.ok(h.get("RECIPIENTS").every((r) => r.DuplicateFlag));
  assert.ok(h.get("REFERRALS").every((r) => r.Status === "Pending"));
  const q = payload(e.EventID, [1]);
  q.recipients[0].recipientName = "Different Synthetic Recipient";
  q.recipients[0].phone = "";
  q.recipients[0].address =
    "100 Synthetic Test Lane, Unit 2, Example City, VA 00000";
  ok(h.public(q));
  assert.equal(h.get("RECIPIENTS")[2].DuplicateFlag, false);
  const another = payload(e.EventID, [1]);
  ok(h.public(another));
  assert.equal(h.get("RECIPIENTS")[3].DuplicateFlag, true);
});
test("hyphenated apartment identifiers do not produce false duplicate warnings", () => {
  const h = harness(), e = createEvent(h), p = payload(e.EventID, [1, 1]);
  p.recipients.forEach((r, i) => {
    r.recipientName = "Synthetic Unit Recipient " + i;
    r.phone = "";
    r.address = "65 West Church Street, Unit QA-" + (i + 1) + ", Martinsville, VA 24112";
  });
  ok(h.public(p));
  assert.ok(h.get("RECIPIENTS").every(r => !r.DuplicateFlag));
  const q = payload(e.EventID, [1]);
  q.recipients[0].address = p.recipients[0].address.replace("Unit", "Apt");
  ok(h.public(q));
  assert.equal(h.get("RECIPIENTS")[2].DuplicateFlag, true);
});
test("unauthorized admin dispatch and public direct admin calls fail closed", () => {
  const h = harness(),
    e = createEvent(h);
  ok(h.public(payload(e.EventID)));
  for (const [active, effective] of [
    ["", "admin-one@example.test"],
    ["stranger@example.test", "stranger@example.test"],
    ["admin-two@example.test", "admin-one@example.test"],
  ]) {
    h.state.active = active;
    h.state.effective = effective;
    for (const action of [
      "identity",
      "events",
      "dashboard",
      "reports",
      "route",
      "saveEvent",
      "statuses",
      "editRecipient",
      "createReferral",
      "reorder",
      "archive",
      "manualAddressReview",
      "verifyAddress",
      "optimize",
    ]) {
      const r = h.admin(action, { eventId: e.EventID });
      assert.equal(r.ok, false, action);
      assert.ok(!JSON.stringify(r).includes("Synthetic Recipient"));
    }
  }
  const get = h.ctx.doGet({ parameter: { action: "getAdminData" } });
  assert.equal(JSON.parse(get.text).ok, false);
  const post = h.ctx.doPost({
    postData: {
      contents: JSON.stringify({ action: "saveEvent", eventId: e.EventID }),
    },
  });
  assert.equal(JSON.parse(post.text).ok, false);
});
test("both configured synthetic admin identities work, with no frontend email trust", () => {
  const h = harness();
  for (const email of ["admin-one@example.test", "admin-two@example.test"]) {
    h.state.active = email;
    h.state.effective = email;
    assert.equal(ok(h.admin("identity")).email, email);
  }
  h.state.active = "stranger@example.test";
  h.state.effective = h.state.active;
  code(h.admin("identity", { email: "admin-one@example.test" }), "FORBIDDEN");
});
test("stale recipient and event edits are rejected without writes", () => {
  const h = harness(),
    e = createEvent(h),
    r = ok(h.public(payload(e.EventID)));
  const p = editPayload(h, r.referralId);
  p.mealCount = 4;
  ok(h.admin("editRecipient", p));
  code(h.admin("editRecipient", p), "CONFLICT");
  ok(
    h.admin("saveEvent", {
      eventId: e.EventID,
      version: 1,
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      capacity: 21,
      startAddress: e.StartAddress,
      status: "Open",
    }),
  );
  code(
    h.admin("saveEvent", {
      eventId: e.EventID,
      version: 1,
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      capacity: 22,
      startAddress: e.StartAddress,
      status: "Open",
    }),
    "CONFLICT",
  );
});
test("route only approved stops; unresolved stops remain; duplicate addresses are separate stops", () => {
  const h = harness(),
    e = createEvent(h),
    p = payload(e.EventID, [3, 2]);
  p.recipients[1].address = p.recipients[0].address;
  const a = ok(h.public(p));
  ok(h.public(payload(e.EventID, [1])));
  ok(approve(h, [a.referralId]));
  const route = ok(h.admin("route", { eventId: e.EventID }));
  assert.equal(route.stops.length, 2);
  assert.equal(route.totalMeals, 5);
  assert.equal(route.unresolved.length, 2);
  assert.equal(route.isFinal, false);
  code(
    h.admin("optimize", { eventId: e.EventID, routeVersion: route.version }),
    "ADDRESS_REVIEW",
  );
  assert.equal(h.state.apiCalls, 0);
  const reversed = ok(
    h.admin("reorder", {
      eventId: e.EventID,
      routeVersion: route.version,
      recipientIds: h
        .get("RECIPIENTS")
        .filter((r) => r.ReferralID === a.referralId)
        .map((r) => r.RecipientID)
        .reverse(),
    }),
  );
  assert.equal(reversed.stops[0].runningMeals, 2);
  assert.equal(reversed.stops[1].runningMeals, 5);
  assert.equal(reversed.stops[1].stop, 2);
  assert.equal(reversed.isFinal, false);
  code(
    h.admin("reorder", {
      eventId: e.EventID,
      routeVersion: route.version,
      recipientIds: route.stops.map((r) => r.recipientId),
    }),
    "CONFLICT",
  );
  assert.ok(!JSON.stringify(route).includes("Organization"));
  assert.ok(!JSON.stringify(route).includes("Notes"));
});
test("Maps adapters disabled by default; live calls never happen accidentally", () => {
  const h = harness(),
    e = createEvent(h),
    r = ok(h.public(payload(e.EventID, [1])));
  const recipient = h.get("RECIPIENTS")[0];
  code(
    h.admin("verifyAddress", {
      entity: "recipient",
      recipientId: recipient.RecipientID,
      version: 1,
    }),
    "API_DISABLED",
  );
  assert.equal(h.state.apiCalls, 0);
});
test("simulated address and optimizer responses run outside lock and detect route conflicts", () => {
  const h = harness(),
    e = createEvent(h),
    a = ok(h.public(payload(e.EventID, [1, 2, 4])));
  ok(approve(h, [a.referralId]));
  ok(h.admin("statuses", { status: "Rejected", recipients: [selection(h.get("RECIPIENTS")[2])] }));
  h.props.MEALS_MAPS_LIVE_ENABLED = "true";
  h.props.MEALS_ADDRESS_API_KEY = "synthetic-only";
  h.props.MEALS_CLOUD_PROJECT_ID = "synthetic-only";
  h.ctx.Date = class extends Date { static now() { return 1791288000123; } };
  h.state.fetch = (url, options) => {
    if (url.includes("routeoptimization")) {
      const sent = JSON.parse(options.payload);
      for (const value of [sent.model.globalStartTime, sent.model.globalEndTime])
        assert.equal(new Date(value).getTime() % 1000, 0, "Google routing requires whole-second timestamps");
      assert.equal(sent.model.vehicles.length, 1);
      assert.equal(sent.model.vehicles[0].endLocation, undefined, "No return-to-pickup leg");
      assert.equal(sent.model.shipments.length, 2, "Preserve every recipient stop");
    }
    return {
    getResponseCode: () => 200,
    getContentText: () =>
      url.includes("addressvalidation")
        ? JSON.stringify({
            result: {
              verdict: {
                addressComplete: true,
                validationGranularity: "PREMISE",
              },
              geocode: { location: { latitude: 1, longitude: 2 } },
            },
          })
        : JSON.stringify({
            routes: [{ visits: [{ shipmentIndex: 1 }, { shipmentIndex: 0 }] }],
          }),
  };
  };
  for (const r of h.get("RECIPIENTS"))
    ok(
      h.admin("verifyAddress", {
        entity: "recipient",
        recipientId: r.RecipientID,
        version: r.Version,
      }),
    );
  ok(
    h.admin("verifyAddress", {
      entity: "event",
      eventId: e.EventID,
      version: 1,
    }),
  );
  let route = ok(h.admin("route", { eventId: e.EventID }));
  const result = ok(
    h.admin("optimize", { eventId: e.EventID, routeVersion: route.version }),
  );
  assert.equal(result.isFinal, true);
  assert.equal(result.stops[0].meals, 2);
  assert.equal(h.state.externalDuringLock, false);
  h.state.fetch = (url, options) => {
    if (url.includes("addressvalidation"))
      return {
        getResponseCode: () => 200,
        getContentText: () =>
          JSON.stringify({
            result: {
              verdict: {
                addressComplete: true,
                validationGranularity: "PREMISE",
              },
              geocode: { location: { latitude: 1, longitude: 2 } },
            },
          }),
      };
    h.seed((s) => {
      s.EVENTS[0].RouteVersion++;
    });
    return {
      getResponseCode: () => 200,
      getContentText: () =>
        JSON.stringify({
          routes: [{ visits: [{ shipmentIndex: 0 }, { shipmentIndex: 1 }] }],
        }),
    };
  };
  code(
    h.admin("optimize", { eventId: e.EventID, routeVersion: result.version }),
    "CONFLICT",
  );
});
test("unconfirmed / inferred provider addresses are flagged without rewriting original input", () => {
  const h = harness(),
    e = createEvent(h);
  ok(h.public(payload(e.EventID, [1])));
  const r = h.get("RECIPIENTS")[0];
  h.props.MEALS_MAPS_LIVE_ENABLED = "true";
  h.props.MEALS_ADDRESS_API_KEY = "synthetic-only";
  h.state.fetch = () => ({
    getResponseCode: () => 200,
    getContentText: () =>
      JSON.stringify({
        result: {
          verdict: {
            addressComplete: true,
            hasInferredComponents: true,
            validationGranularity: "PREMISE",
          },
          geocode: { location: { latitude: 99, longitude: 99 } },
        },
      }),
  });
  assert.equal(
    ok(
      h.admin("verifyAddress", {
        entity: "recipient",
        recipientId: r.RecipientID,
        version: 1,
      }),
    ).confirmed,
    false,
  );
  assert.equal(h.get("RECIPIENTS")[0].Address, r.Address);
  assert.equal(h.get("RECIPIENTS")[0].Latitude, undefined);
});
test("unsafe optimizer results cannot remove duplicate or skipped stops", () => {
  const h = harness(),
    e = createEvent(h),
    a = ok(h.public(payload(e.EventID, [1, 1])));
  ok(approve(h, [a.referralId]));
  h.seed((s) => {
    s.EVENTS[0].StartAddressStatus = "Confirmed";
    s.EVENTS[0].StartLatitude = 1;
    s.EVENTS[0].StartLongitude = 2;
    s.RECIPIENTS.forEach((r) => {
      r.AddressStatus = "Confirmed";
      r.Latitude = 1;
      r.Longitude = 2;
    });
  });
  h.props.MEALS_MAPS_LIVE_ENABLED = "true";
  h.props.MEALS_CLOUD_PROJECT_ID = "synthetic-only";
  h.props.MEALS_ADDRESS_API_KEY = "synthetic-only";
  const route = ok(h.admin("route", { eventId: e.EventID }));
  h.state.fetch = (url) => ({
    getResponseCode: () => 200,
    getContentText: () =>
      url.includes("addressvalidation")
        ? JSON.stringify({
            result: {
              verdict: {
                addressComplete: true,
                validationGranularity: "PREMISE",
              },
              geocode: { location: { latitude: 1, longitude: 2 } },
            },
          })
        : JSON.stringify({
            routes: [{ visits: [{ shipmentIndex: 0 }, { shipmentIndex: 0 }] }],
          }),
  });
  code(
    h.admin("optimize", { eventId: e.EventID, routeVersion: route.version }),
    "INVALID",
  );
  h.state.fetch = (url) => ({
    getResponseCode: () => 200,
    getContentText: () =>
      url.includes("addressvalidation")
        ? JSON.stringify({
            result: {
              verdict: {
                addressComplete: true,
                validationGranularity: "PREMISE",
              },
              geocode: { location: { latitude: 1, longitude: 2 } },
            },
          })
        : JSON.stringify({ skippedShipments: [{ index: 1 }] }),
  });
  code(
    h.admin("optimize", { eventId: e.EventID, routeVersion: route.version }),
    "MAPS",
  );
});
test("100-recipient referral writes as one operation; 101 and oversized requests rejected", () => {
  const h = harness(),
    e = createEvent(h, 200);
  ok(h.public(payload(e.EventID, Array(100).fill(1))));
  assert.equal(h.get("RECIPIENTS").length, 100);
  code(h.public(payload(e.EventID, Array(101).fill(1))), "INVALID");
  const huge = payload(e.EventID, [1]);
  huge.padding = "x".repeat(180001);
  code(h.public(huge), "INVALID");
});
test("formula/script-like input is stored as strings; public APIs never return protected data", () => {
  const h = harness(),
    e = createEvent(h),
    p = payload(e.EventID, [1]);
  p.recipients[0].recipientName = '=IMPORTXML("https://example.invalid")';
  p.recipients[0].deliveryInstructions = '<script>alert("x")</script>';
  ok(h.public(p));
  const row = h.get("RECIPIENTS")[0];
  assert.equal(row.RecipientName, p.recipients[0].recipientName);
  const publicData = JSON.stringify(h.ctx.publicEvents_());
  for (const key of [
    "RecipientName",
    "Address",
    "Phone",
    "OrganizationEmail",
    "DietaryRestrictions",
  ])
    assert.ok(!publicData.includes(key));
  p.submissionId = crypto.randomUUID();
  p.recipients[0].notes = "private";
  code(h.public(p), "INVALID");
});
test("sorting sheet rows preserves durable-ID edits and relationships", () => {
  const h = harness(),
    e = createEvent(h),
    a = ok(h.public(payload(e.EventID, [1, 2])));
  const t = h.tables.get("RECIPIENTS");
  t.rows = [t.rows[0], ...t.rows.slice(1).reverse()];
  const p = editPayload(h, a.referralId);
  const id = p.recipientId;
  p.mealCount = 4;
  ok(h.admin("editRecipient", p));
  assert.equal(
    h.get("RECIPIENTS").find((r) => r.RecipientID === id).MealCount,
    4,
  );
});
test("repeatable schema setup preserves legacy tabs; migration is blocked pending mapping approval", () => {
  const h = harness(),
    legacy = JSON.stringify(h.tables.get("Requests"));
  h.ctx.setupDevelopmentSchema_();
  assert.equal(JSON.stringify(h.tables.get("Requests")), legacy);
  assert.equal(h.ctx.legacyMigrationPlan_().canMigrate, false);
  h.props.MEALS_SPREADSHEET_ID = "synthetic-shared-sheet";
  const fingerprint = h.ctx.fingerprint_;
  const restrictedFingerprint = vm.runInContext("RESTRICTED_SHARED_SHEET_FINGERPRINT_", h.ctx);
  h.ctx.fingerprint_ = id => id === h.props.MEALS_SPREADSHEET_ID
    ? restrictedFingerprint : fingerprint(id);
  assert.throws(() => h.ctx.schemaPlan_(), /Shared-spreadsheet development/);
  h.props.MEALS_SHARED_SHEET_DEV_ID = h.props.MEALS_SPREADSHEET_ID;
  const settings = JSON.stringify(h.tables.get("Settings"));
  const calls = h.state.batchCalls;
  h.ctx.setupDevelopmentSchema_();
  h.ctx.setupDevelopmentSchema_();
  assert.equal(h.state.batchCalls, calls);
  const e = createEvent(h);
  ok(h.public(payload(e.EventID, [2, 3])));
  assert.equal(JSON.stringify(h.tables.get("Requests")), legacy);
  assert.equal(JSON.stringify(h.tables.get("Settings")), settings);
});
test("completed event requires explicit audited reopen, and does not automatically reopen publicly", () => {
  const h = harness(),
    e = createEvent(h);
  ok(
    h.admin("saveEvent", {
      eventId: e.EventID,
      version: 1,
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      capacity: 20,
      startAddress: e.StartAddress,
      status: "Completed",
    }),
  );
  code(h.admin("createReferral", payload(e.EventID, [1])), "READ_ONLY");
  ok(
    h.admin("archive", {
      eventId: e.EventID,
      version: 2,
      mode: "reopen",
      confirmed: true,
    }),
  );
  assert.equal(h.get("EVENTS")[0].Status, "Closed");
  assert.equal(h.ctx.publicEvents_().length, 0);
});
test("provider coordinates remain transient; no Google coordinates in Sheets or audit", () => {
  const h = harness(),
    e = createEvent(h);
  ok(h.public(payload(e.EventID, [1])));
  h.props.MEALS_MAPS_LIVE_ENABLED = "true";
  h.props.MEALS_ADDRESS_API_KEY = "synthetic-only";
  h.state.fetch = () => ({
    getResponseCode: () => 200,
    getContentText: () =>
      JSON.stringify({
        result: {
          verdict: { addressComplete: true, validationGranularity: "PREMISE" },
          geocode: {
            location: { latitude: 12.3456789, longitude: 98.7654321 },
          },
        },
      }),
  });
  const r = h.get("RECIPIENTS")[0];
  ok(
    h.admin("verifyAddress", {
      entity: "recipient",
      recipientId: r.RecipientID,
      version: r.Version,
    }),
  );
  assert.ok(!h.snapshot().includes("12.3456789"));
  assert.ok(!h.snapshot().includes("98.7654321"));
});
test("application Maps quotas block calls before incurring usage", () => {
  const h = harness(),
    e = createEvent(h);
  ok(h.public(payload(e.EventID, [1])));
  h.props.MEALS_MAPS_LIVE_ENABLED = "true";
  h.props.MEALS_ADDRESS_API_KEY = "synthetic-only";
  h.props.MEALS_MAPS_USAGE_DAY = JSON.stringify({
    date: h.ctx.Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd"),
    validation: 800,
    optimization: 0,
  });
  const r = h.get("RECIPIENTS")[0];
  code(
    h.admin("verifyAddress", {
      entity: "recipient",
      recipientId: r.RecipientID,
      version: r.Version,
    }),
    "API_QUOTA",
  );
  assert.equal(h.state.apiCalls, 0);
});
test("raw third-party failures never expose messages, codes or secrets", () => {
  const h = harness();
  const r = h.ctx.safeBoundary_(() => {
    const e = new Error("secret spreadsheet and token");
    e.code = 403;
    throw e;
  });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, "UNAVAILABLE");
  assert.ok(!r.error.message.includes("secret"));
});
test("address abbreviations and conservative similarity preserve unit distinctions", () => {
  const h = harness();
  assert.equal(
    h.ctx.addressKey_("123 Main Street Apt 2, Martinsville, Virginia"),
    h.ctx.addressKey_("123 Main St Unit 2, Martinsville, VA"),
  );
  assert.equal(
    h.ctx.similarAddress_(
      "123 main st martinsville va 24112",
      "123 main st martinsville va",
    ),
    false,
  );
  assert.equal(
    h.ctx.similarAddress_(
      "123 main st martinsville va unit 2",
      "123 main st martinsville va unit 3",
    ),
    false,
  );
});

test("precreated schema bootstraps only an empty ADMINUSERS tab and preserves all other tabs", () => {
  const h = harness();
  h.props.MEALS_SPREADSHEET_ID = "synthetic-shared-sheet";
  h.props.MEALS_SHARED_SHEET_DEV_ID = h.props.MEALS_SPREADSHEET_ID;
  h.tables.get("ADMINUSERS").rows = [h.tables.get("ADMINUSERS").rows[0]];
  const legacy = JSON.stringify([
    h.tables.get("Requests"),
    h.tables.get("Settings"),
  ]);
  h.failNext();
  assert.throws(() => h.ctx.setupDevelopmentSchema_(), /Injected atomic/);
  assert.equal(h.get("ADMINUSERS").length, 0);
  h.ctx.setupDevelopmentSchema_();
  assert.equal(h.get("ADMINUSERS").length, 2);
  const accounts = JSON.stringify(h.tables.get("ADMINUSERS"));
  h.ctx.setupDevelopmentSchema_();
  assert.equal(JSON.stringify(h.tables.get("ADMINUSERS")), accounts);
  assert.equal(
    JSON.stringify([h.tables.get("Requests"), h.tables.get("Settings")]),
    legacy,
  );
});

test("Maps-disabled manual review supports final saved routes with confirmation, authorization, audit and stale-edit checks", () => {
  const h = harness(),
    e = createEvent(h);
  const receipt = ok(h.public(payload(e.EventID, [2, 3])));
  ok(approve(h, [receipt.referralId]));
  const ids = h.get("RECIPIENTS").map((r) => r.RecipientID);
  code(
    h.admin("manualAddressReview", {
      entity: "event",
      eventId: e.EventID,
      version: 1,
    }),
    "CONFIRM",
  );
  ok(
    h.admin("manualAddressReview", {
      entity: "event",
      eventId: e.EventID,
      version: 1,
      confirmed: true,
    }),
  );
  for (const r of h.get("RECIPIENTS")) {
    ok(
      h.admin("manualAddressReview", {
        entity: "recipient",
        recipientId: r.RecipientID,
        version: r.Version,
        confirmed: true,
      }),
    );
    code(
      h.admin("manualAddressReview", {
        entity: "recipient",
        recipientId: r.RecipientID,
        version: r.Version,
        confirmed: true,
      }),
      "CONFLICT",
    );
  }
  const route = ok(h.admin("route", { eventId: e.EventID }));
  assert.equal(route.mapsEnabled, false);
  assert.equal(route.isFinal, false);
  const saved = ok(
    h.admin("reorder", {
      eventId: e.EventID,
      routeVersion: route.version,
      recipientIds: ids.reverse(),
    }),
  );
  assert.equal(saved.isFinal, true);
  assert.equal(saved.totalMeals, 5);
  assert.equal(h.state.apiCalls, 0);
  assert.equal(
    h.get("AUDITLOG").filter((x) => x.Action === "Address Manually Reviewed")
      .length,
    3,
  );
  const p = editPayload(h, receipt.referralId);
  p.address = "456 Synthetic Avenue";
  ok(h.admin("editRecipient", p));
  const changed = ok(h.admin("route", { eventId: e.EventID }));
  assert.equal(changed.isFinal, false);
  assert.equal(changed.unresolved.length, 1);
  const event = h.get("EVENTS")[0];
  ok(
    h.admin("archive", {
      eventId: event.EventID,
      version: event.Version,
      confirmed: true,
      mode: "archive",
    }),
  );
  code(
    h.admin("manualAddressReview", {
      entity: "event",
      eventId: event.EventID,
      version: h.get("EVENTS")[0].Version,
      confirmed: true,
    }),
    "READ_ONLY",
  );
});

test("routing diagnostics expose only bounded machine codes, never provider secrets or addresses", () => {
  const h = harness();
  const response = body => ({ getResponseCode: () => 403, getContentText: () => body });
  const msg = h.ctx.routingFailureMessage_(response(JSON.stringify({ error: {
    status: "PERMISSION_DENIED", message: "private address / private token",
    details: [{ reason: "ACCESS_TOKEN_SCOPE_INSUFFICIENT", metadata: { secret: "private token" } },
      { reason: "private address" }]
  }})));
  assert.match(msg, /HTTP 403/);
  assert.match(msg, /ACCESS_TOKEN_SCOPE_INSUFFICIENT/);
  assert.match(msg, /New version/);
  assert.doesNotMatch(msg, /private/);
  assert.match(h.ctx.routingFailureMessage_(response("not JSON private token")), /previous order is unchanged/);
  assert.doesNotMatch(h.ctx.routingFailureMessage_(response('{"error":{"details":"private"}}')), /private/);
});

test("routing diagnostic functions require an independently authorized administrator", () => {
  const h = harness();
  h.state.active = "unauthorized@example.test";
  h.state.effective = h.state.active;
  assert.throws(() => h.ctx.checkRoutingConnection(), /approved administrator/);
  assert.throws(() => h.ctx.authorizeRouting(), /approved administrator/);
  assert.equal(h.state.apiCalls, 0);
});

test("four siblings can be managed independently across capacity, reports and delivery output", () => {
  const h = harness(), event = createEvent(h, 8), eventId = event.EventID;
  const form = payload(eventId, [2, 2, 2, 2]);
  const receipt = ok(h.public(form));
  const dashboard = () => ok(h.admin("dashboard", { eventId }));
  const route = () => ok(h.admin("route", { eventId }));
  const report = () => ok(h.admin("reports", { eventId }));
  const ids = h.get("RECIPIENTS").map(r => r.RecipientID);
  const recipient = i => dashboard().recipients.find(r => r.RecipientID === ids[i]);
  const change = (status, indices, reason) => h.admin("statuses", {
    status, recipients: indices.map(i => selection(recipient(i))), reason,
  });
  const assertCounts = (pending, approved, rejected, approvedMeals, available) => {
    const d = dashboard(), r = report();
    assert.deepEqual([d.pendingRecipients, d.approvedRecipients, d.rejectedRecipients, d.approvedMeals, d.available],
      [pending, approved, rejected, approvedMeals, available]);
    assert.deepEqual([r.totals.pendingRecipients, r.totals.approvedRecipients, r.totals.rejectedRecipients,
      r.totals.approvedMeals, r.totals.remainingCapacity], [pending, approved, rejected, approvedMeals, available]);
    assert.equal(d.submittedRecipients, 4);
    assert.equal(r.totals.originallyRequestedMeals, 8);
    assert.equal(d.deliveryStops, approved);
    assert.equal(route().totalMeals, approvedMeals);
    assert.equal(r.organizations[0].referrals, 1);
    assert.equal(r.organizations[0].approvedMeals, approvedMeals);
    assert.equal(r.organizations[0].reservedMeals, 8 - available);
    assert.equal(h.ctx.publicEvents_()[0].remaining, available);
  };
  assertCounts(4, 0, 0, 0, 0);
  const stale = selection(recipient(0));
  ok(change("Approved", [0]));
  assertCounts(3, 1, 0, 2, 0);
  code(h.admin("statuses", { status: "Rejected", recipients: [stale] }), "CONFLICT");
  code(change("Approved", [0]), "INVALID");
  code(change("Approved", [1, 1]), "INVALID");
  ok(change("Approved", [1, 2]));
  assertCounts(1, 3, 0, 6, 0);
  ok(change("Rejected", [0], "Synthetic reason"));
  assertCounts(1, 2, 1, 4, 2);
  assert.equal(recipient(0).RejectionReason, "Synthetic reason");
  code(change("Approved", [0]), "INVALID");
  ok(change("Pending", [0]));
  assertCounts(2, 2, 0, 4, 0);
  ok(change("Approved", [0, 3]));
  assertCounts(0, 4, 0, 8, 0);
  const savedSiblings = h.get("RECIPIENTS").slice(1).map(r => JSON.stringify(r));
  ok(change("Rejected", [0], "Synthetic reason"));
  assertCounts(0, 3, 1, 6, 2);
  assert.deepEqual(h.get("RECIPIENTS").slice(1).map(r => JSON.stringify(r)), savedSiblings);
  assert.ok(!route().stops.some(s => s.recipientId === ids[0]));

  const second = recipient(1);
  const oldRouteVersion = route().version;
  const edit = { ...selection(second), ...form.recipients[1],
    address: "900 Other Synthetic Road", recipientName: "Updated Synthetic Recipient" };
  code(h.admin("editRecipient", { ...edit, mealCount: 5 }), "CAPACITY");
  ok(h.admin("editRecipient", { ...edit, mealCount: 4 }));
  assertCounts(0, 3, 1, 8, 0);
  assert.equal(route().stops.find(r => r.recipientId === ids[1]).address, edit.address);
  code(change("Pending", [0]), "CAPACITY");
  code(h.admin("deliveryPdf", { eventId, routeVersion: oldRouteVersion }), "CONFLICT");
  ok(h.admin("editRecipient", { ...edit, ...selection(recipient(1)), mealCount: 2 }));
  assertCounts(0, 3, 1, 6, 2);
  const audit = h.get("AUDITLOG");
  assert.ok(audit.some(a => a.EntityID === ids[0] && a.Action === "Recipient Returned to Pending" &&
    JSON.parse(a.OldValue).RejectionReason === "Synthetic reason"));
  for (const s of route().stops) ok(h.admin("manualAddressReview", {
    entity: "recipient", confirmed: true, ...selection(dashboard().recipients.find(r => r.RecipientID === s.recipientId)),
  }));
  ok(h.admin("manualAddressReview", { entity: "event", eventId, confirmed: true, version: event.Version }));
  const final = ok(h.admin("reorder", { eventId, routeVersion: route().version, recipientIds: ids.slice(1).reverse() }));
  assert.equal(final.totalMeals, 6);
  h.state.convertPdf = html => {
    assert.match(html, /Updated Synthetic Recipient/);
    assert.match(html, /900 Other Synthetic Road/);
    assert.doesNotMatch(html, /Synthetic Recipient 1\b/);
    return Buffer.from("%PDF-1.7\nSynthetic conversion");
  };
  ok(h.admin("deliveryPdf", { eventId, routeVersion: final.version }));
  assert.deepEqual(ok(h.public(form)), receipt);
});

test("legacy decisions and route order survive the additive headers and first recipient change", () => {
  const h = harness(), e = createEvent(h);
  const receipt = ok(h.public(payload(e.EventID, [2, 3])));
  const refs = h.tables.get("REFERRALS"), rows = h.tables.get("RECIPIENTS");
  refs.rows[1][refs.rows[0].indexOf("Status")] = "Approved";
  rows.rows[1][rows.rows[0].indexOf("RoutePosition")] = 2;
  rows.rows[2][rows.rows[0].indexOf("RoutePosition")] = 1;
  for (const r of rows.rows) r.splice(19);
  const legacy = rows.rows.slice(1).map(r => [...r]);
  code(h.admin("dashboard", { eventId: e.EventID }), "SCHEMA");
  rows.rows[0].push("Status", "RejectionReason"); // same cells as the documented upgrade
  const db = () => ok(h.admin("dashboard", { eventId: e.EventID }));
  const d = db();
  assert.deepEqual(rows.rows.slice(1), legacy);
  assert.equal(d.approvedRecipients, 2);
  assert.equal(d.approvedMeals, 5);
  assert.equal(d.recipients[0].ReferralID, receipt.referralId);
  assert.equal(d.recipients[0].SubmittedAt, h.get("REFERRALS")[0].SubmittedAt);
  const route = () => ok(h.admin("route", { eventId: e.EventID }));
  assert.deepEqual(route().stops.map(r => r.recipientId), d.recipients.map(r => r.RecipientID).reverse());
  ok(h.admin("statuses", { status: "Rejected", recipients: [selection(d.recipients[0])] }));
  assert.equal(db().approvedRecipients, 1);
  assert.equal(db().reserved, 3);
  assert.equal(h.get("RECIPIENTS")[1].Status, "");
  assert.equal(h.get("REFERRALS")[0].Status, "Approved");
});

test("permanent deletion checks opt-in, admin, confirmation, version and rejection and preserves receipts and audit", () => {
  const h = harness(), e = createEvent(h);
  const form = payload(e.EventID, [2, 2, 2, 2]);
  const receipt = ok(h.public(form));
  const only = payload(e.EventID, [1], { organizationName: "Second Synthetic Organization" });
  const onlyReceipt = ok(h.public(only));
  const rows = h.get("RECIPIENTS"), target = rows[1];
  const action = "deleteRejectedRecipient";
  const deletion = { ...selection(target), confirmed: true };
  code(h.admin(action, deletion), "FORBIDDEN");
  h.props.MEALS_RECIPIENT_DELETION_ENABLED = "true";
  code(h.admin(action, deletion), "INVALID");
  h.state.active = h.state.effective = "other@example.test";
  code(h.admin(action, deletion), "FORBIDDEN");
  h.state.active = h.state.effective = "admin-one@example.test";
  ok(h.admin("statuses", { status: "Rejected", reason: "Synthetic test", recipients: [selection(target), selection(rows[4])] }));
  code(h.admin(action, deletion), "CONFLICT");
  const current = h.get("RECIPIENTS")[1], audit = JSON.stringify(h.get("AUDITLOG"));
  deletion.version = current.Version;
  code(h.admin(action, { ...deletion, confirmed: false }), "CONFIRM");
  const before = h.snapshot();
  h.failNext();
  code(h.admin(action, deletion), "UNAVAILABLE");
  assert.equal(h.snapshot(), before);
  const remaining = h.get("RECIPIENTS").filter(r => r.RecipientID !== current.RecipientID);
  const parents = JSON.stringify(h.get("REFERRALS")), receipts = JSON.stringify(h.get("SUBMISSIONS"));
  ok(h.admin(action, deletion));
  assert.deepEqual(h.get("RECIPIENTS"), remaining);
  assert.equal(JSON.stringify(h.get("AUDITLOG").slice(0, -1)), audit);
  const last = h.get("AUDITLOG").at(-1);
  assert.equal(last.EntityID, target.RecipientID);
  assert.equal(JSON.parse(last.OldValue).RejectionReason, "Synthetic test");
  assert.ok(!last.OldValue.includes(target.Address));
  assert.equal(JSON.stringify(h.get("REFERRALS")), parents);
  assert.equal(JSON.stringify(h.get("SUBMISSIONS")), receipts);
  assert.deepEqual(ok(h.public(form)), receipt);
  ok(h.admin(action, { ...selection(remaining.at(-1)), confirmed: true }));
  assert.deepEqual(ok(h.public(only)), onlyReceipt);
  const recovered = JSON.parse(h.ctx.doGet({ parameter: { action: "submissionReceipt", submissionId: only.submissionId } }).text);
  assert.deepEqual(ok(recovered).receipt, onlyReceipt);
  const d = ok(h.admin("dashboard", { eventId: e.EventID }));
  assert.equal(d.submittedRecipients, 5);
  assert.equal(d.recipients.length, 3);
  assert.equal(d.reserved, 6);
});
