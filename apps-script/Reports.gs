function reports_(s, p) {
  const events = s.EVENTS.filter(
    (e) =>
      (!p.eventId || e.EventID === p.eventId) &&
      (!p.year || e.DeliveryDate.slice(0, 4) === String(p.year)),
  );
  const ids = new Set(events.map((e) => e.EventID)),
    refs = s.REFERRALS.filter((r) => ids.has(r.EventID));
  const rows = linkedRecipients_(s).filter((r) => ids.has(r.EventID));
  const totals = {
    events: events.length,
    originallyRequestedMeals: refs.reduce(
      (n, r) => n + Number(r.OriginalRequestedMeals),
      0,
    ),
    currentlyReservedMeals: 0,
    approvedMeals: 0,
    rejectedMeals: 0,
    recipientRecords: rows.length,
    approvedStops: 0,
    organizations: 0,
    capacity: events.reduce((n, e) => n + Number(e.Capacity), 0),
    pendingReferrals: refs.filter(r => r.Status === "Pending").length,
    approvedReferrals: refs.filter(r => r.Status === "Approved").length,
    rejectedReferrals: refs.filter(r => r.Status === "Rejected").length,
  };
  const organizations = Object.create(null);
  refs.forEach((r) => {
    const meals = referralMeals_(s, r.ReferralID);
    if (["Pending", "Approved"].includes(r.Status)) totals.currentlyReservedMeals += meals;
    if (r.Status === "Approved") {
      totals.approvedMeals += meals;
      totals.approvedStops += rows.filter(
        (x) => x.ReferralID === r.ReferralID,
      ).length;
    }
    if (r.Status === "Rejected") totals.rejectedMeals += meals;
    const key = r.OrganizationKey;
    if (!organizations[key])
      organizations[key] = {
        name: r.OrganizationName,
        referrals: 0,
        originallyRequestedMeals: 0,
        currentMeals: 0,
      };
    organizations[key].referrals++;
    organizations[key].originallyRequestedMeals += Number(
      r.OriginalRequestedMeals,
    );
    organizations[key].currentMeals += meals;
  });
  totals.organizations = Object.keys(organizations).length;
  totals.remainingCapacity = totals.capacity - totals.currentlyReservedMeals;
  return {
    totals,
    integrity: relationshipIssues_(s, [...ids]),
    organizations: Object.values(organizations).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}
function dashboard_(s, p) {
  const e = byId_(s, "EVENTS", p.eventId),
    refs = s.REFERRALS.filter((r) => r.EventID === e.EventID),
    recipients = s.RECIPIENTS.filter((r) => r.EventID === e.EventID);
  return {
    event: e,
    integrity: relationshipIssues_(s, [e.EventID]),
    capacity: Number(e.Capacity),
    reserved: reserved_(s, e.EventID),
    available: available_(s, e),
    pendingReferrals: refs.filter((r) => r.Status === "Pending").length,
    approvedReferrals: refs.filter((r) => r.Status === "Approved").length,
    deliveryStops: recipients.filter((x) =>
      refs.some(
        (r) => r.ReferralID === x.ReferralID && r.Status === "Approved",
      ),
    ).length,
    referrals: refs.map((r) =>
      Object.assign({}, r, {
        meals: referralMeals_(s, r.ReferralID),
        recipients: recipients
          .filter((x) => x.ReferralID === r.ReferralID)
          .map((x) => Object.assign({}, x, { matches: matchesFor_(s, x) })),
      }),
    ),
  };
}
