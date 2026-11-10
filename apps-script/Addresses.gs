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
function verifyAddress_(p, a) {
  const isStart = p.entity === "event",
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
    const admin = a.recheck(s),
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
