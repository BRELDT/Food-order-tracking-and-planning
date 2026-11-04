const MEAL_LIMITS = Object.freeze({
  recipients: 100,
  bytes: 180000,
  text: 1000,
  meals: 10000,
});
function fail_(code, message) {
  const e = new Error(message);
  e.code = code;
  e.clientSafe = true;
  throw e;
}
function text_(value, label, max, required) {
  if (typeof value !== "string" && value != null)
    fail_("INVALID", label + " must be text.");
  const s = String(value == null ? "" : value).trim();
  if (
    (required && !s) ||
    s.length > max ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s)
  )
    fail_("INVALID", "Please check " + label + ".");
  return s;
}
function integer_(v, label, min, max) {
  if (v === "" || v == null || typeof v === "boolean")
    fail_("INVALID", "Please check " + label + ".");
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n < min || n > max)
    fail_("INVALID", "Please check " + label + ".");
  return n;
}
function id_(v) {
  return text_(v, "record ID", 100, true);
}
function submissionId_(v) {
  const id = String(v || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
    fail_("INVALID", "A valid submission ID is required.");
  return id;
}
function uuid_() {
  return Utilities.getUuid();
}
function now_() {
  return new Date().toISOString();
}
function normalize_(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9#]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
function addressKey_(s) {
  return normalize_(s)
    .replace(
      /\b(street|road|avenue|drive|boulevard|lane|court)\b/g,
      (v) =>
        ({
          street: "st",
          road: "rd",
          avenue: "ave",
          drive: "dr",
          boulevard: "blvd",
          lane: "ln",
          court: "ct",
        })[v],
    )
    .replace(/\b(apartment|suite)\b/g, "unit")
    .replace(/\bapt\b/g, "unit")
    .replace(/#\s*/g, "unit ")
    .replace(/\bvirginia\b/g, "va")
    .replace(/\bnorth\b/g, "n")
    .replace(/\bsouth\b/g, "s")
    .replace(/\beast\b/g, "e")
    .replace(/\bwest\b/g, "w");
}
function phoneKey_(s) {
  return String(s || "")
    .replace(/\D/g, "")
    .replace(/^1(?=\d{10}$)/, "");
}
function organization_(p) {
  const name = text_(p.organizationName, "organization name", 160, true);
  const email = text_(p.organizationEmail, "organization email", 254, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail_("INVALID", "Please enter a valid organization email.");
  const phone = text_(p.organizationPhone, "organization phone", 40, true);
  if (phoneKey_(phone).length < 7)
    fail_("INVALID", "Please enter an organization phone number.");
  return {
    OrganizationName: name,
    OrganizationKey: normalize_(name),
    OrganizationEmail: email,
    OrganizationPhone: phone,
  };
}
function recipients_(list, admin) {
  if (
    !Array.isArray(list) ||
    !list.length ||
    list.length > MEAL_LIMITS.recipients
  )
    fail_("INVALID", "Enter between 1 and 100 recipients.");
  return list.map((p) => {
    if (!p || typeof p !== "object")
      fail_("INVALID", "Please check the recipient information.");
    const address = text_(p.address, "street address", 500, true);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
      fail_("INVALID", "Enter the recipient's street address, not an email address.");
    const door = text_(
      p.doorPreference || "Front",
      "door preference",
      20,
      true,
    );
    if (!["Front", "Side", "Back", "Other"].includes(door))
      fail_("INVALID", "Please check the preferred door.");
    if (!admin && p.notes)
      fail_("INVALID", "Internal notes are administrator-only.");
    return {
      RecipientName: text_(p.recipientName, "recipient name", 160, true),
      Address: address,
      NormalizedAddress: addressKey_(address),
      Phone: text_(p.phone, "recipient phone", 40, false),
      MealCount: integer_(p.mealCount, "number of meals", 1, MEAL_LIMITS.meals),
      DietaryRestrictions: text_(
        p.dietaryRestrictions,
        "dietary restrictions",
        500,
        false,
      ),
      DoorPreference: door,
      DeliveryInstructions: text_(
        p.deliveryInstructions,
        "delivery instructions",
        1000,
        false,
      ),
      Notes: admin ? text_(p.notes, "internal notes", 1000, false) : "",
    };
  });
}
function canonicalSubmission_(p, admin) {
  return {
    EventID: id_(p.eventId),
    organization: organization_(p),
    recipients: recipients_(p.recipients, admin),
  };
}
function fingerprint_(v) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify(v),
    Utilities.Charset.UTF_8,
  )
    .map((n) => ("0" + ((n + 256) % 256).toString(16)).slice(-2))
    .join("");
}
function safeBoundary_(fn) {
  try {
    return { ok: true, data: fn() };
  } catch (e) {
    return {
      ok: false,
      error: {
        code: e.clientSafe ? e.code : "UNAVAILABLE",
        message: e.clientSafe
          ? e.message
          : "Your changes were not saved. Please try again.",
      },
    };
  }
}
