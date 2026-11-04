function audit_(s, admin, action, type, id, oldValue, newValue) {
  // Keep operational history without copying private contact details, dietary
  // information or internal notes into a second long-lived record.
  const summary = value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const keys = type === "Recipient"
      ? ["MealCount", "AddressStatus", "DuplicateFlag", "RoutePosition", "Version"]
      : type === "Referral"
        ? ["Status", "meals", "recipients", "Version"]
        : type === "Event"
          ? ["EventName", "DeliveryDate", "Capacity", "Status", "Archived"]
          : [];
    return Object.fromEntries(keys.filter(k => Object.prototype.hasOwnProperty.call(value, k))
      .map(k => [k, value[k]]));
  };
  s.AUDITLOG.push({
    AuditID: uuid_(),
    Timestamp: now_(),
    Admin: admin,
    Action: action,
    EntityType: type,
    EntityID: id,
    OldValue: JSON.stringify(oldValue == null ? null : summary(oldValue)),
    NewValue: JSON.stringify(newValue == null ? null : summary(newValue)),
  });
}
