"use strict";
(() => {
  const $ = (id) => document.getElementById(id),
    form = $("referralForm"),
    container = $("recipients");
  let events = [],
    selected = null,
    busy = false,
    loading = false;
  const storageKey = "community-meals-submission-v1";
  let pending = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(storageKey) || "null");
  } catch (_) {
    pending = null;
  }
  function retain(value) {
    pending = value;
    try {
      if (value) sessionStorage.setItem(storageKey, JSON.stringify(value));
      else sessionStorage.removeItem(storageKey);
    } catch (_) {
      /* Backend still deduplicates within this tab. */
    }
  }
  function utcLocalDate() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  function dateLabel(s) {
    return new Date(s + "T12:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  function add() {
    if (container.children.length >= 100) return;
    const fragment = $("recipientTemplate").content.cloneNode(true);
    const card = fragment.querySelector("fieldset");
    card.querySelector(".remove").addEventListener("click", () => {
      card.remove();
      renumber();
      totals();
    });
    container.append(fragment);
    renumber();
    totals();
  }
  function renumber() {
    [...container.children].forEach((c, i) => {
      c.querySelector(".recipient-number").textContent = i + 1;
      c.querySelector(".remove").hidden = container.children.length === 1;
    });
    $("addRecipient").disabled = container.children.length >= 100 || busy;
  }
  function collect() {
    const p = { eventId: selected?.eventId };
    ["organizationName", "organizationEmail", "organizationPhone"].forEach(
      (n) => (p[n] = form.elements[n].value.trim()),
    );
    p.recipients = [...container.children].map((c) => ({
      ...Object.fromEntries(
        [...c.querySelectorAll("[name]")].map((el) => [
          el.name,
          el.name === "mealCount" ? Number(el.value) : el.value.trim(),
        ]),
      ),
    }));
    return p;
  }
  function totals() {
    const meals = [...container.querySelectorAll('[name="mealCount"]')].reduce(
      (n, x) => n + (Number(x.value) || 0),
      0,
    );
    $("recipientTotal").textContent = container.children.length;
    $("mealTotal").textContent = meals;
    $("availableTotal").textContent = selected ? selected.remaining : "—";
    $("quantityWarning").textContent =
      selected && meals > selected.remaining
        ? "This request exceeds the meals currently available. Please reduce the meal quantities."
        : "";
    $("submitRequest").disabled =
      busy ||
      loading ||
      !selected ||
      (selected.remaining <= 0 && !(pending && !pending.receipt));
    $("eventSelect").disabled = busy || loading || !events.length;
    $("refreshAvailability").disabled = busy || loading;
    $("checkSavedRequest").hidden = !pending || !!pending.receipt;
    $("checkSavedRequest").disabled = busy;
    renumber();
  }
  function select(id) {
    selected = events.find((e) => e.eventId === id) || null;
    $("remaining").textContent = selected ? selected.remaining : "—";
    $("eventDate").textContent = selected
      ? dateLabel(selected.deliveryDate)
      : "";
    $("eventMessage").textContent = !selected
      ? "There are no open meal events right now."
      : selected.unavailable
        ? "This event is no longer accepting requests. Your entered information has been kept. Choose another event explicitly if appropriate."
      : selected.remaining === 0
        ? "Sorry, all available meals for this event have been requested."
        : "";
    totals();
  }
  async function api(payload, submissionId) {
    const url = window.MEALS_CONFIG?.publicApiUrl;
    if (!url)
      throw new Error(
        "This form is awaiting program setup. Please contact the referring program.",
      );
    let response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), submissionId ? 15000 : 12000);
    try {
      response = await fetch(
        payload ? url + "?request=" + Date.now() : submissionId
          ? url + "?action=submissionReceipt&submissionId=" + encodeURIComponent(submissionId) + "&request=" + Date.now()
          : url + "?action=events&request=" + Date.now(),
        payload
          ? {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(payload),
              cache: "no-store", credentials: "omit", signal: controller.signal,
            }
          : { cache: "no-store", credentials: "omit", signal: controller.signal },
      );
      if (!response.ok) throw new Error("Response unavailable");
      const result = await response.json();
      if (!result.ok) {
        const error = new Error(
          result.error?.message ||
            "Your request could not be saved. Please try again.",
        );
        error.code = result.error?.code;
        error.uncertain = error.code === "UNAVAILABLE";
        throw error;
      }
      return result.data;
    } catch (error) {
      // Safari DOMException uses numeric code 20 for AbortError. Only our
      // server's string error codes are definitive backend responses.
      if (typeof error.code === "string" && error.code) throw error;
      const unavailable = new Error("The service could not be reached.");
      unavailable.uncertain = true;
      throw unavailable;
    } finally {
      clearTimeout(timeout);
    }
  }
  async function load(preferred) {
    if (loading) return;
    loading = true;
    totals();
    try {
      events = await api();
      if (
        pending &&
        !pending.receipt &&
        pending.event &&
        !events.some((e) => e.eventId === pending.event.eventId)
      )
        events.push({ ...pending.event, remaining: 0, unavailable: true });
      // Refresh must never move an existing draft to a different meal event.
      if (selected && !events.some((e) => e.eventId === selected.eventId))
        events.push({ ...selected, remaining: 0, unavailable: true });
      const keep =
        preferred ||
        selected?.eventId ||
        (pending && !pending.receipt ? pending.event?.eventId : null);
      const today = utcLocalDate();
      const next = events.find((e) => e.deliveryDate >= today) || events[0];
      $("eventSelect").replaceChildren(
        ...events.map((e) => {
          const o = document.createElement("option");
          o.value = e.eventId;
          o.textContent = e.eventName;
          return o;
        }),
      );
      $("eventSelect").value = events.some((e) => e.eventId === keep)
        ? keep
        : next?.eventId || "";
      select($("eventSelect").value);
      $("availabilityChecked").textContent = "Availability checked at " + new Date().toLocaleTimeString() + ".";
    } catch (e) {
      selected = null;
      totals();
      $("eventMessage").textContent = e.message;
      $("availabilityChecked").textContent = "Availability could not be refreshed. Please try again.";
    } finally {
      loading = false;
      totals();
    }
  }
  async function hash(p) {
    const bytes = new TextEncoder().encode(JSON.stringify(p));
    const buffer = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(buffer)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  }
  function showReceipt(receipt) {
    form.hidden = true;
    $("successPanel").hidden = false;
    $("successMessage").textContent =
      "Your request for " +
      receipt.meals +
      " meals for " +
      receipt.eventName +
      " has been received and is awaiting approval.";
    $("receiptId").textContent = "Referral ID: " + receipt.referralId;
  }
  async function recoverPending() {
    if (busy || !pending || pending.receipt) return;
    busy = true;
    form.inert = true;
    totals();
    try {
      const receipt = await MealSubmission.recover({
        check: () => api(null, pending.id),
        onChecking: () => { $("submissionMessage").textContent = "Checking whether your previous request was saved…"; },
      });
      if (receipt) {
        retain({ ...pending, receipt });
        showReceipt(receipt);
        await load(pending.event.eventId);
      } else {
        $("submissionMessage").textContent = "Your previous request is still unconfirmed. You can check again or re-enter the same information to retry safely. Recipient details were not stored in this browser.";
      }
    } catch (error) {
      $("submissionMessage").textContent = error.message;
    } finally {
      busy = false;
      form.inert = false;
      totals();
    }
  }
  $("checkSavedRequest").addEventListener("click", recoverPending);
  $("refreshAvailability").addEventListener("click", () => load());
  window.addEventListener("focus", () => {
    if (!busy) load();
  });
  form.addEventListener("input", totals);
  $("eventSelect").addEventListener("change", () => {
    const id = $("eventSelect").value;
    select(id);
    load(id);
  });
  $("addRecipient").addEventListener("click", add);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy || loading || !form.reportValidity() || !selected) return;
    let payload = collect();
    if (
      payload.recipients.some(
        (r) => !Number.isInteger(r.mealCount) || r.mealCount < 1,
      )
    )
      return;
    if (
      !(pending && !pending.receipt) &&
      payload.recipients.reduce((n, r) => n + r.mealCount, 0) >
        selected.remaining
    ) {
      $("submissionMessage").textContent =
        "Please reduce this request to the meals currently available.";
      return;
    }
    busy = true;
    const finishFeedback = MealButtonFeedback.begin(e.submitter || $("submitRequest"));
    form.inert = true;
    totals();
    $("submissionMessage").textContent = "Submitting…";
    try {
      payload = collect();
      const fingerprint = await hash({
        ...payload,
        recipients: payload.recipients.map(({ addressReceipt, ...r }) => r),
      });
      if (pending && !pending.receipt && pending.fingerprint !== fingerprint)
        throw new Error(
          "A previous submission has an uncertain result. Restore the same information and retry before starting a different request.",
        );
      if (!pending || pending.receipt)
        retain({
          id: crypto.randomUUID(),
          fingerprint,
          event: {
            eventId: selected.eventId,
            eventName: selected.eventName,
            deliveryDate: selected.deliveryDate,
          },
        });
      const request = {
        ...payload,
        action: "submit",
        submissionId: pending.id,
      };
      const receipt = await MealSubmission.confirm({
        send: () => api(request),
        check: () => api(null, request.submissionId),
        onChecking: () => { $("submissionMessage").textContent = "Checking whether your request was saved… Please keep this page open."; },
      });
      retain({ ...pending, receipt });
      showReceipt(receipt);
      await load(payload.eventId);
    } catch (error) {
      if (["INVALID", "CAPACITY", "CLOSED", "FORBIDDEN"].includes(error.code))
        retain(null);
      $("submissionMessage").textContent =
        error.message;
    } finally {
      busy = false;
      finishFeedback();
      form.inert = false;
      totals();
    }
  });
  $("newRequest").addEventListener("click", async () => {
    const finishFeedback = MealButtonFeedback.begin($("newRequest"));
    try {
    retain(null);
    form.reset();
    container.replaceChildren();
    add();
    form.hidden = false;
    $("successPanel").hidden = true;
    $("submissionMessage").textContent = "";
    await load();
    } finally { finishFeedback(); }
  });
  add();
  if (pending?.receipt) showReceipt(pending.receipt);
  load().then(() => {
    if (pending && !pending.receipt) return recoverPending();
  });
})();
