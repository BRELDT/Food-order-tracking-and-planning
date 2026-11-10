function identity_() {
  const active = String(Session.getActiveUser().getEmail() || "").toLowerCase();
  const effective = String(
    Session.getEffectiveUser().getEmail() || "",
  ).toLowerCase();
  if (!active.includes("@") || active !== effective)
    fail_(
      "AUTH",
      "Sign in through the authenticated administrator application. Your Google identity could not be verified.",
    );
  return active;
}
function admin_(s) {
  const email = identity_();
  if (
    !s.ADMINUSERS.some(
      (r) =>
        String(r.Email).toLowerCase() === email &&
        (r.Active === true || r.Active === "true") &&
        r.Role === "admin",
    )
  )
    fail_("FORBIDDEN", "This Google account is not an approved administrator.");
  return email;
}
function requireAdmin_() {
  const email = identity_();
  const s = load_();
  admin_(s);
  return { email, state: s };
}
function testAdminIdentity() {
  return safeBoundary_(() => {
    const a = requireAdmin_();
    return {
      email: a.email,
      environment: properties_().getProperty("MEALS_ENV"),
      authorized: true,
    };
  });
}
