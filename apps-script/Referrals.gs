function submit_(p, adminEmail, recheck = admin_) {
  const canonical = canonicalSubmission_(p, Boolean(adminEmail)),
    submissionId = submissionId_(p.submissionId),
    hash = fingerprint_(canonical);
  return locked_((s) => {
    if (adminEmail) {
      if (recheck(s) !== adminEmail)
        fail_("AUTH", "Administrator identity changed.");
    }
    const prior = s.SUBMISSIONS.find((r) => r.SubmissionID === submissionId);
    if (prior) {
      if (prior.Fingerprint !== hash)
        fail_(
          "IDEMPOTENCY",
          "This submission ID was already used with different information.",
        );
      return savedSubmissionReceipt_(s, prior);
    }
    const e = byId_(s, "EVENTS", canonical.EventID);
    if (adminEmail) editable_(e);
    else if (!acceptsPublicReferrals_(e))
      fail_("CLOSED", "This event is no longer accepting requests.");
    const meals = canonical.recipients.reduce((n, r) => n + r.MealCount, 0),
      left = available_(s, e);
    if (meals > left)
      fail_(
        "CAPACITY",
        "Only " +
          left +
          " meals remain for this event. Please reduce the request before submitting.",
      );
    const referral = Object.assign(canonical.organization, {
      ReferralID: uuid_(),
      EventID: e.EventID,
      Status: "Pending",
      SubmittedAt: now_(),
      UpdatedAt: now_(),
      SubmittedByAdmin: Boolean(adminEmail),
      OriginalRequestedMeals: meals,
      OriginalRecipientCount: canonical.recipients.length,
      Version: 1,
    });
    s.REFERRALS.push(referral);
    canonical.recipients.forEach((r, i) =>
      s.RECIPIENTS.push(
        Object.assign(r, {
          RecipientID: uuid_(),
          ReferralID: referral.ReferralID,
          EventID: e.EventID,
          Status: "Pending",
          DuplicateFlag: false,
          RoutePosition: "",
          CreatedAt: now_(),
          UpdatedAt: now_(),
          Version: 1,
          AddressStatus: addressProofStatus_(
            r.Address,
            p.recipients[i].addressReceipt,
          ),
          VerifiedAt:
            addressProofStatus_(r.Address, p.recipients[i].addressReceipt) ===
            "Confirmed"
              ? now_()
              : "",
        }),
      ),
    );
    refreshDuplicates_(s, e.EventID);
    const receipt = {
      referralId: referral.ReferralID,
      eventName: e.EventName,
      meals,
      recipients: canonical.recipients.length,
      status: "Pending",
    };
    s.SUBMISSIONS.push({
      SubmissionID: submissionId,
      Fingerprint: hash,
      ReferralID: referral.ReferralID,
      Receipt: JSON.stringify(receipt),
      CreatedAt: now_(),
    });
    if (adminEmail)
      audit_(
        s,
        adminEmail,
        "Referral Created",
        "Referral",
        referral.ReferralID,
        null,
        { meals, recipients: canonical.recipients.length },
      );
    return receipt;
  });
}
const RECIPIENT_TRANSITIONS_ = Object.freeze({
  Pending: ["Approved", "Rejected"],
  Approved: ["Pending", "Rejected"],
  Rejected: ["Pending"],
});
function recipientRequest_(s, id) {
  const row = byId_(s, "RECIPIENTS", id_(id));
  const parent = byId_(s, "REFERRALS", row.ReferralID);
  if (parent.EventID !== row.EventID)
    fail_("INTEGRITY", "This recipient is not linked to the correct event.");
  return { row, parent, status: row.Status || parent.Status };
}
function recipientStatuses_(s, p, admin) {
  if (!["Pending", "Approved", "Rejected"].includes(p.status) ||
      !Array.isArray(p.recipients) || !p.recipients.length || p.recipients.length > 200)
    fail_("INVALID", "Select up to 200 recipients and a valid status.");
  const reason = p.status === "Rejected" ? text_(p.reason, "rejection reason", 500, false) : "";
  const seen = new Set();
  const requests = p.recipients.map((item) => {
    const request = recipientRequest_(s, item?.recipientId);
    const { row, status } = request;
    if (seen.has(row.RecipientID)) fail_("INVALID", "Select each recipient once.");
    seen.add(row.RecipientID);
    version_(row, item.version);
    request.event = byId_(s, "EVENTS", row.EventID);
    editable_(request.event);
    if (!RECIPIENT_TRANSITIONS_[status]?.includes(p.status))
      fail_("INVALID", "Some selected recipients cannot move to that status. Refresh and check the selection.");
    return request;
  });
  const needed = new Map();
  requests.forEach(({ row, status, event }) => {
    if (!reservedStatus_(status) && reservedStatus_(p.status))
      needed.set(event, (needed.get(event) || 0) + Number(row.MealCount));
  });
  for (const [event, meals] of needed)
    if (meals > available_(s, event))
      fail_("CAPACITY", "There are not enough meals available to restore the selected recipients.");
  const dirty = new Set();
  requests.forEach(({ row, status, event }) => {
    const old = { ...row, Status: status };
    row.Status = p.status;
    row.RejectionReason = reason;
    touch_(row);
    if (status === "Approved" || p.status === "Approved") dirty.add(event);
    audit_(s, admin, "Recipient " + (p.status === "Pending" ? "Returned to Pending" : p.status),
      "Recipient", row.RecipientID, old, row);
  });
  dirty.forEach(routeDirty_);
  return { updated: requests.length };
}
function editRecipient_(s, p, admin) {
  const { row, status } = recipientRequest_(s, p.recipientId);
  const e = byId_(s, "EVENTS", row.EventID);
  editable_(e);
  version_(row, p.version);
  const [input] = recipients_([p], true);
  if (reservedStatus_(status) && input.MealCount - Number(row.MealCount) > available_(s, e))
    fail_("CAPACITY", "There are not enough meals available for this edit.");
  const old = { ...row };
  if (row.Address !== input.Address) {
    row.AddressStatus = "Needs Review";
    row.VerifiedAt = "";
  }
  if (p.addressReceipt) {
    row.AddressStatus = addressProofStatus_(input.Address, p.addressReceipt);
    row.VerifiedAt = row.AddressStatus === "Confirmed" ? now_() : "";
  }
  Object.assign(row, input);
  touch_(row);
  // Name, address and delivery details also appear in the saved manifest.
  if (status === "Approved") routeDirty_(e);
  refreshDuplicates_(s, e.EventID);
  audit_(s, admin, "Recipient Edited", "Recipient", row.RecipientID, old, row);
  return { recipientId: row.RecipientID };
}
function deleteRejectedRecipient_(s, p, admin) {
  if (!recipientDeletionEnabled_())
    fail_("FORBIDDEN", "Permanent recipient deletion is disabled.");

  if (p.confirmed !== true)
    fail_("CONFIRM", "Confirm permanent deletion of this recipient.");
  const { row, status } = recipientRequest_(s, p.recipientId);
  editable_(byId_(s, "EVENTS", row.EventID));
  version_(row, p.version);
  if (status !== "Rejected")
    fail_("INVALID", "Only rejected recipients can be permanently deleted.");
  s.RECIPIENTS.splice(s.RECIPIENTS.indexOf(row), 1);
  refreshDuplicates_(s, row.EventID);
  audit_(s, admin, "Recipient Permanently Deleted", "Recipient", row.RecipientID,
    { ...row, Status: status }, null);
  return { recipientId: row.RecipientID };
}

function recipientDeletionEnabled_() {
  return properties_().getProperty("MEALS_RECIPIENT_DELETION_ENABLED") === "true";
}
