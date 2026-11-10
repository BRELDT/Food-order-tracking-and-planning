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
