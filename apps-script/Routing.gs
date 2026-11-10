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
