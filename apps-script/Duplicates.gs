function similarAddress_(a, b) {
  if (a === b) return Boolean(a);
  const numberA = a.match(/^\d+\w?\b/),
    numberB = b.match(/^\d+\w?\b/);
  if (!numberA || !numberB || numberA[0] !== numberB[0]) return false;
  const unitA = (a.match(/\bunit\s+(\w+)/) || [])[1] || "",
    unitB = (b.match(/\bunit\s+(\w+)/) || [])[1] || "";
  if (unitA !== unitB) return false;
  const first = new Set(a.split(" ")),
    second = new Set(b.split(" "));
  const common = [...first].filter((x) => second.has(x)).length;
  return common / Math.max(first.size, second.size) >= 0.85;
}
function duplicateMatches_(a, b) {
  if (a.RecipientID === b.RecipientID || a.EventID !== b.EventID) return false;
  const address = addressKey_(a.Address),
    other = addressKey_(b.Address);
  const name = normalize_(a.RecipientName) === normalize_(b.RecipientName);
  const phone = phoneKey_(a.Phone);
  // Read the complete unit token before address normalization removes hyphens.
  // Otherwise QA-1 and QA-2 both become unit "qa" in the fuzzy comparison.
  const unit = (value) => {
    const match = String(value || "").match(/(?:\b(?:unit|apt\.?|apartment|suite)\s*|#\s*)([a-z0-9]+(?:[-/][a-z0-9]+)*)/i);
    return match ? normalize_(match[1]) : "";
  };
  const unitsMatch = unit(a.Address) === unit(b.Address);
  return Boolean(
    (address && unitsMatch && similarAddress_(address, other)) ||
    (name && phone && phone === phoneKey_(b.Phone)),
  );
}
function refreshDuplicates_(s, eventId) {
  const rows = linkedRecipients_(s).filter((r) => r.EventID === eventId);
  rows.forEach(
    (a) => (a.DuplicateFlag = rows.some((b) => duplicateMatches_(a, b))),
  );
}
function matchesFor_(s, r) {
  return linkedRecipients_(s).filter((b) => duplicateMatches_(r, b)).map((b) => ({
    recipientId: b.RecipientID,
    referralId: b.ReferralID,
    recipientName: b.RecipientName,
    address: b.Address,
  }));
}
