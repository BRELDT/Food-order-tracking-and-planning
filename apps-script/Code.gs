const MEALS_BACKEND_VERSION = "2026-11-06-delivery-pdf-v1";
function include_(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}
function doGet(e) {
  if (e && e.parameter && e.parameter.page === "admin") {
    const auth = safeBoundary_(() => {
      const a = requireAdmin_();
      return a.email;
    });
    if (!auth.ok)
      return HtmlService.createHtmlOutput(
        "<h1>Administrator access unavailable</h1><p>Open the authenticated admin deployment using an approved Google account. If Google cannot identify your account, stop and contact the program administrator.</p>",
      );
    return HtmlService.createTemplateFromFile("Admin")
      .evaluate()
      .setTitle("Community Meals Administration")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }
  const action = e && e.parameter && e.parameter.action;
  if (action === "submissionReceipt")
    return json_(safeBoundary_(() => publicSubmissionReceipt_(e.parameter.submissionId)));
  return json_(
    action === "events"
      ? safeBoundary_(publicEvents_)
      : {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "This public operation is unavailable.",
          },
        },
  );
}
function publicSubmissionReceipt_(submissionId) {
  // Possession of an unguessable submission UUID is required. Return only the
  // same minimal public receipt; never referral/recipient/contact information.
  const id = submissionId_(submissionId);
  const s = load_(), record = s.SUBMISSIONS.find(r => r.SubmissionID === id);
  if (!record) return { receipt: null };
  const referral = submissionReferral_(s, record);
  if (referral.SubmittedByAdmin !== false) return { receipt: null };
  const receipt = savedSubmissionReceipt_(s, record);
  return { receipt: {
    referralId: receipt.referralId, eventName: receipt.eventName,
    meals: receipt.meals, recipients: receipt.recipients, status: "Pending"
  } };
}
function doPost(e) {
  return json_(
    safeBoundary_(() => {
      const raw = e && e.postData && e.postData.contents;
      if (!raw || Utilities.newBlob(raw).getBytes().length > MEAL_LIMITS.bytes)
        fail_("INVALID", "The request is too large. Submit fewer recipients.");
      let p;
      try {
        p = JSON.parse(raw);
      } catch (_) {
        fail_("INVALID", "The request could not be read.");
      }
      if (
        p &&
        ["addressConfig", "addressSuggestions", "addressPreview"].includes(
          p.action,
        )
      )
        return publicAddressCall_(p.action, p);
      if (!p || p.action !== "submit")
        fail_("FORBIDDEN", "This public operation is unavailable.");
      return submit_(p, null);
    }),
  );
}
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function adminCall(action, p) {
  return safeBoundary_(() => {
    // Authorization must happen before dispatch, including every read.
    const auth = requireAdmin_();
    p = p || {};
    if (
      Utilities.newBlob(JSON.stringify(p)).getBytes().length > MEAL_LIMITS.bytes
    )
      fail_("INVALID", "The request is too large.");
    if (action === "addressConfig") return addressFeatures_();
    if (action === "addressSuggestions") return addressSuggestions_(p);
    if (action === "addressPreview") return addressPreview_(p);
    if (action === "publicFormLink") return publicFormLink_();
    if (action === "identity")
      return {
        email: auth.email,
        environment: properties_().getProperty("MEALS_ENV"),
        backendVersion: MEALS_BACKEND_VERSION,
      };
    if (action === "events")
      return auth.state.EVENTS.slice().sort((a, b) =>
        a.DeliveryDate.localeCompare(b.DeliveryDate),
      );
    if (action === "dashboard") return dashboard_(auth.state, p);
    if (action === "route") return route_(auth.state, id_(p.eventId));
    if (action === "deliveryPdf") return deliveryPdf_(auth.state, p);
    if (action === "reports") return reports_(auth.state, p);
    if (action === "createReferral") return submit_(p, auth.email);
    if (action === "submissionReceipt") {
      const record = auth.state.SUBMISSIONS.find(r => r.SubmissionID === submissionId_(p.submissionId));
      if (!record) return { receipt: null };
      const parent = submissionReferral_(auth.state, record);
      return { receipt: parent.SubmittedByAdmin === true ? savedSubmissionReceipt_(auth.state, record) : null };
    }
    if (action === "verifyAddress") return verifyAddress_(p);
    if (action === "optimize") return optimize_(p);
    return locked_((s) => {
      const admin = admin_(s);
      switch (action) {
        case "manualAddressReview":
          return manualAddressReview_(s, p, admin);
        case "saveEvent":
          return eventWrite_(s, p, admin);
        case "archive":
          return archiveWrite_(s, p, admin);
        case "statuses":
          return statuses_(s, p, admin);
        case "editReferral":
          return editReferral_(s, p, admin);
        case "reorder":
          return routeOrder_(s, p, admin, false);
        default:
          fail_("FORBIDDEN", "This administrator operation is unavailable.");
      }
    });
  });
}
function publicFormLink_() {
  const url = String(properties_().getProperty("MEALS_PUBLIC_FORM_URL") || "").trim();
  if (!url)
    fail_("CONFIG", "The public referral website link is not configured yet. Add MEALS_PUBLIC_FORM_URL in Apps Script Script Properties using the public form website URL, not an admin or API URL.");
  if (
    !/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::443)?(?:\/[^\s\\]*)?$/i.test(url) ||
    /[?&](?:page=admin|action=)/i.test(url)
  )
    fail_("CONFIG", "MEALS_PUBLIC_FORM_URL must be an HTTPS public referral website link, not an admin or API URL.");
  return { url };
}
