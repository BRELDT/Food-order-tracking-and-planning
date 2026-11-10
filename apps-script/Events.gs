function reserved_(s, eventId) {
  const active = new Set(
    s.REFERRALS.filter(
      (r) =>
        r.EventID === eventId && ["Pending", "Approved"].includes(r.Status),
    ).map((r) => r.ReferralID),
  );
  return linkedRecipients_(s).filter((r) => r.EventID === eventId && active.has(r.ReferralID)).reduce(
    (n, r) => n + Number(r.MealCount),
    0,
  );
}
function available_(s, e) {
  return Number(e.Capacity) - reserved_(s, e.EventID);
}
function editable_(e) {
  if (e.Archived === true || e.Status === "Completed")
    fail_("READ_ONLY", "Reopen or unarchive this event before making changes.");
}
function routeDirty_(e) {
  e.RouteVersion = Number(e.RouteVersion) + 1;
  e.RouteNeedsReview = true;
}
function eventInput_(p) {
  const date = text_(p.deliveryDate, "delivery date", 10, true);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    new Date(date + "T12:00:00Z").toISOString().slice(0, 10) !== date
  )
    fail_("INVALID", "Please check the delivery date.");
  const status = p.status || "Draft";
  if (!["Draft", "Open", "Closed", "Completed"].includes(status))
    fail_("INVALID", "Please check event status.");
  const capacity = integer_(p.capacity, "meal capacity", 0, 100000);
  const startAddress = text_(p.startAddress, "pickup address", 500, status === "Open");
  if (status === "Open" && capacity < 1)
    fail_("INVALID", "Set a positive meal capacity before opening referrals.");
  return {
    EventName: text_(p.eventName, "event name", 160, true),
    DeliveryDate: date,
    Capacity: capacity,
    StartAddress: startAddress,
    Status: status,
  };
}
function eventWrite_(s, p, admin) {
  const input = eventInput_(p);
  if (!p.eventId) {
    const creationId = p.creationId ? submissionId_(p.creationId) : uuid_();
    const prior = s.EVENTS.find(e => e.EventID === creationId);
    if (prior) {
      if (Object.keys(input).some(k => input[k] !== prior[k]))
        fail_("IDEMPOTENCY", "This event creation was already saved with different settings. Refresh the event list before continuing.");
      return prior;
    }
    const e = Object.assign(input, {
      EventID: creationId,
      Archived: false,
      ArchivedDate: "",
      CreatedAt: now_(),
      UpdatedAt: now_(),
      Version: 1,
      RouteVersion: 1,
      RouteNeedsReview: true,
      StartAddressStatus: addressProofStatus_(
        input.StartAddress,
        p.addressReceipt,
      ),
    });
    s.EVENTS.push(e);
    audit_(s, admin, "Event Created", "Event", e.EventID, null, input);
    return e;
  }
  const e = byId_(s, "EVENTS", p.eventId);
  editable_(e);
  version_(e, p.version);
  const reserved = reserved_(s, e.EventID);
  if (input.Capacity < reserved)
    fail_(
      "CAPACITY",
      "Capacity cannot be reduced below the " +
        reserved +
        " meals already reserved.",
    );
  const old = {
    EventName: e.EventName,
    DeliveryDate: e.DeliveryDate,
    Capacity: e.Capacity,
    StartAddress: e.StartAddress,
    Status: e.Status,
  };
  if (input.StartAddress !== e.StartAddress) {
    e.StartAddressStatus = "Needs Review";
    routeDirty_(e);
  }
  if (p.addressReceipt) {
    e.StartAddressStatus = addressProofStatus_(
      input.StartAddress,
      p.addressReceipt,
    );
    routeDirty_(e);
  }
  Object.assign(e, input);
  touch_(e);
  audit_(
    s,
    admin,
    old.Capacity !== e.Capacity ? "Capacity Changed" : "Event Edited",
    "Event",
    e.EventID,
    old,
    input,
  );
  return e;
}
function archiveWrite_(s, p, admin) {
  const e = byId_(s, "EVENTS", p.eventId);
  version_(e, p.version);
  if (p.confirmed !== true)
    fail_("CONFIRM", "Confirm this event action first.");
  const old = { Status: e.Status, Archived: e.Archived };
  if (p.mode === "archive") {
    e.Archived = true;
    e.ArchivedDate = now_();
  } else if (p.mode === "reopen") {
    e.Archived = false;
    e.ArchivedDate = "";
    if (e.Status === "Completed") e.Status = "Closed";
  } else fail_("INVALID", "Unknown event action.");
  touch_(e);
  audit_(
    s,
    admin,
    p.mode === "archive" ? "Event Archived" : "Event Reopened / Unarchived",
    "Event",
    e.EventID,
    old,
    { Status: e.Status, Archived: e.Archived },
  );
  return e;
}
function acceptsPublicReferrals_(e) {
  return e.Status === "Open" && e.Archived !== true &&
    e.DeliveryDate >= Utilities.formatDate(new Date(), "America/New_York", "yyyy-MM-dd");
}
function publicEvents_() {
  const s = load_();
  return s.EVENTS.filter(acceptsPublicReferrals_)
    .map((e) => ({
      eventId: e.EventID,
      eventName: e.EventName,
      deliveryDate: e.DeliveryDate,
      remaining: available_(s, e),
    }))
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
}
