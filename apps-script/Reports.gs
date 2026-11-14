function reports_(s, p) {
  const events = s.EVENTS.filter(
    (e) => (!p.eventId || e.EventID === p.eventId) &&
      (!p.year || e.DeliveryDate.slice(0, 4) === String(p.year)),
  );
  const ids = new Set(events.map(e => e.EventID));
  const refs = s.REFERRALS.filter(r => ids.has(r.EventID));
  const requests = recipientRequests_(s).filter(({ row }) => ids.has(row.EventID));
  const totals = {
    events: events.length,
    originallyRequestedMeals: 0,
    originallySubmittedRecipients: 0,
    currentlyReservedMeals: 0,
    approvedMeals: 0,
    rejectedMeals: 0,
    recipientRecords: requests.length,
    approvedStops: 0,
    organizations: 0,
    capacity: events.reduce((n, e) => n + Number(e.Capacity), 0),
    pendingRecipients: 0,
    approvedRecipients: 0,
    rejectedRecipients: 0,
  };
  const organizations = new Map(), reservedByEvent = new Map();
  refs.forEach((r) => {
    const key = r.OrganizationKey;
    if (!organizations.has(key)) organizations.set(key, {
      name: r.OrganizationName, referrals: 0, originallySubmittedRecipients: 0,
      originallyRequestedMeals: 0, pendingRecipients: 0, approvedRecipients: 0,
      rejectedRecipients: 0, reservedMeals: 0, approvedMeals: 0, rejectedMeals: 0,
    });
    const o = organizations.get(key);
    o.referrals++;
    o.originallySubmittedRecipients += Number(r.OriginalRecipientCount);
    o.originallyRequestedMeals += Number(r.OriginalRequestedMeals);
    totals.originallySubmittedRecipients += Number(r.OriginalRecipientCount);
    totals.originallyRequestedMeals += Number(r.OriginalRequestedMeals);
  });
  requests.forEach(({ row, parent, status }) => {
    const meals = Number(row.MealCount), o = organizations.get(parent.OrganizationKey);
    if (reservedStatus_(status)) {
      totals.currentlyReservedMeals += meals;
      o.reservedMeals += meals;
      reservedByEvent.set(row.EventID, (reservedByEvent.get(row.EventID) || 0) + meals);
    }
    if (status === "Pending") {
      totals.pendingRecipients++;
      o.pendingRecipients++;
    } else if (status === "Approved") {
      totals.approvedRecipients++;
      totals.approvedStops++;
      totals.approvedMeals += meals;
      o.approvedRecipients++;
      o.approvedMeals += meals;
    } else if (status === "Rejected") {
      totals.rejectedRecipients++;
      totals.rejectedMeals += meals;
      o.rejectedRecipients++;
      o.rejectedMeals += meals;
    }
  });
  totals.organizations = organizations.size;
  totals.remainingCapacity = events.reduce((n, e) =>
    n + Math.max(0, Number(e.Capacity) - (reservedByEvent.get(e.EventID) || 0)), 0);
  return {
    totals,
    integrity: relationshipIssues_(s, [...ids]),
    organizations: [...organizations.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}
function dashboard_(s, p) {
  const e = byId_(s, "EVENTS", p.eventId);
  const requests = recipientRequests_(s, e.EventID);
  const rows = requests.map(({ row }) => row);
  const totals = reports_(s, { eventId: e.EventID }).totals;
  return {
    event: e,
    canDeleteRejectedRecipient: recipientDeletionEnabled_(),
    integrity: relationshipIssues_(s, [e.EventID]),
    capacity: totals.capacity,
    reserved: totals.currentlyReservedMeals,
    available: totals.remainingCapacity,
    submittedRecipients: totals.originallySubmittedRecipients,
    pendingRecipients: totals.pendingRecipients,
    approvedRecipients: totals.approvedRecipients,
    rejectedRecipients: totals.rejectedRecipients,
    approvedMeals: totals.approvedMeals,
    deliveryStops: totals.approvedStops,
    recipients: requests.map(({ row, parent, status }) => ({
      ...row, Status: status,
      OrganizationName: parent.OrganizationName,
      OrganizationEmail: parent.OrganizationEmail,
      OrganizationPhone: parent.OrganizationPhone,
      SubmittedAt: parent.SubmittedAt,
      matches: matchesFor_(row, rows),
    })),
  };
}
