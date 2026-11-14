import test from "node:test";
import assert from "node:assert/strict";
import { harness, createEvent, payload, editPayload } from "./harness.mjs";
function configured() {
  const h = harness();
  h.props.MEALS_ADDRESS_AUTOCOMPLETE_ENABLED = "true";
  h.props.MEALS_ADDRESS_VALIDATION_ENABLED = "true";
  h.props.MEALS_PLACES_API_KEY = "synthetic-places-key";
  h.props.MEALS_ADDRESS_API_KEY = "synthetic-validation-key";
  return h;
}
function provider(h, recommended, verdict = {}, addressExtra = {}) {
  h.state.fetch = (url, options) => {
    h.state.lastRequest = { url, options, body: JSON.parse(options.payload) };
    return {
      getResponseCode: () => 200,
      getContentText: () =>
        JSON.stringify({
          result: {
            verdict: {
              addressComplete: true,
              validationGranularity: "PREMISE",
              ...verdict,
            },
            address: { formattedAddress: recommended, ...addressExtra },
          },
        }),
    };
  };
}
function publicCall(h, action, p = {}) {
  return JSON.parse(
    h.ctx.doPost({ postData: { contents: JSON.stringify({ action, ...p }) } })
      .text,
  );
}
test("address services are independently disabled; no configuration keys or protected data exposed", () => {
  const h = harness(),
    e = createEvent(h);
  assert.deepEqual(publicCall(h, "addressConfig").data, {
    autocomplete: false,
    validation: false,
  });
  assert.equal(
    publicCall(h, "addressSuggestions", {
      eventId: e.EventID,
      address: "100 Synthetic",
      sessionToken: crypto.randomUUID(),
    }).error.code,
    "API_DISABLED",
  );
  assert.equal(h.state.apiCalls, 0);
  h.state.active = "";
  assert.equal(
    h.admin("addressPreview", { address: "100 Synthetic" }).error.code,
    "AUTH",
  );
});
test("Autocomplete New sends only address search data and session; returns minimal transient suggestions", () => {
  const h = configured(),
    e = createEvent(h),
    sessionToken = crypto.randomUUID();
  h.state.fetch = (url, options) => {
    assert.equal(url, "https://places.googleapis.com/v1/places:autocomplete");
    const b = JSON.parse(options.payload);
    assert.equal(b.input, "100 Synthetic");
    assert.equal(b.sessionToken, sessionToken);
    assert.equal(b.recipientName, undefined);
    assert.equal(b.phone, undefined);
    assert.equal(b.notes, undefined);
    assert.equal(b.eventId, undefined);
    assert.deepEqual(b.includedRegionCodes, ["us"]);
    return {
      getResponseCode: () => 200,
      getContentText: () =>
        JSON.stringify({
          suggestions: [
            {
              placePrediction: {
                text: { text: "100 Synthetic Lane, Example City, VA 00000" },
                placeId: "test",
              },
            },
          ],
        }),
    };
  };
  const snapshot = h.snapshot();
  const r = publicCall(h, "addressSuggestions", {
    eventId: e.EventID,
    address: "100 Synthetic",
    sessionToken,
    recipientName: "MUST NOT SEND",
    notes: "MUST NOT SEND",
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.data.suggestions, [
    { address: "100 Synthetic Lane, Example City, VA 00000" },
  ]);
  assert.equal(h.snapshot(), snapshot);
  assert.equal(h.state.externalDuringLock, false);
  assert.equal(h.props.MEALS_MAPS_LIVE_ENABLED, undefined);
});
test("equivalent address is verified without rewriting; signed proof applies to exact saved address only", () => {
  const h = configured(),
    e = createEvent(h),
    p = payload(e.EventID, [2]);
  const a = p.recipients[0].address;
  provider(h, a.toUpperCase());
  const r = h.admin("addressPreview", {
    address: a,
    sessionToken: crypto.randomUUID(),
    phone: "NOT SENT",
  });
  assert.equal(r.ok, true);
  assert.equal(r.data.equivalent, true);
  assert.equal(r.data.confident, true);
  assert.deepEqual(Object.keys(h.state.lastRequest.body).sort(), [
    "address",
    "sessionToken",
  ]);
  p.recipients[0].addressReceipt = r.data.originalReceipt;
  const receipt = h.public(p);
  assert.equal(receipt.ok, true);
  assert.equal(h.get("RECIPIENTS")[0].AddressStatus, "Confirmed");
  assert.equal(h.get("RECIPIENTS")[0].Address, a);
  assert.equal(
    h.ctx.addressProofStatus_(a + " Unit 9", r.data.originalReceipt),
    "Needs Review",
  );
  assert.equal(
    h.ctx.addressProofStatus_(a, r.data.originalReceipt + "x"),
    "Needs Review",
  );
  assert.equal(
    h.ctx.addressProofStatus_(a, '{"status":"Confirmed"}'),
    "Needs Review",
  );
  delete h.props.MEALS_ADDRESS_RECEIPT_SECRET;
  assert.deepEqual(h.public(p).data, receipt.data); // Retry ignores expired/rotated proof metadata.
});
test("material recommendation requires choice; kept original remains Needs Review; recommended final value can verify", () => {
  const h = configured(),
    e = createEvent(h),
    original = "100 Synthetic Lane, Example City, VA 00000",
    recommended = "102 Synthetic Lane, Example City, VA 00000";
  provider(h, recommended, { hasReplacedComponents: true });
  const r = h.admin("addressPreview", { address: original }).data;
  assert.equal(r.equivalent, false);
  assert.equal(r.confident, true);
  assert.equal(
    h.ctx.addressProofStatus_(original, r.originalReceipt),
    "Needs Review",
  );
  assert.equal(
    h.ctx.addressProofStatus_(recommended, r.recommendedReceipt),
    "Confirmed",
  );
  const p = payload(e.EventID, [2]);
  p.recipients[0].address = recommended;
  p.recipients[0].addressReceipt = r.recommendedReceipt;
  assert.equal(h.public(p).ok, true);
  assert.equal(h.get("RECIPIENTS")[0].Address, recommended);
});
test("missing, differing and unconfirmed units never silently disappear or become verified", () => {
  const h = configured(),
    original = "100 Synthetic Lane Apt 4, Example City, VA 00000";
  provider(h, "100 Synthetic Lane, Example City, VA 00000");
  let r = h.admin("addressPreview", { address: original }).data;
  assert.match(r.recommended, /Apt 4/);
  assert.equal(r.unitIssue, true);
  assert.equal(r.confident, false);
  provider(h, "100 Synthetic Lane Apt 5, Example City, VA 00000", {
    validationGranularity: "SUB_PREMISE",
  });
  r = h.admin("addressPreview", { address: original }).data;
  assert.equal(r.recommended, original);
  assert.equal(r.unitIssue, true);
  assert.equal(r.confident, false);
  provider(h, original, {
    hasUnconfirmedComponents: true,
    validationGranularity: "SUB_PREMISE",
  });
  assert.equal(
    h.admin("addressPreview", { address: original }).data.confident,
    false,
  );
});
test("selected suggestion retains typed unit in validation input; only confident SUB_PREMISE can verify", () => {
  const h = configured(),
    original = "100 Synthetic Apt 4";
  provider(h, "100 Synthetic Lane Apt 4, Example City, VA 00000", {
    validationGranularity: "SUB_PREMISE",
  });
  const r = h.admin("addressPreview", {
    address: original,
    candidate: "100 Synthetic Lane, Example City, VA 00000",
  });
  assert.match(h.state.lastRequest.body.address.addressLines[0], /Apt 4/);
  assert.equal(r.data.confident, true);
  assert.equal(r.data.equivalent, false);
});
test("validation fallback does not block reservations, and provider errors never expose credentials or raw responses", () => {
  const h = configured(),
    e = createEvent(h);
  h.state.fetch = () => ({
    getResponseCode: () => 403,
    getContentText: () => "secret debug key",
  });
  const r = publicCall(h, "addressPreview", {
    eventId: e.EventID,
    address: "100 Synthetic Lane",
  });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, "ADDRESS_UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(r), /secret debug/);
  assert.equal(h.public(payload(e.EventID, [2])).ok, true);
  assert.equal(h.get("RECIPIENTS")[0].AddressStatus, "Needs Review");
  assert.equal(h.ctx.publicEvents_()[0].remaining, 18);
});
test("public address lookups require an open event; size/session checks and quotas happen before paid calls", () => {
  const h = configured(),
    e = createEvent(h);
  assert.equal(
    publicCall(h, "addressSuggestions", {
      eventId: e.EventID,
      address: "100 Synthetic",
      sessionToken: "bad token!",
    }).ok,
    false,
  );
  assert.equal(
    publicCall(h, "addressPreview", {
      eventId: e.EventID,
      address: "x".repeat(501),
    }).ok,
    false,
  );
  h.props.MEALS_MAPS_USAGE_DAY = JSON.stringify({
    date: h.ctx.Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd"),
    autocomplete: 1500,
  });
  assert.equal(
    publicCall(h, "addressSuggestions", {
      eventId: e.EventID,
      address: "100 Synthetic",
      sessionToken: crypto.randomUUID(),
    }).error.code,
    "API_QUOTA",
  );
  h.seed((s) => {
    s.EVENTS[0].Archived = true;
  });
  assert.equal(
    publicCall(h, "addressPreview", {
      eventId: e.EventID,
      address: "100 Synthetic",
    }).error.code,
    "CLOSED",
  );
  assert.equal(h.state.apiCalls, 0);
});
test("admin edits and pickup saves persist selected verified address and retain stale version guards", () => {
  const h = configured(),
    e = createEvent(h),
    r = h.public(payload(e.EventID, [2])).data;
  const p = editPayload(h, r.referralId);
  p.address = "200 Synthetic Lane, Example City, VA 00000";
  provider(h, p.address);
  p.addressReceipt = h.admin("addressPreview", {
    address: p.address,
  }).data.originalReceipt;
  assert.equal(h.admin("editRecipient", p).ok, true);
  assert.equal(h.get("RECIPIENTS")[0].AddressStatus, "Confirmed");
  assert.equal(h.admin("editRecipient", p).error.code, "CONFLICT");
  provider(h, e.StartAddress);
  const addressReceipt = h.admin("addressPreview", { address: e.StartAddress })
    .data.originalReceipt;
  assert.equal(
    h.admin("saveEvent", {
      eventId: e.EventID,
      version: e.Version,
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      capacity: e.Capacity,
      status: e.Status,
      startAddress: e.StartAddress,
      addressReceipt,
    }).data.StartAddressStatus,
    "Confirmed",
  );
  assert.equal(h.state.externalDuringLock, false);
});
test("multi-word suite/unit segments are preserved intact, and expired verification falls back safely", () => {
  const h = configured(),
    address = "100 Synthetic Lane Suite B East, Example City, VA 00000";
  provider(h, "100 Synthetic Lane, Example City, VA 00000");
  const r = h.admin("addressPreview", { address }).data;
  assert.match(r.recommended, /Suite B East/);
  assert.equal(r.confident, false);
  const token = h.ctx.addressReceipt_(address, "Confirmed");
  h.ctx.Date = class extends Date {
    static now() {
      return Date.now() + 7200001;
    }
  };
  assert.equal(h.ctx.addressProofStatus_(address, token), "Needs Review");
});

test("validation allows the 800th monthly call and blocks the next call before Google", () => {
  const h = configured(), e = createEvent(h);
  provider(h, "100 Synthetic Lane");
  const date = h.ctx.Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd");
  h.props.MEALS_MAPS_USAGE_MONTH = JSON.stringify({ month: date.slice(0, 7), validation: 799 });
  assert.equal(publicCall(h, "addressPreview", { eventId: e.EventID, address: "100 Synthetic Lane" }).ok, true);
  assert.equal(JSON.parse(h.props.MEALS_MAPS_USAGE_MONTH).validation, 800);
  const calls = h.state.apiCalls;
  assert.equal(publicCall(h, "addressPreview", { eventId: e.EventID, address: "102 Synthetic Lane" }).error.code, "API_QUOTA");
  assert.equal(h.state.apiCalls, calls);
  assert.equal(h.public(payload(e.EventID, [2])).ok, true);
  assert.equal(h.get("RECIPIENTS")[0].AddressStatus, "Needs Review");
});

test("validation allows the 800th daily call and blocks the next call before Google", () => {
  const h = configured(), e = createEvent(h);
  provider(h, "100 Synthetic Lane");
  const date = h.ctx.Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd");
  h.props.MEALS_MAPS_USAGE_DAY = JSON.stringify({ date, validation: 799 });
  assert.equal(publicCall(h, "addressPreview", { eventId: e.EventID, address: "100 Synthetic Lane" }).ok, true);
  const calls = h.state.apiCalls;
  assert.equal(publicCall(h, "addressPreview", { eventId: e.EventID, address: "102 Synthetic Lane" }).error.code, "API_QUOTA");
  assert.equal(h.state.apiCalls, calls);
});

test("usage resets at Pacific month boundary, never at the earlier UTC month boundary", () => {
  const h = configured();
  let instant = "2026-11-01T00:30:00Z";
  h.ctx.Date = class extends Date {
    constructor(...args) { super(...(args.length ? args : [instant])); }
    static now() { return new Date(instant).getTime(); }
  };
  h.props.MEALS_MAPS_USAGE_MONTH = JSON.stringify({ month: "2026-10", validation: 800 });
  assert.throws(() => h.ctx.mapsUsage_("validation", 1), /usage limit/);
  assert.equal(JSON.parse(h.props.MEALS_MAPS_USAGE_MONTH).month, "2026-10");
  instant = "2026-11-01T07:00:00Z";
  h.ctx.mapsUsage_("validation", 1);
  assert.equal(JSON.parse(h.props.MEALS_MAPS_USAGE_MONTH).month, "2026-11");
  assert.equal(JSON.parse(h.props.MEALS_MAPS_USAGE_MONTH).validation, 1);
  assert.equal(JSON.parse(h.props.MEALS_MAPS_USAGE_DAY).date, "2026-11-01");
});
