"use strict";
document.addEventListener("DOMContentLoaded", () => {
  if (!setLink("adminLink", window.MEALS_CONFIG?.adminAppUrl, "admin"))
    document.getElementById("adminStatus").textContent =
      "The authenticated administrator application has not been configured yet.";
  setLink("passwordAdminLink", window.MEALS_CONFIG?.passwordAdminAppUrl, "password");
});
function setLink(id, url, page) {
  const link = document.getElementById(id);
  try {
    const parsed = new URL(url);
    if (
      parsed.origin !== "https://script.google.com" ||
      !parsed.pathname.endsWith("/exec")
    )
      throw new Error();
    parsed.searchParams.set("page", page);
    link.href = parsed.href;
    link.hidden = false;
    return true;
  } catch (_) {
    return false;
  }
}
