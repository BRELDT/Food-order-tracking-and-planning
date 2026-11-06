# Complete Code.gs replacement

Copy the entire contents of this single code box into Code.gs. This includes the backend and complete admin interface. No setup or migration function should be run. Address services and routing remain disabled until separately configured.

```javascript
// Build marker: COMMUNITY-MEALS-20261106-DELIVERY-PDF
/* Community Meals V1 — generated from the modular files in this commit.
   Install the ENTIRE file as Code.gs. No other .gs/.html files required.
   Preserve existing Script Properties and deployment settings.
   No setup or migration function needs to run. */
const ADMIN_PAGE_HTML_ = "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n    <base target=\"_top\" />\n    <style>\n      :root {\n  --navy: #15324d;\n  --blue: #1668ad;\n  --green: #126c56;\n  --red: #9d2222;\n  --border: #ccd7e1;\n  --muted: #526478;\n  --paper: #f3f6f9;\n  font-family:\n    system-ui,\n    -apple-system,\n    BlinkMacSystemFont,\n    \"Segoe UI\",\n    sans-serif;\n  color: var(--navy);\n  background: var(--paper);\n  font-size: 16px;\n  line-height: 1.5;\n}\n* {\n  box-sizing: border-box;\n}\nbody {\n  margin: 0;\n}\nh1 {\n  font-size: clamp(1.75rem, 5vw, 2.4rem);\n  line-height: 1.2;\n}\nh2 {\n  font-size: 1.35rem;\n}\nh3 {\n  font-size: 1.1rem;\n}\nh1,\nh2,\nh3,\np,\nlegend {\n  overflow-wrap: anywhere;\n}\n.stop header h3 {\n  min-width: 0;\n  flex: 1;\n}\n.page-wrap {\n  width: min(100% - 2rem, 1040px);\n  margin: auto;\n  padding: 1.5rem 0;\n}\n.narrow {\n  max-width: 640px;\n}\n.site-header {\n  background: var(--navy);\n  color: white;\n}\n.site-header p {\n  margin: 0.4rem 0;\n}\n.eyebrow {\n  text-transform: uppercase;\n  font-size: 0.875rem;\n  letter-spacing: 0.08em;\n}\n.event-panel,\nfieldset,\n.stop,\n.request-card,\n.panel {\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  background: white;\n  padding: 1.25rem;\n  margin: 0 0 1.25rem;\n  min-width: 0;\n}\n.event-panel {\n  border-left: 5px solid var(--green);\n}\nlegend {\n  font-weight: 750;\n  font-size: 1.2rem;\n  padding: 0 0.4rem;\n}\nlabel {\n  display: block;\n  font-weight: 650;\n}\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\ninput,\nselect,\ntextarea {\n  display: block;\n  width: 100%;\n  margin: 0.35rem 0 0;\n  border: 1px solid #8e9eae;\n  border-radius: 6px;\n  padding: 0.7rem;\n  min-height: 46px;\n  background: white;\n  color: var(--navy);\n}\ntextarea {\n  resize: vertical;\n}\n.grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n}\n.full {\n  grid-column: 1/-1;\n}\nbutton,\n.button {\n  display: inline-block;\n  min-height: 46px;\n  border: 0;\n  border-radius: 7px;\n  padding: 0.7rem 1rem;\n  background: var(--blue);\n  color: white;\n  cursor: pointer;\n  text-decoration: none;\n  font-weight: 650;\n}\nbutton.secondary {\n  background: #e8eef4;\n  color: var(--navy);\n}\nbutton.danger {\n  background: var(--red);\n}\nbutton:disabled {\n  opacity: 0.55;\n  cursor: not-allowed;\n}\n:focus-visible {\n  outline: 3px solid #efb718;\n  outline-offset: 3px;\n}\n.hint {\n  font-size: 0.875rem;\n  font-weight: 400;\n  color: var(--muted);\n}\n.capacity {\n  font-size: 1.2rem;\n}\n.capacity strong {\n  font-size: 1.75rem;\n}\n.totals,\n.metrics,\n.actions,\n.tabs {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.8rem;\n  margin: 1rem 0;\n}\n.totals {\n  background: #e1eef5;\n  padding: 1rem;\n  border-radius: 8px;\n  justify-content: space-between;\n}\n.warning {\n  color: var(--red);\n  font-weight: 650;\n}\n.badge {\n  display: inline-block;\n  background: #fff0cc;\n  border-radius: 5px;\n  padding: 0.2rem 0.5rem;\n  font-size: 0.875rem;\n}\n.request-card header,\n.stop header {\n  display: flex;\n  gap: 0.7rem;\n  align-items: center;\n  flex-wrap: wrap;\n}\n.request-card h3,\n.stop h3 {\n  margin: 0.3rem 0;\n}\n.check-label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.check-label input {\n  width: 22px;\n  min-height: 22px;\n  margin: 0;\n}\n.metrics span {\n  background: #e8eef4;\n  border-radius: 7px;\n  padding: 0.6rem 1rem;\n}\n.tabs button[aria-selected=\"true\"] {\n  background: var(--navy);\n}\n.recipient-card .remove {\n  margin-bottom: 1rem;\n}\n.stop dl {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 0.25rem 0.7rem;\n}\n.stop dt {\n  font-weight: 650;\n}\n.stop dd {\n  margin: 0;\n  overflow-wrap: anywhere;\n}\na {\n  color: #105a9b;\n  overflow-wrap: anywhere;\n}\ndialog {\n  width: min(95vw, 800px);\n  max-height: 90dvh;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 1.25rem;\n  color: var(--navy);\n}\ndialog::backdrop {\n  background: #132a42a6;\n}\n.dialog-header {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n  align-items: center;\n}\n.dialog-header h2 {\n  margin: 0;\n}\n.print-check {\n  display: none;\n}\n.hidden,\n[hidden] {\n  display: none !important;\n}\n.busy {\n  opacity: 0.65;\n}\n.report-row {\n  padding: 0.7rem 0;\n  border-bottom: 1px solid var(--border);\n}\n#adminMessage,\n#submissionMessage {\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.print-route-title {\n  display: none;\n}\n@media (max-width: 640px) {\n  .grid {\n    grid-template-columns: 1fr;\n  }\n  .page-wrap {\n    width: calc(100% - 1.4rem);\n  }\n  .event-panel,\n  fieldset,\n  .stop,\n  .request-card,\n  .panel {\n    padding: 1rem;\n  }\n  .actions button {\n    flex: 1 1 auto;\n  }\n  .tabs {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n  }\n  .tabs button {\n    padding: 0.65rem 0.4rem;\n  }\n  .metrics {\n    gap: 0.4rem;\n  }\n  .metrics span {\n    flex: 1 1 40%;\n    padding: 0.5rem;\n  }\n  .stop dl {\n    grid-template-columns: 1fr;\n  }\n  .stop dd {\n    margin-bottom: 0.45rem;\n  }\n  dialog {\n    padding: 1rem;\n  }\n}\n@media print {\n  @page {\n    size: letter;\n    margin: 0.55in;\n  }\n  :root {\n    background: white;\n    color: black;\n    font-size: 11pt;\n  }\n  body {\n    background: white;\n  }\n  .site-header,\n  .no-print,\n  nav,\n  footer,\n  dialog,\n  #adminMessage,\n  #requestsView,\n  #settingsView,\n  #reportsView {\n    display: none !important;\n  }\n  main.page-wrap {\n    width: 100%;\n    padding: 0;\n  }\n  #routeView {\n    display: block !important;\n  }\n  #routeView .actions,\n  #routeView button,\n  .route-status {\n    display: none !important;\n  }\n  .print-route-title {\n    display: block;\n  }\n  .stop {\n    border: 1px solid #888;\n    border-radius: 0;\n    break-inside: avoid;\n    page-break-inside: avoid;\n    margin: 0 0 0.15in;\n    padding: 0.12in;\n  }\n  .stop header {\n    gap: 0.1in;\n  }\n  .stop h3 {\n    font-size: 12pt;\n  }\n  .print-check {\n    display: inline-block;\n    width: 13pt;\n    height: 13pt;\n    border: 1.2pt solid black;\n    flex: none;\n  }\n  .stop dl {\n    display: block;\n    margin: 0.04in 0;\n  }\n  .stop dt,\n  .stop dd {\n    display: inline;\n    margin: 0;\n  }\n  .stop dt {\n    margin-right: 0.2em;\n  }\n  .stop dd::after {\n    content: \"\";\n    display: block;\n  }\n  .stop a {\n    color: black;\n    text-decoration: none;\n  }\n  .stop .address {\n    margin: 0.04in 0;\n  }\n  .stop .badge {\n    display: none;\n  }\n  .route-header {\n    break-after: avoid;\n  }\n  .route-header h2 {\n    margin: 0.05in 0;\n  }\n  .page-wrap {\n    margin: 0;\n  }\n  #routeStops {\n    display: block;\n  }\n  .stop .no-print {\n    display: none !important;\n  }\n}\n\n.address-entry {\n  min-width: 0;\n  position: relative;\n}\n.address-suggestions {\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  background: white;\n  margin: 0.35rem 0;\n  padding: 0.3rem;\n}\n.address-suggestion {\n  display: block;\n  width: 100%;\n  text-align: left;\n  background: white;\n  color: var(--navy);\n  border-radius: 0;\n  border-bottom: 1px solid var(--border);\n  overflow-wrap: anywhere;\n}\n.address-suggestion:focus-visible {\n  background: #e1eef5;\n}\n.address-attribution {\n  display: block;\n  white-space: nowrap;\n  font:\n    400 1rem Roboto,\n    sans-serif;\n  letter-spacing: normal;\n  color: #5e5e5e;\n  padding: 10px 10px 5px;\n}\n.address-state {\n  margin: 0.4rem 0;\n}\n.address-check-button {\n  margin-top: 0.35rem;\n}\n.address-check p {\n  overflow-wrap: anywhere;\n}\n@media print {\n  .address-entry,\n  .address-check {\n    display: none !important;\n  }\n}\n\n.request-recipient-list { padding-left: 1.5rem; margin: 1rem 0; }\n.request-recipient-list li { padding: .65rem .25rem; border-bottom: 1px solid #dbe2e8; overflow-wrap: anywhere; }\n.request-recipient-list li:last-child { border-bottom: 0; }\n.request-recipient-list p { margin: .25rem 0; }\n\nbutton[data-click-feedback=\"true\"] { outline: 3px solid #78a9da; outline-offset: 2px; }\nbutton[aria-busy=\"true\"] { cursor: wait; opacity: .8; }\nbutton[aria-busy=\"true\"]::before {\n  content: \"\"; display: inline-block; width: .85em; height: .85em;\n  margin-right: .5em; border: 2px solid currentColor; border-right-color: transparent;\n  border-radius: 50%; vertical-align: -.1em; animation: meal-button-spin .8s linear infinite;\n}\nbutton[aria-busy=\"true\"]::after { content: \" — Loading…\"; }\n@keyframes meal-button-spin { to { transform: rotate(360deg); } }\n@media (prefers-reduced-motion: reduce) { button[aria-busy=\"true\"]::before { animation: none; } }\n\n/* Printing uses a freshly verified saved route. Direct browser print is safe. */\n.print-verification-warning { display: none; }\n@media print {\n  body:not(.route-print-ready) #routeView > :not(.print-verification-warning) { display: none !important; }\n  body:not(.route-print-ready) .print-verification-warning { display: block !important; }\n}\n\n    </style>\n  </head>\n  <body>\n    <header class=\"site-header no-print\">\n      <div class=\"page-wrap\">\n        <h1>Community Meals</h1>\n        <p id=\"adminIdentity\"></p>\n      </div>\n    </header>\n    <main class=\"page-wrap\">\n      <section class=\"no-print\">\n        <div class=\"grid\">\n          <label>Meal event<select id=\"adminEvents\"></select></label\n          ><label class=\"check-label\"\n            ><input type=\"checkbox\" id=\"showArchived\" />Show archived\n            events</label\n          >\n        </div>\n        <div class=\"actions\">\n          <button id=\"createEvent\">Create Event</button\n          ><button id=\"archiveEvent\" class=\"secondary\">Archive Event</button\n          ><button id=\"reopenEvent\" class=\"secondary\" hidden>\n            Reopen / Unarchive</button\n          ><button id=\"refreshAdmin\" class=\"secondary\">Refresh</button\n          ><button id=\"publicLink\" class=\"secondary\">Copy Public Link</button>\n        </div>\n        <div id=\"metrics\" class=\"metrics\"></div>\n        <p id=\"readonlyNotice\" class=\"warning\"></p>\n        <p id=\"integrityNotice\" class=\"warning\" role=\"status\"></p>\n        <nav class=\"tabs\" aria-label=\"Admin sections\">\n          <button data-view=\"requestsView\" aria-selected=\"true\">Requests</button\n          ><button data-view=\"routeView\" aria-selected=\"false\">\n            Delivery Route</button\n          ><button data-view=\"settingsView\" aria-selected=\"false\">\n            Event Settings</button\n          ><button data-view=\"reportsView\" aria-selected=\"false\">\n            Reports\n          </button>\n        </nav>\n        <p id=\"adminMessage\" role=\"status\" aria-live=\"polite\"></p>\n      </section>\n      <section id=\"requestsView\">\n        <h2>Requests</h2>\n        <div class=\"actions\">\n          <button id=\"addReferral\">Add Referral</button\n          ><button id=\"selectAll\" class=\"secondary\">Select All Pending</button\n          ><button id=\"approveSelected\">Approve Selected</button\n          ><button id=\"rejectSelected\" class=\"danger\">Reject Selected</button>\n        </div>\n        <div id=\"requestCards\"></div>\n      </section>\n      <section id=\"routeView\" hidden>\n        <p class=\"print-verification-warning\">Open the prepared delivery PDF to print the delivery sheet.</p>\n        <div class=\"route-header\">\n          <h2 id=\"routeTitle\">Delivery Route</h2>\n          <p id=\"routeDate\"></p>\n          <p id=\"routePickup\"></p>\n          <p id=\"routeSummary\"></p>\n          <p id=\"routeStatus\" class=\"route-status warning\"></p>\n          <p id=\"routingAvailability\" class=\"hint no-print\"></p>\n        </div>\n        <div class=\"actions no-print\">\n          <button id=\"optimizeRoute\">Optimize Route</button\n          ><button id=\"saveRoute\">Save Manual Order</button\n          ><button id=\"printRoute\" class=\"secondary\" disabled>\n            Prepare Delivery PDF\n          </button>\n        </div>\n        <div id=\"deliveryPdf\" class=\"no-print\" hidden>\n          <p role=\"status\">US Letter PDF ready. On iPhone, open it and use Share → Print. If the viewer does not open, download the PDF and open it in Files.</p>\n          <div class=\"actions\">\n            <a id=\"openDeliveryPdf\" class=\"button\" target=\"_blank\" rel=\"noopener noreferrer\">Open PDF</a>\n            <a id=\"downloadDeliveryPdf\" class=\"button\" target=\"_blank\" rel=\"noopener noreferrer\">Download PDF</a>\n          </div>\n        </div>\n        <div id=\"routeStops\"></div>\n      </section>\n      <section id=\"settingsView\" hidden>\n        <h2>Event Settings</h2>\n        <form id=\"settingsForm\">\n          <div class=\"grid\">\n            <label\n              >Event name<input\n                name=\"eventName\"\n                required\n                maxlength=\"160\" /></label\n            ><label\n              >Delivery date<input\n                type=\"date\"\n                name=\"deliveryDate\"\n                required /></label\n            ><label\n              >Meal capacity<input\n                type=\"number\"\n                name=\"capacity\"\n                min=\"0\"\n                max=\"100000\"\n                step=\"1\"\n                required /></label\n            ><label\n              >Status<select name=\"status\">\n                <option>Draft</option>\n                <option>Open</option>\n                <option>Closed</option>\n                <option>Completed</option>\n              </select></label\n            ><label class=\"full\"\n              >Starting / pickup address<input\n                name=\"startAddress\"\n                maxlength=\"500\"\n            /></label>\n          </div>\n          <div class=\"actions\">\n            <button type=\"submit\">Save Event Settings</button\n            ><button type=\"button\" id=\"verifyPickup\" class=\"secondary\">\n              Validate Pickup Address\n            </button>\n          </div>\n          <button type=\"button\" id=\"manualPickup\" class=\"secondary\">Mark Saved Pickup Reviewed</button>\n          <p id=\"pickupStatus\"></p>\n          <p class=\"hint\" translate=\"no\">Address validation: Google Maps</p>\n        </form>\n      </section>\n      <section id=\"reportsView\" hidden>\n        <h2>Reports</h2>\n        <p class=\"hint\">\n          Archived events are included. Recipient totals count delivery records\n          across events.\n        </p>\n        <div class=\"grid\">\n          <label\n            >Event<select id=\"reportEvent\">\n              <option value=\"\">All events</option>\n            </select></label\n          ><label\n            >Year<select id=\"reportYear\">\n              <option value=\"\">All years</option>\n            </select></label\n          >\n        </div>\n        <div id=\"reportTotals\" class=\"metrics\"></div>\n        <p id=\"reportIntegrityNotice\" class=\"warning\" role=\"status\"></p>\n        <h3>Referring organizations</h3>\n        <div id=\"organizationReports\"></div>\n      </section>\n    </main>\n    <dialog id=\"referralDialog\">\n      <div class=\"dialog-header\">\n        <h2 id=\"referralHeading\">Referral</h2>\n        <button type=\"button\" id=\"closeReferral\" class=\"secondary\">\n          Close\n        </button>\n      </div>\n      <form id=\"referralEditor\">\n        <fieldset>\n          <legend>Referring organization</legend>\n          <div class=\"grid\">\n            <label\n              >Organization name<input\n                name=\"organizationName\"\n                maxlength=\"160\"\n                required /></label\n            ><label\n              >Email address<input\n                type=\"email\"\n                name=\"organizationEmail\"\n                maxlength=\"254\"\n                required /></label\n            ><label\n              >Phone number<input\n                name=\"organizationPhone\"\n                type=\"tel\"\n                maxlength=\"40\"\n                required\n            /></label>\n          </div>\n        </fieldset>\n        <div id=\"editorRecipients\"></div>\n        <div class=\"actions\">\n          <button type=\"button\" id=\"editorAddRecipient\" class=\"secondary\">\n            + Add Another Recipient</button\n          ><button type=\"submit\" id=\"saveReferral\">Save Referral</button>\n        </div>\n      </form>\n      <p id=\"editorMessage\" role=\"status\"></p>\n    </dialog>\n    <dialog id=\"eventDialog\">\n      <div class=\"dialog-header\">\n        <h2>Create Event</h2>\n        <button id=\"closeEvent\" class=\"secondary\">Close</button>\n      </div>\n      <form id=\"eventEditor\">\n        <div class=\"grid\">\n          <label\n            >Event name<input\n              name=\"eventName\"\n              required\n              maxlength=\"160\" /></label\n          ><label\n            >Delivery date<input\n              type=\"date\"\n              name=\"deliveryDate\"\n              required /></label\n          ><label\n            >Meal capacity<input\n              type=\"number\"\n              name=\"capacity\"\n              min=\"0\"\n              max=\"100000\"\n              step=\"1\"\n              required /></label\n          ><label\n            >Status<select name=\"status\">\n              <option>Draft</option>\n              <option>Open</option>\n              <option>Closed</option>\n            </select></label\n          ><label class=\"full\"\n            >Starting / pickup address<input\n              name=\"startAddress\"\n              maxlength=\"500\"\n          /></label>\n        </div>\n        <div class=\"actions\"><button type=\"submit\">Create Event</button></div>\n      </form>\n      <p id=\"eventEditorMessage\" role=\"status\"></p>\n    </dialog>\n    <dialog id=\"publicLinkDialog\" aria-labelledby=\"publicLinkTitle\">\n      <h2 id=\"publicLinkTitle\">Public Referral Link</h2>\n      <p>Share this link with organizations requesting meals.</p>\n      <label>Website link<input id=\"publicLinkValue\" type=\"url\" readonly /></label>\n      <div class=\"actions\">\n        <button id=\"copyPublicLink\" type=\"button\">Copy Link</button>\n        <a id=\"openPublicLink\" target=\"_blank\" rel=\"noopener noreferrer\">Open Public Form</a>\n        <button id=\"closePublicLink\" type=\"button\" class=\"secondary\">Close</button>\n      </div>\n      <p id=\"publicLinkMessage\" role=\"status\" aria-live=\"polite\"></p>\n    </dialog>\n    <script>\n      /* Shared public/admin address controls. Address data and receipts stay in memory. */\n\"use strict\";\nwindow.MealButtonFeedback = (() => {\n  const active = new WeakMap();\n  let clicked = null;\n  document.addEventListener(\"click\", (event) => {\n    const button = event.target.closest?.(\"button\");\n    if (!button) return;\n    if (active.has(button)) {\n      event.preventDefault();\n      event.stopImmediatePropagation();\n      return;\n    }\n    clicked = button;\n    button.setAttribute(\"data-click-feedback\", \"true\");\n    setTimeout(() => button.removeAttribute(\"data-click-feedback\"), 250);\n    setTimeout(() => { if (clicked === button) clicked = null; }, 0);\n  }, true);\n  function begin(button) {\n    if (!button || active.has(button)) return () => {};\n    const before = [\"aria-busy\", \"aria-disabled\", \"aria-label\"].map(name => [name, button.getAttribute(name)]);\n    active.set(button, true);\n    button.setAttribute(\"aria-busy\", \"true\");\n    button.setAttribute(\"aria-disabled\", \"true\");\n    button.setAttribute(\"aria-label\", button.textContent.trim() + \" — Loading\");\n    return () => {\n      active.delete(button);\n      for (const [name, value] of before)\n        if (value == null) button.removeAttribute(name);\n        else button.setAttribute(name, value);\n    };\n  }\n  return { begin, current: () => clicked };\n})();\nwindow.MealAddresses = (() => {\n  const states = new WeakMap();\n  let counter = 0;\n  const node = (tag, text) => {\n    const n = document.createElement(tag);\n    if (text != null) n.textContent = text;\n    return n;\n  };\n  function choose(result) {\n    return new Promise((resolve) => {\n      const d = node(\"dialog\"),\n        heading = node(\"h2\", \"Check this address\");\n      d.className = \"address-check\";\n      heading.id = \"address-check-\" + ++counter;\n      d.setAttribute(\"aria-labelledby\", heading.id);\n      d.append(\n        heading,\n        node(\n          \"p\",\n          result.confident\n            ? \"Please confirm the address for delivery.\"\n            : \"This address could not be confidently confirmed. You may edit it or keep it for administrator review.\",\n        ),\n      );\n      if (result.unitIssue)\n        d.append(\n          node(\n            \"p\",\n            \"Apartment / suite / unit information needs review. Your entered unit has been preserved.\",\n          ),\n        );\n      d.append(node(\"h3\", \"You entered:\"), node(\"p\", result.original));\n      if (result.recommended)\n        d.append(\n          node(\"h3\", \"Recommended:\"),\n          node(\"p\", result.recommended),\n          attribution(),\n        );\n      const actions = node(\"div\");\n      actions.className = \"actions\";\n      const finish = (value) => {\n        d.close();\n        d.remove();\n        resolve(value);\n      };\n      for (const [label, value] of [\n        [\"Use Recommended\", \"recommended\"],\n        [\"Keep What I Entered\", \"original\"],\n        [\"Edit\", \"edit\"],\n      ]) {\n        if (value === \"recommended\" && !result.recommended) continue;\n        const b = node(\"button\", label);\n        b.type = \"button\";\n        b.addEventListener(\"click\", () => finish(value));\n        actions.append(b);\n      }\n      d.append(actions);\n      d.addEventListener(\"cancel\", (e) => {\n        e.preventDefault();\n        finish(\"edit\");\n      });\n      document.body.append(d);\n      d.showModal();\n    });\n  }\n  function attribution() {\n    const n = node(\"span\");\n    const logo = node(\"img\");\n    logo.alt = \"Google Maps\";\n    logo.height = 18;\n    logo.src =\n      \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAAASCAYAAACghwvPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABDBJREFUeNrcWI1R4lAQjgwFhAouVHBQwYUKDA0oVACpQKkArIBoA8QKEiswHZir4GIF3q7z7c3nmxci3gwyvJk3Itl9b3++/XbDRUDr6uoqlj8L2UnwceWy7x8eHvLgG5fYN5I/a/0stkyCM1o9clIdLDxJCPDdTmS232xvKDvG/moyb3V3yISQmx01EUjCEt9VsqeyB4K6C3wuzwh8N7o7gryG3PWxjOqDjiwJmQR/zgKgo1wNl8/ZGSVkLT7l4lPjob/ZsY3poSfoqmWnbYJdSdCEyo4+QQ0qF3bIRADIIZQTIYiH0NyypRqOvi7E+Dd8TiXYmwOdD2E4I6jGWTkHCXKJIzcXudLTjC0JDWgxBGU+oo8FoE3VSaATkc6qzRf4W+FM1RmKbE1n7XCn2lDaUOC554Of8rzAua8AdwhbMtjTUBuY4XmA52mfbKw8RhctOVDZFYLiojBCY9cgZ0jWM13cUBAKeT5VZ5CEguQMtZy8R8c+CxwnNwLtNHuqWG24k71FcKdONaSw2XePASeGnxOAiYeICneMUHVq05R6cY0ExEhK1OsAfdyyjUctCXMgdIALdG2pYgwdavQAcpXj/JqQP8R5Y+jta6oWHB0uhhi1rQeEHVSrdyWgy1sETPukC0oLnPo5QZVYL104sqo/hsyQ7kgoXnqGVpP6p5V7z4nw8evE2YywS7o4g3MN0NTQ2GuIXhkNQc5QaP0gJrkachWQ2/ZOYTSxwiT0h+6rneryrZQSuoDdqSdpRouXyhJgikuq2n+VxsMO/Fzh31+wKQATrJEc9TfrEYIWLoI0cLwpWE8k9tvRaQjtERlaOXK1U3k8pfEq9zRbWwVKPgRYxkBlvS8L8CkHCFX3zp2ikPQZqCnpAG7VQoMmn8K+CPbqmS96fo8QF+0rZyrdgJKn64engceEysYNNjXwwD0PKAl8SWpxkCe+ARBZHzBzWAXUotv2ondNFGzUNPbIjfYARs9/rxjQ7gS09E7fPaDCJgzN/LNmCOOgvmEmKMUbyGyoVN915PmSkrCjQOVOxSWUhB0ZWBHytza60k8uQQtd1HyXOgqdF5R+FzVZZY4RmK6Vd4y5IRoyg9Li9gRaU9tCsExqE1wfxqTy8BVKEaYJ38qgrDob0bkGCtZsAI3DGpgUMiNMGe6Zc0KmTU2FR8635jS5vTg6MfFzVzKqDhFLuN5R4r62d6YlwFCBykKMwTpB/oRdCvac4lL3yJhbasiNBwlT962bysulianTwN1Gb9w/pgZeQS53zqocOiqteqA79vSRDJOJb+IqW7h8n5xxe0jBnXvOKpH8iN4VMhtMAOINvUzG0Jme1G8OoMSR851W25vs3Sn/XgIbi//+9fUEHNmCErfWyFHiM9/L3Lmt/gnZcoey9/F95VDW2a2TqQjqEYfw/Skt7Q33X1X+K8AAJX03+VzRIA4AAAAASUVORK5CYII=\";\n    n.append(logo);\n    n.className = \"address-attribution\";\n    n.setAttribute(\"translate\", \"no\");\n    return n;\n  }\n  function attach(\n    input,\n    call,\n    context = () => ({}),\n    initialStatus = \"Needs Review\",\n  ) {\n    if (states.has(input)) return states.get(input);\n    const label = input.parentElement,\n      holder = node(\"div\");\n    holder.className =\n      \"address-entry\" + (label.classList.contains(\"full\") ? \" full\" : \"\");\n    label.replaceWith(holder);\n    holder.append(label);\n    const list = node(\"div\"),\n      status = node(\"p\"),\n      check = node(\"button\", \"Check Address\");\n    list.className = \"address-suggestions\";\n    list.id = \"address-list-\" + ++counter;\n    list.hidden = true;\n    list.setAttribute(\"role\", \"group\");\n    list.setAttribute(\"aria-label\", \"Google address suggestions\");\n    status.className = \"hint address-state\";\n    status.setAttribute(\"role\", \"status\");\n    status.setAttribute(\"aria-live\", \"polite\");\n    check.type = \"button\";\n    check.className = \"secondary address-check-button\";\n    holder.append(list, check, status);\n    const privacy = node(\n      \"p\",\n      \"Address search and checking send only this address text to Google. Keep recipient names and delivery notes in their separate fields.\",\n    );\n    privacy.className = \"hint\";\n    holder.append(privacy);\n    input.setAttribute(\"autocomplete\", \"off\");\n    input.setAttribute(\"aria-controls\", list.id);\n    input.setAttribute(\"aria-expanded\", \"false\");\n    input.setAttribute(\"aria-autocomplete\", \"list\");\n    let revision = 0,\n      timer,\n      session = null,\n      features = null,\n      configRequest = null,\n      suggesting = false,\n      lastSuggestionAt = 0,\n      receipt = \"\",\n      checked = input.value.trim(),\n      running = null;\n    const labelStatus = (s) =>\n      s === \"Confirmed\"\n        ? \"Address Verified\"\n        : s === \"Manually Reviewed\"\n          ? \"Address manually reviewed\"\n          : \"Needs Review\";\n    status.textContent = labelStatus(initialStatus);\n    const clear = () => {\n      list.hidden = true;\n      list.replaceChildren();\n      input.setAttribute(\"aria-expanded\", \"false\");\n    };\n    const reset = (s = \"Needs Review\") => {\n      revision++;\n      clearTimeout(timer);\n      timer = null;\n      session = null;\n      receipt = \"\";\n      checked = input.value.trim();\n      status.textContent = labelStatus(s);\n      clear();\n    };\n    async function config() {\n      if (features) return features;\n      if (!configRequest)\n        configRequest = call(\"addressConfig\", {}).then(\n          (value) => (features = value),\n          (error) => { configRequest = null; throw error; },\n        );\n      return configRequest;\n    }\n    async function validate(candidate) {\n      if (running) return running;\n      const original = input.value.trim(),\n        rev = revision;\n      if (!original) return true;\n      const finishFeedback = MealButtonFeedback.begin(check);\n      clear();\n      clearTimeout(timer);\n      timer = null;\n      running = (async () => {\n        let result;\n        try {\n          if (!(await config()).validation) {\n            checked = original;\n            receipt = \"\";\n            status.textContent =\n              \"Needs Review — address checking is currently unavailable.\";\n            return true;\n          }\n          status.textContent = \"Checking address…\";\n          result = await call(\"addressPreview\", {\n            ...context(),\n            address: original,\n            candidate: candidate || original,\n            sessionToken: session || \"\",\n          });\n        } catch (_) {\n          result = { original, confident: false };\n        } finally {\n          session = null;\n        }\n        if (\n          rev !== revision ||\n          input.value.trim() !== original ||\n          !input.isConnected\n        )\n          return false;\n        let choice = \"original\";\n        if (!result.confident || !result.equivalent)\n          choice = await choose(result);\n        if (rev !== revision || !input.isConnected) return false;\n        if (choice === \"edit\") {\n          checked = \"\";\n          receipt = \"\";\n          status.textContent =\n            \"Needs Review — edit the address and check again.\";\n          input.focus();\n          return false;\n        }\n        if (choice === \"recommended\") {\n          input.value = result.recommended;\n          receipt = result.recommendedReceipt || \"needs-review\";\n        } else receipt = result.originalReceipt || \"needs-review\";\n        checked = input.value.trim();\n        status.textContent =\n          result.confident && (choice === \"recommended\" || result.equivalent)\n            ? \"Address Verified\"\n            : \"Needs Review\";\n        return true;\n      })();\n      try {\n        return await running;\n      } finally {\n        running = null;\n        finishFeedback();\n      }\n    }\n    function selectSuggestion(address) {\n      if (running) return;\n      const entered = input.value.trim();\n      const units = (value) => value.match(\n        /(?:\\b(?:apartment|apt|suite|ste|unit|floor|fl|building|bldg|room|rm)\\.?\\s*|#\\s*)[a-z0-9][a-z0-9 -]*/gi,\n      ) || [];\n      const enteredUnits = units(entered), selectedUnits = units(address);\n      const key = (parts) => parts.map(x => x.toLowerCase().replace(/\\./g, \"\")\n        .replace(/\\b(?:apartment|apt)\\b/g, \"apt\")\n        .replace(/\\b(?:suite|ste)\\b/g, \"suite\").replace(/\\s+/g, \" \").trim()).sort().join(\"|\");\n      // A conflicting unit still needs the original-versus-recommended review.\n      if (enteredUnits.length && selectedUnits.length && key(enteredUnits) !== key(selectedUnits))\n        return validate(address);\n      input.value = address + (enteredUnits.length && !selectedUnits.length\n        ? \", \" + enteredUnits.join(\", \") : \"\");\n      revision++;\n      receipt = \"\";\n      checked = \"\";\n      // Clicking a suggestion explicitly selects it. Validate that selected value now.\n      return validate();\n    }\n    function scheduleSuggestions() {\n      if (timer || suggesting || running || input.value.trim().length < 4 ||\n          input.disabled || !input.isConnected || document.activeElement !== input) return;\n      // Start during typing; coalesce edits and allow only one request in flight.\n      const delay = Math.max(150, 1000 - (Date.now() - lastSuggestionAt));\n      timer = setTimeout(() => {\n        timer = null;\n        suggest(revision);\n      }, delay);\n    }\n    async function suggest(rev) {\n      const address = input.value.trim();\n      if (address.length < 4 || input.disabled || suggesting || running ||\n          !input.isConnected || document.activeElement !== input) return;\n      suggesting = true;\n      try {\n        if (!(await config()).autocomplete || rev !== revision) return;\n        session ||= crypto.randomUUID();\n        lastSuggestionAt = Date.now();\n        status.textContent = \"Searching addresses…\";\n        const data = await call(\"addressSuggestions\", {\n          ...context(),\n          address,\n          sessionToken: session,\n        });\n        if (\n          rev !== revision ||\n          running || checked === input.value.trim() ||\n          !input.isConnected ||\n          document.activeElement !== input\n        )\n          return;\n        clear();\n        for (const suggestion of data.suggestions || []) {\n          const b = node(\"button\", suggestion.address);\n          b.type = \"button\";\n          b.className = \"address-suggestion\";\n          // Keep Safari/touch blur from removing the button before its click.\n          b.addEventListener(\"pointerdown\", (event) => event.preventDefault());\n          b.addEventListener(\"click\", () => selectSuggestion(suggestion.address));\n          b.addEventListener(\"keydown\", (e) => {\n            const buttons = [...list.querySelectorAll(\"button\")],\n              at = buttons.indexOf(b);\n            if (e.key === \"ArrowDown\" || e.key === \"ArrowUp\") {\n              e.preventDefault();\n              buttons[\n                (at + (e.key === \"ArrowDown\" ? 1 : buttons.length - 1)) %\n                  buttons.length\n              ].focus();\n            }\n            if (e.key === \"Escape\") {\n              e.preventDefault();\n              clear();\n              input.focus();\n            }\n          });\n          list.append(b);\n        }\n        if (list.children.length) {\n          list.append(attribution());\n          list.hidden = false;\n          input.setAttribute(\"aria-expanded\", \"true\");\n        }\n      } catch (_) {\n        if (rev === revision) {\n          clear();\n          status.textContent =\n            \"Suggestions unavailable. Enter the full address; it can still be submitted.\";\n        }\n      } finally {\n        suggesting = false;\n        if (rev !== revision) scheduleSuggestions();\n        else if (!running && status.textContent === \"Searching addresses…\")\n          status.textContent = \"Needs Review\";\n      }\n    }\n    input.addEventListener(\"focus\", () => {\n      // Warm configuration before the first address-search request.\n      config().catch(() => {});\n    });\n    input.addEventListener(\"input\", () => {\n      revision++;\n      receipt = \"\";\n      checked = \"\";\n      clear();\n      status.textContent = suggesting ? \"Searching addresses…\" : \"Needs Review\";\n      scheduleSuggestions();\n    });\n    input.addEventListener(\"keydown\", (e) => {\n      if (e.key === \"Escape\") clear();\n      if (e.key === \"ArrowDown\" && !list.hidden) {\n        e.preventDefault();\n        list.querySelector(\"button\")?.focus();\n      }\n    });\n    holder.addEventListener(\"focusout\", (e) => {\n      if (!holder.contains(e.relatedTarget)) clear();\n    });\n    check.addEventListener(\"click\", () => validate());\n    const state = {\n      reset,\n      check: () => validate(),\n      prepare: () =>\n        running ||\n        (checked === input.value.trim() ? Promise.resolve(true) : validate()),\n      receipt: () => (checked === input.value.trim() ? receipt : \"\"),\n    };\n    states.set(input, state);\n    return state;\n  }\n  async function prepareAll(root) {\n    for (const input of root.querySelectorAll(\n      '[name=\"address\"], [name=\"startAddress\"]',\n    ))\n      if (\n        !input.disabled &&\n        states.has(input) &&\n        !(await states.get(input).prepare())\n      )\n        return false;\n    return true;\n  }\n  return {\n    attach,\n    prepareAll,\n    receipt: (input) => states.get(input)?.receipt() || \"\",\n    reset: (input, status) => states.get(input)?.reset(status),\n  };\n})();\n\n      \"use strict\";\n(() => {\n  const $ = (id) => document.getElementById(id);\n  let events = [],\n    dashboard = null,\n    route = null,\n    editing = null,\n    viewOnly = false,\n    view = \"requestsView\",\n    busy = false,\n    dragId = null,\n    createId = null,\n    routeUnsaved = false,\n    deliveryPdfUrl = null,\n    referralAddressControls = [];\n  const el = (tag, text, cls) => {\n    const n = document.createElement(tag);\n    if (text != null) n.textContent = text;\n    if (cls) n.className = cls;\n    return n;\n  };\n  const button = (text, fn, cls) => {\n    const b = el(\"button\", text, cls);\n    b.type = \"button\";\n    b.addEventListener(\"click\", fn);\n    return b;\n  };\n  const addressCall = (action, p) => rpc(action, p);\n  const pickupSettings = MealAddresses.attach(\n    $(\"settingsForm\").elements.startAddress,\n    addressCall,\n  );\n  const pickupCreate = MealAddresses.attach(\n    $(\"eventEditor\").elements.startAddress,\n    addressCall,\n  );\n  const addressReviewed = (status) =>\n    [\"Confirmed\", \"Manually Reviewed\"].includes(status);\n  const readonly = () =>\n    !dashboard ||\n    dashboard.event.Archived === true ||\n    dashboard.event.Status === \"Completed\";\n  function rpc(action, p = {}) {\n    return new Promise((resolve, reject) =>\n      google.script.run\n        .withSuccessHandler((r) =>\n          r.ok\n            ? resolve(r.data)\n            : reject(\n                Object.assign(new Error(\n                  r.error?.message ||\n                    \"Your changes were not saved. Please try again.\",\n                ), { code: r.error?.code }),\n              ),\n        )\n        .withFailureHandler(() =>\n          reject(\n            new Error(\n              \"The service could not be reached. Refresh and try again.\",\n            ),\n          ),\n        )\n        .adminCall(action, p),\n    );\n  }\n  const pendingCreates = new Map();\n  for (const action of [\"createReferral\", \"saveEvent\"]) {\n    try {\n      const pending = JSON.parse(sessionStorage.getItem(\"community-meals-admin-\" + action) || \"null\");\n      if (pending) pendingCreates.set(action, pending);\n    } catch (_) { /* Storage may be unavailable; this tab still deduplicates. */ }\n  }\n  function retainCreate(action, pending) {\n    if (pending) pendingCreates.set(action, pending);\n    else pendingCreates.delete(action);\n    try {\n      const key = \"community-meals-admin-\" + action;\n      if (pending) sessionStorage.setItem(key, JSON.stringify(pending));\n      else sessionStorage.removeItem(key);\n    } catch (_) { /* No recipient details are stored in browser storage. */ }\n  }\n  async function createOnce(action, payload) {\n    const canonical = { ...payload };\n    delete canonical.submissionId;\n    delete canonical.creationId;\n    delete canonical.addressReceipt;\n    if (canonical.recipients)\n      canonical.recipients = canonical.recipients.map(({ addressReceipt, ...r }) => r);\n    const digest = await crypto.subtle.digest(\"SHA-256\", new TextEncoder().encode(JSON.stringify(canonical)));\n    const fingerprint = [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, \"0\")).join(\"\");\n    let pending = pendingCreates.get(action);\n    const wasPending = Boolean(pending);\n    if (pending && pending.fingerprint !== fingerprint)\n      throw new Error(\"A previous save is unconfirmed. Restore the same information and retry before creating a different record. Refresh the dashboard to check whether it was saved.\");\n    if (!pending) pending = { id: crypto.randomUUID(), fingerprint, eventId: payload.eventId || \"\" };\n    retainCreate(action, pending);\n    try {\n      const result = await rpc(action, { ...payload,\n        [action === \"createReferral\" ? \"submissionId\" : \"creationId\"]: pending.id });\n      retainCreate(action, null);\n      return result;\n    } catch (error) {\n      // A later authentication/validation failure cannot disprove an earlier\n      // lost response. Keep that original operation identity until reconciled.\n      if (!wasPending && [\"INVALID\", \"CAPACITY\", \"CLOSED\", \"READ_ONLY\", \"AUTH\", \"FORBIDDEN\"].includes(error.code))\n        retainCreate(action, null);\n      throw error;\n    }\n  }\n  async function task(fn, trigger = MealButtonFeedback.current()) {\n    if (busy) return;\n    busy = true;\n    const finishFeedback = MealButtonFeedback.begin(trigger);\n    $(\"adminEvents\").disabled = true;\n    $(\"showArchived\").disabled = true;\n    $(\"adminMessage\").textContent = \"Working…\";\n    try {\n      await fn();\n      $(\"adminMessage\").textContent = \"\";\n    } catch (e) {\n      $(\"adminMessage\").textContent = e.message;\n    } finally {\n      busy = false;\n      finishFeedback();\n      $(\"adminEvents\").disabled = false;\n      $(\"showArchived\").disabled = false;\n    }\n  }\n  const dateLabel = (s) =>\n    new Date(s + \"T12:00:00\").toLocaleDateString(undefined, {\n      year: \"numeric\",\n      month: \"long\",\n      day: \"numeric\",\n    });\n  function today() {\n    return new Intl.DateTimeFormat(\"en-CA\", {\n      timeZone: \"America/New_York\",\n      year: \"numeric\",\n      month: \"2-digit\",\n      day: \"2-digit\",\n    }).format(new Date());\n  }\n  function metric(node, pairs) {\n    node.replaceChildren(...pairs.map(([k, v]) => el(\"span\", k + \": \" + v)));\n  }\n  function eventOptions() {\n    const list = events.filter(\n        (e) => $(\"showArchived\").checked || e.Archived !== true,\n      ),\n      old = dashboard?.event.EventID || $(\"adminEvents\").value;\n    const options = list.map((e) => {\n      const o = el(\"option\", e.EventName + (e.Archived ? \" (Archived)\" : \"\"));\n      o.value = e.EventID;\n      return o;\n    });\n    $(\"adminEvents\").replaceChildren(...options);\n    $(\"adminEvents\").value = list.some((e) => e.EventID === old)\n      ? old\n      : (list.find((e) => e.DeliveryDate >= today()) || list[0])?.EventID || \"\";\n  }\n  async function refreshEvents(preferred) {\n    events = await rpc(\"events\");\n    const pendingEvent = pendingCreates.get(\"saveEvent\");\n    if (pendingEvent && events.some(e => e.EventID === pendingEvent.id))\n      retainCreate(\"saveEvent\", null);\n    if (preferred) {\n      dashboard = null;\n      $(\"adminEvents\").value = preferred;\n    }\n    eventOptions();\n    if (\n      preferred &&\n      events.some(\n        (e) =>\n          e.EventID === preferred &&\n          (!$(\"showArchived\").checked ? e.Archived !== true : true),\n      )\n    )\n      $(\"adminEvents\").value = preferred;\n    await refresh();\n  }\n  async function refresh() {\n    clearDeliveryPdf();\n    const id = $(\"adminEvents\").value;\n    if (!id) {\n      dashboard = null;\n      route = null;\n      metric($(\"metrics\"), []);\n      $(\"requestCards\").replaceChildren(\n        el(\"p\", \"No events available. Create an event to get started.\"),\n      );\n      $(\"routeStops\").replaceChildren();\n      $(\"routeTitle\").textContent = \"Delivery Route\";\n      $(\"routeDate\").textContent = \"\";\n      $(\"routePickup\").textContent = \"\";\n      $(\"routeSummary\").textContent = \"\";\n      $(\"routeStatus\").textContent = \"No event selected.\";\n      $(\"printRoute\").disabled = true;\n      $(\"archiveEvent\").disabled = true;\n      $(\"reopenEvent\").hidden = true;\n      $(\"settingsForm\").inert = true;\n      $(\"readonlyNotice\").textContent = \"\";\n      $(\"integrityNotice\").textContent = \"\";\n      $(\"addReferral\").disabled = true;\n      await reports();\n      return;\n    }\n    dashboard = await rpc(\"dashboard\", { eventId: id });\n    route = await rpc(\"route\", { eventId: id });\n    routeUnsaved = false;\n    renderDashboard();\n    renderRequests();\n    renderRoute();\n    renderSettings();\n    if (view === \"reportsView\") await reports();\n  }\n  function renderDashboard() {\n    $(\"integrityNotice\").textContent = integrityMessage(dashboard.integrity);\n    metric($(\"metrics\"), [\n      [\"Capacity\", dashboard.capacity],\n      [\"Reserved\", dashboard.reserved],\n      [\"Available\", dashboard.available],\n      [\"Pending Referrals\", dashboard.pendingReferrals],\n      [\"Approved Referrals\", dashboard.approvedReferrals],\n      [\"Delivery Stops\", dashboard.deliveryStops],\n    ]);\n    const ro = readonly();\n    $(\"readonlyNotice\").textContent = ro\n      ? \"This event is read-only. Use Reopen / Unarchive to make corrections.\"\n      : \"\";\n    $(\"archiveEvent\").disabled = dashboard.event.Archived === true;\n    $(\"reopenEvent\").hidden = !ro;\n    [\n      \"addReferral\",\n      \"selectAll\",\n      \"approveSelected\",\n      \"rejectSelected\",\n      \"optimizeRoute\",\n      \"saveRoute\",\n      \"verifyPickup\",\n    ].forEach((id) => ($(id).disabled = ro));\n    $(\"settingsForm\").inert = ro;\n  }\n  function integrityMessage(issues) {\n    if (!issues || !(issues.recipientRecords || issues.submissionRecords)) return \"\";\n    return \"Historical records need review: \" + issues.recipientRecords +\n      \" unlinked recipient records (\" + issues.mealQuantities + \" meal quantities) and \" +\n      issues.submissionRecords + \" unlinked submission records. These records are preserved and excluded from referral totals; their delivery status must be reviewed before restoring them.\";\n  }\n  function selectedRefs() {\n    return [...$(\"requestCards\").querySelectorAll(\"input:checked\")].map(\n      (x) => ({\n        referralId: x.dataset.referralId,\n        version: Number(x.dataset.version),\n      }),\n    );\n  }\n  async function changeStatus(referrals, status) {\n    if (!referrals.length) throw new Error(\"Select at least one referral.\");\n    if (\n      status === \"Rejected\" &&\n      !confirm(\n        \"Reject \" +\n          referrals.length +\n          \" referral(s) and release their reserved meals?\",\n      )\n    )\n      return;\n    await rpc(\"statuses\", { referrals, status });\n    await refresh();\n  }\n  function renderRequests() {\n    const refs = dashboard.referrals\n      .slice()\n      .sort(\n        (a, b) =>\n          (a.Status === \"Pending\" ? 0 : 1) - (b.Status === \"Pending\" ? 0 : 1) ||\n          a.SubmittedAt.localeCompare(b.SubmittedAt),\n      );\n    $(\"requestCards\").replaceChildren();\n    if (!refs.length) $(\"requestCards\").append(el(\"p\", \"No referrals yet.\"));\n    refs.forEach((r) => {\n      const card = el(\"article\", null, \"request-card\"),\n        header = el(\"header\");\n      const check = el(\"input\");\n      check.type = \"checkbox\";\n      check.dataset.referralId = r.ReferralID;\n      check.dataset.version = r.Version;\n      check.disabled = readonly();\n      const label = el(\"label\", null, \"check-label\");\n      label.append(check, el(\"span\", \"Select \" + r.OrganizationName));\n      header.append(label, el(\"span\", r.Status, \"badge\"));\n      card.append(\n        header,\n        el(\n          \"h3\",\n          r.OrganizationName +\n            \" — \" +\n            r.recipients.length +\n            \" Recipients — \" +\n            r.meals +\n            \" Meals\",\n        ),\n        el(\n          \"p\",\n          \"Submitted \" + new Date(r.SubmittedAt).toLocaleString(),\n          \"hint\",\n        ),\n      );\n      const recipients = el(\"ol\", null, \"request-recipient-list\");\n      r.recipients.forEach((recipient) => {\n        const item = el(\"li\");\n        item.append(\n          el(\"strong\", recipient.RecipientName),\n          el(\"p\", recipient.Address),\n          el(\"p\", recipient.MealCount + (Number(recipient.MealCount) === 1 ? \" meal\" : \" meals\")),\n        );\n        if (!addressReviewed(recipient.AddressStatus))\n          item.append(el(\"span\", \"Address Needs Review\", \"badge\"));\n        else item.append(el(\"span\", recipient.AddressStatus === \"Confirmed\"\n          ? \"Address Verified\" : \"Address Manually Reviewed\", \"hint\"));\n        if (recipient.DuplicateFlag)\n          item.append(el(\"span\", \"Possible Duplicate\", \"warning\"));\n        recipients.append(item);\n      });\n      card.append(recipients);\n      if (r.recipients.some((x) => x.DuplicateFlag))\n        card.append(\n          el(\n            \"p\",\n            \"Possible Duplicate — open View to see matching records.\",\n            \"warning\",\n          ),\n        );\n      if (r.recipients.some((x) => !addressReviewed(x.AddressStatus)))\n        card.append(el(\"p\", \"Address Needs Review\", \"badge\"));\n      const actions = el(\"div\", null, \"actions\");\n      actions.append(button(\"View\", () => openReferral(r, true), \"secondary\"));\n      if (!readonly()) {\n        actions.append(\n          button(\"Edit\", () => openReferral(r, false), \"secondary\"),\n          button(\"Review Addresses with Google\", () =>\n            task(() => reviewReferralAddresses(r)), \"secondary\"),\n        );\n        [\"Approved\", \"Rejected\", \"Pending\"]\n          .filter((s) => s !== r.Status)\n          .forEach((status) =>\n            actions.append(\n              button(\n                status === \"Approved\"\n                  ? \"Approve\"\n                  : status === \"Rejected\"\n                    ? \"Reject\"\n                    : \"Return to Pending\",\n                () =>\n                  task(() =>\n                    changeStatus(\n                      [{ referralId: r.ReferralID, version: r.Version }],\n                      status,\n                    ),\n                  ),\n                status === \"Rejected\" ? \"danger\" : \"secondary\",\n              ),\n            ),\n          );\n      }\n      card.append(actions);\n      $(\"requestCards\").append(card);\n    });\n  }\n  function field(label, name, value, type = \"text\", max = 1000) {\n    const wrap = el(\"label\", label),\n      input = el(type === \"textarea\" ? \"textarea\" : \"input\");\n    input.name = name;\n    if (type !== \"textarea\") input.type = type;\n    input.value = value ?? \"\";\n    input.maxLength = max;\n    if (type === \"number\") {\n      input.min = \"1\";\n      input.max = \"10000\";\n      input.step = \"1\";\n    }\n    if ([\"recipientName\", \"address\", \"mealCount\"].includes(name))\n      input.required = true;\n    wrap.append(input);\n    return wrap;\n  }\n  function recipientEditor(r) {\n    const card = el(\"fieldset\", null, \"recipient-card\");\n    if (r) {\n      card.dataset.recipientId = r.RecipientID;\n      card.dataset.version = r.Version;\n    }\n    card.append(\n      el(\"legend\", \"Recipient \" + ($(\"editorRecipients\").children.length + 1)),\n    );\n    const grid = el(\"div\", null, \"grid\");\n    grid.append(\n      field(\"Recipient name\", \"recipientName\", r?.RecipientName, \"text\", 160),\n      field(\n        \"Street address (include apartment/unit)\",\n        \"address\",\n        r?.Address,\n        \"text\",\n        500,\n      ),\n      field(\"Phone (optional)\", \"phone\", r?.Phone, \"tel\", 40),\n      field(\"Number of meals\", \"mealCount\", r?.MealCount || 1, \"number\"),\n      field(\n        \"Dietary restrictions / allergies\",\n        \"dietaryRestrictions\",\n        r?.DietaryRestrictions,\n        \"textarea\",\n        500,\n      ),\n    );\n    const door = el(\"label\", \"Preferred door\"),\n      select = el(\"select\");\n    select.name = \"doorPreference\";\n    [\"Front\", \"Side\", \"Back\", \"Other\"].forEach((s) => {\n      const o = el(\"option\", s);\n      o.value = s;\n      select.append(o);\n    });\n    select.value = r?.DoorPreference || \"Front\";\n    door.append(select);\n    grid.append(\n      door,\n      field(\n        \"Delivery instructions (printed)\",\n        \"deliveryInstructions\",\n        r?.DeliveryInstructions,\n        \"textarea\",\n      ),\n      field(\n        \"Internal notes (admin only; never printed)\",\n        \"notes\",\n        r?.Notes,\n        \"textarea\",\n      ),\n    );\n    card.append(grid);\n    if (!viewOnly)\n      referralAddressControls.push(MealAddresses.attach(\n        grid.querySelector('[name=\"address\"]'),\n        addressCall,\n        () => ({}),\n        r?.AddressStatus,\n      ));\n    if (r) {\n      card.append(\n        el(\n          \"p\",\n          addressReviewed(r.AddressStatus)\n            ? r.AddressStatus === \"Manually Reviewed\"\n              ? \"Address manually reviewed (Google validation not performed)\"\n              : \"Address confirmed\"\n            : \"Address Needs Review\",\n          addressReviewed(r.AddressStatus) ? \"hint\" : \"warning\",\n        ),\n      );\n      if (r.matches?.length) {\n        const details = el(\"details\"),\n          summary = el(\"summary\", \"Possible Duplicate — matching recipients\");\n        details.append(summary);\n        r.matches.forEach((m) =>\n          details.append(\n            el(\n              \"p\",\n              m.recipientName +\n                \" — \" +\n                m.address +\n                \" — Referral \" +\n                m.referralId,\n            ),\n          ),\n        );\n        card.append(details);\n      }\n      if (!readonly()) {\n        card.append(\n          button(\n            \"Mark Saved Address Reviewed\",\n            () => {\n              if (\n                !confirm(\n                  \"Have you checked the SAVED address and confirmed it is usable for delivery? Unsaved edits are not reviewed. This is manual review, not Google validation.\",\n                )\n              )\n                return;\n              task(async () => {\n                await rpc(\"manualAddressReview\", {\n                  entity: \"recipient\",\n                  recipientId: r.RecipientID,\n                  version: r.Version,\n                  confirmed: true,\n                });\n                $(\"referralDialog\").close();\n                await refresh();\n              });\n            },\n            \"secondary\",\n          ),\n        );\n      }\n    } else {\n      card.append(\n        button(\n          \"Remove Recipient\",\n          () => {\n            if ($(\"editorRecipients\").children.length > 1) {\n              card.remove();\n              [...$(\"editorRecipients\").children].forEach(\n                (c, i) =>\n                  (c.querySelector(\"legend\").textContent =\n                    \"Recipient \" + (i + 1)),\n              );\n            }\n          },\n          \"secondary\",\n        ),\n      );\n    }\n    $(\"editorRecipients\").append(card);\n    if (viewOnly)\n      grid\n        .querySelectorAll(\"input,select,textarea\")\n        .forEach((x) => (x.disabled = true));\n  }\n  function openReferral(r, read) {\n    editing = r || null;\n    viewOnly = read || readonly();\n    createId = r ? null : crypto.randomUUID();\n    $(\"referralHeading\").textContent = r\n      ? viewOnly\n        ? \"View Referral\"\n        : \"Edit Referral\"\n      : \"Add Referral\";\n    $(\"editorMessage\").textContent = \"\";\n    referralAddressControls = [];\n    $(\"saveReferral\").textContent = \"Save Referral\";\n    $(\"saveReferral\").disabled = false;\n    [\"organizationName\", \"organizationEmail\", \"organizationPhone\"].forEach(\n      (n) => {\n        const key = n[0].toUpperCase() + n.slice(1);\n        $(\"referralEditor\").elements[n].value = r?.[key] || \"\";\n        $(\"referralEditor\").elements[n].disabled = viewOnly;\n      },\n    );\n    $(\"editorRecipients\").replaceChildren();\n    if (r) r.recipients.forEach(recipientEditor);\n    else recipientEditor();\n    $(\"editorAddRecipient\").hidden = !!r || viewOnly;\n    $(\"saveReferral\").hidden = viewOnly;\n    $(\"referralDialog\").showModal();\n  }\n  async function reviewReferralAddresses(r) {\n    if (readonly()) return;\n    openReferral(r, false);\n    $(\"referralHeading\").textContent = \"Review Addresses with Google\";\n    $(\"saveReferral\").textContent = \"Save Reviewed Addresses\";\n    $(\"saveReferral\").disabled = true;\n    const controls = referralAddressControls.slice();\n    const current = () => editing?.ReferralID === r.ReferralID && $(\"referralDialog\").open;\n    try {\n      for (let i = 0; i < controls.length; i++) {\n        if (!current()) return;\n        $(\"editorMessage\").textContent = \"Checking address \" + (i + 1) + \" of \" + controls.length + \"…\";\n        const ready = await controls[i].check();\n        if (!current()) return;\n        if (!ready) {\n          $(\"editorMessage\").textContent = \"Edit the address, then click Save Reviewed Addresses. Changes have not been saved yet.\";\n          return;\n        }\n      }\n      if (current()) $(\"editorMessage\").textContent =\n        \"Address checks finished. Click Save Reviewed Addresses to save your choices. Any unconfirmed address remains Address Needs Review.\";\n    } catch (error) {\n      if (current()) $(\"editorMessage\").textContent = error.message;\n      throw error;\n    } finally {\n      if (current()) $(\"saveReferral\").disabled = false;\n    }\n  }\n  function editorPayload() {\n    const f = $(\"referralEditor\"),\n      p = { eventId: dashboard.event.EventID };\n    [\"organizationName\", \"organizationEmail\", \"organizationPhone\"].forEach(\n      (n) => (p[n] = f.elements[n].value.trim()),\n    );\n    p.recipients = [...$(\"editorRecipients\").children].map((c) => {\n      const x = Object.fromEntries(\n        [...c.querySelectorAll(\"[name]\")].map((n) => [\n          n.name,\n          n.name === \"mealCount\" ? Number(n.value) : n.value.trim(),\n        ]),\n      );\n      x.addressReceipt = MealAddresses.receipt(\n        c.querySelector('[name=\"address\"]'),\n      );\n      if (editing) {\n        x.recipientId = c.dataset.recipientId;\n        x.version = Number(c.dataset.version);\n      }\n      return x;\n    });\n    if (editing) {\n      p.referralId = editing.ReferralID;\n      p.version = editing.Version;\n    } else p.submissionId = createId;\n    return p;\n  }\n  function mapsUrl(address) {\n    return /iPhone|iPad|iPod/.test(navigator.userAgent) ||\n      (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)\n      ? \"https://maps.apple.com/?daddr=\" + encodeURIComponent(address)\n      : \"https://www.google.com/maps/search/?api=1&query=\" +\n          encodeURIComponent(address);\n  }\n  function renumberRoute() {\n    let n = 0;\n    route.stops.forEach((r, i) => {\n      r.stop = i + 1;\n      n += r.meals;\n      r.runningMeals = n;\n    });\n    route.totalMeals = n;\n  }\n  function move(id, delta) {\n    const i = route.stops.findIndex((s) => s.recipientId === id),\n      j = i + delta;\n    if (j < 0 || j >= route.stops.length) return;\n    [route.stops[i], route.stops[j]] = [route.stops[j], route.stops[i]];\n    routeUnsaved = true;\n    renumberRoute();\n    renderRoute();\n  }\n  function renderRoute() {\n    if (!route) return;\n    clearDeliveryPdf();\n    $(\"routeTitle\").textContent = route.eventName + \" Delivery Route\";\n    $(\"routeDate\").textContent = dateLabel(route.deliveryDate);\n    $(\"routePickup\").textContent = \"Pickup: \" + (route.startAddress || \"Not configured\");\n    $(\"routeSummary\").textContent =\n      route.stops.length + \" Stops · \" + route.totalMeals + \" Meals\";\n    const addressesReady = !route.unresolved.length && addressReviewed(route.startAddressStatus);\n    $(\"routeStatus\").textContent = !route.stops.length\n      ? \"Approve at least one recipient to build a delivery route.\"\n      : routeUnsaved\n        ? \"Order changed. Click Save Manual Order to save your changes before printing.\"\n        : route.isFinal\n          ? \"Official delivery order saved. You can print the delivery sheet.\"\n          : addressesReady\n            ? \"All addresses are reviewed. Check the stop order, then click Save Manual Order to finalize the route and enable printing.\"\n            : \"Route is not final. \" +\n              (route.unresolved.length\n                ? route.unresolved.length + \" recipient address(es) need review. \"\n                : \"\") +\n              (!addressReviewed(route.startAddressStatus)\n                ? \"Pickup address needs review in Event Settings. \"\n                : \"\") +\n              \"Review the addresses, then click Save Manual Order to finalize the route.\";\n    $(\"printRoute\").disabled = !route.stops.length || routeUnsaved || !route.isFinal;\n    const optimizationReason = readonly()\n      ? \"This event is read-only. Reopen / Unarchive it before changing the route.\"\n      : !route.mapsEnabled\n        ? \"Automatic route optimization is off. Use Move Up / Move Down or drag stops into order, then click Save Manual Order. You can print a reviewed, saved route without automatic optimization.\"\n        : !route.stops.length\n          ? \"Approve at least one recipient before optimizing.\"\n          : !addressesReady\n            ? \"Review the pickup address and every recipient address before optimizing.\"\n            : \"Google route optimization is enabled in configuration. You may optimize or save a manual order.\";\n    $(\"routingAvailability\").textContent = optimizationReason;\n    $(\"optimizeRoute\").disabled = readonly() || !route.mapsEnabled || !route.stops.length || !addressesReady;\n    $(\"optimizeRoute\").title = optimizationReason;\n    $(\"saveRoute\").disabled = readonly() || !route.stops.length;\n    $(\"routeStops\").replaceChildren();\n    route.stops.forEach((r) => {\n      const card = el(\"article\", null, \"stop\");\n      card.dataset.recipientId = r.recipientId;\n      const head = el(\"header\");\n      head.append(\n        el(\"span\", null, \"print-check\"),\n        el(\"h3\", \"Stop \" + r.stop + \" — \" + r.recipientName),\n      );\n      card.append(head);\n      const address = el(\"p\", null, \"address\"),\n        link = el(\"a\", r.address);\n      link.href = mapsUrl(r.address);\n      link.target = \"_blank\";\n      link.rel = \"noopener noreferrer\";\n      address.append(link);\n      card.append(address);\n      const dl = el(\"dl\");\n      const pair = (k, v) => {\n        if (v) {\n          dl.append(el(\"dt\", k), el(\"dd\", String(v)));\n        }\n      };\n      pair(\"Phone:\", r.phone);\n      pair(\"Meals:\", r.meals);\n      pair(\"Running Meal Total:\", r.runningMeals);\n      pair(\"Dietary:\", r.dietaryRestrictions);\n      pair(\"Door:\", r.doorPreference);\n      pair(\"Delivery Instructions:\", r.deliveryInstructions);\n      card.append(dl);\n      if (!addressReviewed(r.addressStatus))\n        card.append(el(\"p\", \"Address Needs Review\", \"badge\"));\n      if (!readonly()) {\n        const controls = el(\"div\", null, \"actions no-print\"),\n          up = button(\"Move Up\", () => move(r.recipientId, -1), \"secondary\"),\n          down = button(\"Move Down\", () => move(r.recipientId, 1), \"secondary\");\n        up.disabled = r.stop === 1;\n        down.disabled = r.stop === route.stops.length;\n        controls.append(up, down);\n        card.append(controls);\n        card.draggable = matchMedia(\"(pointer:fine)\").matches;\n        card.addEventListener(\"dragstart\", (ev) => {\n          dragId = r.recipientId;\n          ev.dataTransfer.setData(\"text/plain\", r.recipientId);\n        });\n        card.addEventListener(\"dragover\", (ev) => ev.preventDefault());\n        card.addEventListener(\"drop\", (ev) => {\n          ev.preventDefault();\n          const i = route.stops.findIndex((x) => x.recipientId === dragId),\n            j = route.stops.findIndex((x) => x.recipientId === r.recipientId);\n          if (i < 0 || j < 0 || i === j) return;\n          const [row] = route.stops.splice(i, 1);\n          route.stops.splice(j, 0, row);\n          routeUnsaved = true;\n          renumberRoute();\n          renderRoute();\n        });\n      }\n      $(\"routeStops\").append(card);\n    });\n    if (!route.stops.length)\n      $(\"routeStops\").append(el(\"p\", \"No Approved recipients for this event.\"));\n  }\n  function renderSettings() {\n    const e = dashboard.event;\n    const values = {\n      eventName: e.EventName,\n      deliveryDate: e.DeliveryDate,\n      capacity: e.Capacity,\n      startAddress: e.StartAddress,\n      status: e.Status,\n    };\n    Object.entries(values).forEach(\n      ([k, v]) => ($(\"settingsForm\").elements[k].value = v),\n    );\n    $(\"verifyPickup\").disabled = readonly();\n    pickupSettings.reset(e.StartAddressStatus);\n    $(\"manualPickup\").disabled = readonly();\n    $(\"pickupStatus\").textContent = addressReviewed(e.StartAddressStatus)\n      ? e.StartAddressStatus === \"Manually Reviewed\"\n        ? \"Pickup address manually reviewed (Google validation not performed).\"\n        : \"Pickup address confirmed.\"\n      : \"Pickup Address Needs Review\";\n  }\n  function eventPayload(f) {\n    return {\n      addressReceipt: MealAddresses.receipt(f.elements.startAddress),\n      ...Object.fromEntries(\n        [\"eventName\", \"deliveryDate\", \"capacity\", \"startAddress\", \"status\"].map(\n          (n) => [\n            n,\n            n === \"capacity\"\n              ? Number(f.elements[n].value)\n              : f.elements[n].value.trim(),\n          ],\n        ),\n      ),\n    };\n  }\n  async function reports() {\n    const old = $(\"reportEvent\").value,\n      year = $(\"reportYear\").value;\n    $(\"reportEvent\").replaceChildren(el(\"option\", \"All events\"));\n    $(\"reportEvent\").firstChild.value = \"\";\n    events.forEach((e) => {\n      const o = el(\"option\", e.EventName + (e.Archived ? \" (Archived)\" : \"\"));\n      o.value = e.EventID;\n      $(\"reportEvent\").append(o);\n    });\n    $(\"reportEvent\").value = old;\n    const years = [...new Set(events.map((e) => e.DeliveryDate.slice(0, 4)))]\n      .sort()\n      .reverse();\n    $(\"reportYear\").replaceChildren(el(\"option\", \"All years\"));\n    $(\"reportYear\").firstChild.value = \"\";\n    years.forEach((y) => {\n      const o = el(\"option\", y);\n      o.value = y;\n      $(\"reportYear\").append(o);\n    });\n    $(\"reportYear\").value = year;\n    const r = await rpc(\"reports\", {\n      eventId: $(\"reportEvent\").value,\n      year: $(\"reportYear\").value,\n    });\n    $(\"reportIntegrityNotice\").textContent = integrityMessage(r.integrity);\n    metric($(\"reportTotals\"), [\n      [\"Events\", r.totals.events],\n      [\"Originally Requested Meals\", r.totals.originallyRequestedMeals],\n      [\"Currently Reserved Meals\", r.totals.currentlyReservedMeals],\n      [\"Approved Meals\", r.totals.approvedMeals],\n      [\"Rejected Meals\", r.totals.rejectedMeals],\n      [\"Recipient Records\", r.totals.recipientRecords],\n      [\"Approved Stops\", r.totals.approvedStops],\n      [\"Organizations\", r.totals.organizations],\n      [\"Capacity\", r.totals.capacity],\n      [\"Remaining Capacity\", r.totals.remainingCapacity],\n      [\"Pending Referrals\", r.totals.pendingReferrals],\n      [\"Approved Referrals\", r.totals.approvedReferrals],\n      [\"Rejected Referrals\", r.totals.rejectedReferrals],\n    ]);\n    $(\"organizationReports\").replaceChildren(\n      ...r.organizations.map((o) =>\n        el(\n          \"div\",\n          o.name +\n            \" — \" +\n            o.referrals +\n            \" Referrals · \" +\n            o.originallyRequestedMeals +\n            \" Originally Requested Meals · \" +\n            o.currentMeals +\n            \" Current Meals\",\n          \"report-row\",\n        ),\n      ),\n    );\n  }\n  document.querySelectorAll(\"[data-view]\").forEach((b) =>\n    b.addEventListener(\"click\", () =>\n      task(async () => {\n        view = b.dataset.view;\n        if (view !== \"routeView\") clearDeliveryPdf();\n        [\"requestsView\", \"routeView\", \"settingsView\", \"reportsView\"].forEach(\n          (id) => ($(id).hidden = id !== view),\n        );\n        document\n          .querySelectorAll(\"[data-view]\")\n          .forEach((x) => x.setAttribute(\"aria-selected\", String(x === b)));\n        if (view === \"reportsView\") await reports();\n      }),\n    ),\n  );\n  $(\"adminEvents\").addEventListener(\"change\", () => task(refresh));\n  $(\"showArchived\").addEventListener(\"change\", () =>\n    task(async () => {\n      eventOptions();\n      await refresh();\n    }),\n  );\n  $(\"refreshAdmin\").addEventListener(\"click\", () =>\n    task(() => refreshEvents()),\n  );\n  async function copyPublicLink() {\n    const input = $(\"publicLinkValue\");\n    try {\n      await navigator.clipboard.writeText(input.value);\n      $(\"publicLinkMessage\").textContent = \"Public link copied. Ready to share.\";\n    } catch (_) {\n      input.focus();\n      input.select();\n      input.setSelectionRange(0, input.value.length);\n      $(\"publicLinkMessage\").textContent = \"Automatic copying is unavailable in this browser. Copy the selected website link above.\";\n    }\n  }\n  $(\"publicLink\").addEventListener(\"click\", () =>\n    task(async () => {\n      const { url } = await rpc(\"publicFormLink\");\n      $(\"publicLinkValue\").value = url;\n      $(\"openPublicLink\").href = url;\n      $(\"publicLinkMessage\").textContent = \"\";\n      $(\"publicLinkDialog\").showModal();\n      await copyPublicLink();\n    }),\n  );\n  $(\"copyPublicLink\").addEventListener(\"click\", () => task(copyPublicLink));\n  $(\"closePublicLink\").addEventListener(\"click\", () => $(\"publicLinkDialog\").close());\n  $(\"createEvent\").addEventListener(\"click\", () => {\n    $(\"eventEditor\").reset();\n    pickupCreate.reset();\n    $(\"eventEditorMessage\").textContent = \"\";\n    $(\"eventDialog\").showModal();\n  });\n  $(\"closeEvent\").addEventListener(\"click\", () => $(\"eventDialog\").close());\n  $(\"closeReferral\").addEventListener(\"click\", () =>\n    $(\"referralDialog\").close(),\n  );\n  $(\"addReferral\").addEventListener(\"click\", () => task(async () => {\n    const pending = pendingCreates.get(\"createReferral\");\n    if (pending) {\n      const { receipt } = await rpc(\"submissionReceipt\", { submissionId: pending.id });\n      if (receipt) {\n        retainCreate(\"createReferral\", null);\n        await refreshEvents(pending.eventId);\n        alert(\"Your previous referral was saved once. Referral ID: \" + receipt.referralId);\n        return;\n      }\n    }\n    openReferral(null, false);\n    if (pending) $(\"editorMessage\").textContent = \"Previous save unconfirmed. Re-enter the same information to retry safely. Recipient details were not stored in this browser.\";\n  }));\n  $(\"editorAddRecipient\").addEventListener(\"click\", () => {\n    if ($(\"editorRecipients\").children.length < 100) recipientEditor();\n  });\n  $(\"selectAll\").addEventListener(\"click\", () => {\n    $(\"requestCards\")\n      .querySelectorAll('input[type=\"checkbox\"]')\n      .forEach(\n        (x) =>\n          (x.checked =\n            dashboard.referrals.find(\n              (r) => r.ReferralID === x.dataset.referralId,\n            )?.Status === \"Pending\"),\n      );\n  });\n  $(\"approveSelected\").addEventListener(\"click\", () =>\n    task(() => changeStatus(selectedRefs(), \"Approved\")),\n  );\n  $(\"rejectSelected\").addEventListener(\"click\", () =>\n    task(() => changeStatus(selectedRefs(), \"Rejected\")),\n  );\n  $(\"referralEditor\").addEventListener(\"submit\", (e) => {\n    e.preventDefault();\n    if (busy) return;\n    task(async () => {\n      if (!(await MealAddresses.prepareAll($(\"referralEditor\")))) return;\n      const payload = editorPayload();\n      try {\n        if (editing) await rpc(\"editReferral\", payload);\n        else await createOnce(\"createReferral\", payload);\n        $(\"referralDialog\").close();\n        await refresh();\n      } catch (err) {\n        $(\"editorMessage\").textContent = err.message;\n        throw err;\n      }\n    }, e.submitter || e.target.querySelector('button[type=\"submit\"]'));\n  });\n  $(\"eventEditor\").addEventListener(\"submit\", (e) => {\n    e.preventDefault();\n    task(async () => {\n      try {\n        if (!(await MealAddresses.prepareAll($(\"eventEditor\")))) return;\n        const event = await createOnce(\"saveEvent\", eventPayload($(\"eventEditor\")));\n        $(\"eventDialog\").close();\n        await refreshEvents(event.EventID);\n      } catch (err) {\n        $(\"eventEditorMessage\").textContent = err.message;\n        throw err;\n      }\n    }, e.submitter || e.target.querySelector('button[type=\"submit\"]'));\n  });\n  $(\"settingsForm\").addEventListener(\"submit\", (e) => {\n    e.preventDefault();\n    task(async () => {\n      const d = dashboard.event;\n      if (!(await MealAddresses.prepareAll($(\"settingsForm\")))) return;\n      await rpc(\"saveEvent\", {\n        ...eventPayload($(\"settingsForm\")),\n        eventId: d.EventID,\n        version: d.Version,\n      });\n      await refreshEvents(d.EventID);\n    }, e.submitter || e.target.querySelector('button[type=\"submit\"]'));\n  });\n  $(\"archiveEvent\").addEventListener(\"click\", () =>\n    task(async () => {\n      if (\n        !confirm(\n          \"Archive this event? Its records will remain available in Reports.\",\n        )\n      )\n        return;\n      await rpc(\"archive\", {\n        eventId: dashboard.event.EventID,\n        version: dashboard.event.Version,\n        mode: \"archive\",\n        confirmed: true,\n      });\n      dashboard = null;\n      await refreshEvents();\n    }),\n  );\n  $(\"reopenEvent\").addEventListener(\"click\", () =>\n    task(async () => {\n      if (\n        !confirm(\n          \"Reopen / Unarchive this event for corrections? This action will be audit logged.\",\n        )\n      )\n        return;\n      const id = dashboard.event.EventID;\n      await rpc(\"archive\", {\n        eventId: id,\n        version: dashboard.event.Version,\n        mode: \"reopen\",\n        confirmed: true,\n      });\n      await refreshEvents(id);\n    }),\n  );\n  $(\"manualPickup\").addEventListener(\"click\", () => {\n    if (\n      !confirm(\n        \"Have you checked the SAVED pickup address and confirmed it is usable? This is manual review, not Google validation.\",\n      )\n    )\n      return;\n    task(async () => {\n      await rpc(\"manualAddressReview\", {\n        entity: \"event\",\n        eventId: dashboard.event.EventID,\n        version: dashboard.event.Version,\n        confirmed: true,\n      });\n      await refresh();\n    });\n  });\n  $(\"verifyPickup\").addEventListener(\"click\", () =>\n    task(() => pickupSettings.check()),\n  );\n  $(\"optimizeRoute\").addEventListener(\"click\", () =>\n    task(async () => {\n      route = await rpc(\"optimize\", {\n        eventId: route.eventId,\n        routeVersion: route.version,\n      });\n      await refresh();\n    }),\n  );\n  $(\"saveRoute\").addEventListener(\"click\", () =>\n    task(async () => {\n      route = await rpc(\"reorder\", {\n        eventId: route.eventId,\n        routeVersion: route.version,\n        recipientIds: route.stops.map((r) => r.recipientId),\n      });\n      routeUnsaved = false;\n      renderRoute();\n    }),\n  );\n  function clearDeliveryPdf() {\n    if (deliveryPdfUrl) URL.revokeObjectURL(deliveryPdfUrl);\n    deliveryPdfUrl = null;\n    $(\"openDeliveryPdf\").removeAttribute(\"href\");\n    $(\"downloadDeliveryPdf\").removeAttribute(\"href\");\n    $(\"deliveryPdf\").hidden = true;\n  }\n  $(\"printRoute\").addEventListener(\"click\", () => task(async () => {\n    if (!route || routeUnsaved || !route.isFinal || !route.stops.length) return;\n    clearDeliveryPdf();\n    try {\n      const pdf = await rpc(\"deliveryPdf\", { eventId: route.eventId, routeVersion: route.version });\n      const bytes = Uint8Array.from(atob(pdf.base64), (c) => c.charCodeAt(0));\n      deliveryPdfUrl = URL.createObjectURL(new Blob([bytes], { type: \"application/pdf\" }));\n      $(\"openDeliveryPdf\").href = deliveryPdfUrl;\n      $(\"downloadDeliveryPdf\").href = deliveryPdfUrl;\n      $(\"downloadDeliveryPdf\").download = pdf.filename;\n      $(\"deliveryPdf\").hidden = false;\n      $(\"openDeliveryPdf\").focus();\n    } catch (error) {\n      if (error.code === \"CONFLICT\") await refresh();\n      throw error;\n    }\n  }));\n  window.addEventListener(\"pagehide\", clearDeliveryPdf);\n  [\"reportEvent\", \"reportYear\"].forEach((id) =>\n    $(id).addEventListener(\"change\", () => task(reports)),\n  );\n  task(async () => {\n    const identity = await rpc(\"identity\");\n    $(\"adminIdentity\").textContent =\n      identity.email + \" · \" + identity.environment;\n    await refreshEvents();\n  });\n})();\n\n    </script>\n  </body>\n</html>\n";

// ===== Validation.gs =====
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

// ===== Store.gs =====
const MEAL_SCHEMA = Object.freeze({
  EVENTS: [
    "EventID",
    "EventName",
    "DeliveryDate",
    "Capacity",
    "StartAddress",
    "Status",
    "Archived",
    "ArchivedDate",
    "CreatedAt",
    "UpdatedAt",
    "Version",
    "RouteVersion",
    "RouteNeedsReview",
    "StartAddressStatus",
  ],
  REFERRALS: [
    "ReferralID",
    "EventID",
    "OrganizationName",
    "OrganizationKey",
    "OrganizationEmail",
    "OrganizationPhone",
    "Status",
    "SubmittedAt",
    "UpdatedAt",
    "SubmittedByAdmin",
    "OriginalRequestedMeals",
    "OriginalRecipientCount",
    "Version",
  ],
  RECIPIENTS: [
    "RecipientID",
    "ReferralID",
    "EventID",
    "RecipientName",
    "Address",
    "NormalizedAddress",
    "Phone",
    "MealCount",
    "DietaryRestrictions",
    "DoorPreference",
    "DeliveryInstructions",
    "Notes",
    "DuplicateFlag",
    "RoutePosition",
    "CreatedAt",
    "UpdatedAt",
    "Version",
    "AddressStatus",
    "VerifiedAt",
  ],
  AUDITLOG: [
    "AuditID",
    "Timestamp",
    "Admin",
    "Action",
    "EntityType",
    "EntityID",
    "OldValue",
    "NewValue",
  ],
  ADMINUSERS: ["Email", "Active", "Role"],
  SUBMISSIONS: [
    "SubmissionID",
    "Fingerprint",
    "ReferralID",
    "Receipt",
    "CreatedAt",
  ],
});
const ID_FIELDS = {
  EVENTS: "EventID",
  REFERRALS: "ReferralID",
  RECIPIENTS: "RecipientID",
  AUDITLOG: "AuditID",
  ADMINUSERS: "Email",
  SUBMISSIONS: "SubmissionID",
};
function properties_() {
  return PropertiesService.getScriptProperties();
}
function database_() {
  const p = properties_();
  const id = p.getProperty("MEALS_SPREADSHEET_ID");
  if (!id) fail_("CONFIG", "The meal program is not configured yet.");
  const env = p.getProperty("MEALS_ENV");
  if (!["development", "production"].includes(env))
    fail_("CONFIG", "Set the backend environment before use.");
  if (
    env === "production" &&
    p.getProperty("MEALS_PRODUCTION_ENABLED") !== "true"
  )
    fail_("CONFIG", "Production writes have not been enabled.");
  if (
    env === "development" &&
    id === "1qqXeHVIi5WMqtXMSIYtB9iuV0gPfy_QdGUgLlv8BD2w" &&
    p.getProperty("MEALS_SHARED_SHEET_DEV_ID") !== id
  )
    fail_(
      "CONFIG",
      "Shared-spreadsheet development requires explicit backend configuration.",
    );
  return SpreadsheetApp.openById(id);
}
function load_() {
  const db = database_();
  const state = {};
  const meta = {};
  Object.keys(MEAL_SCHEMA).forEach((name) => {
    const sheet = db.getSheetByName(name);
    if (!sheet) fail_("SCHEMA", "Backend setup is incomplete.");
    const headers = MEAL_SCHEMA[name];
    const raw = sheet
      .getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length)
      .getValues();
    if (JSON.stringify(raw[0]) !== JSON.stringify(headers))
      fail_(
        "SCHEMA",
        "Schema mismatch in " + name + ". No changes were saved.",
      );
    const used = new Set();
    const rows = [];
    const positions = {};
    raw.slice(1).forEach((r, i) => {
      if (r.every((v) => v === "")) return;
      const obj = {};
      headers.forEach((h, j) => (obj[h] = r[j]));
      const key = String(obj[ID_FIELDS[name]]);
      if (!key || used.has(key))
        fail_("SCHEMA", "Invalid or duplicate permanent ID in " + name + ".");
      used.add(key);
      rows.push(obj);
      positions[key] = i + 1;
    });
    state[name] = rows;
    meta[name] = {
      sheetId: sheet.getSheetId(),
      positions,
      lastRow: raw.length,
      original: JSON.stringify(rows),
    };
  });
  Object.defineProperty(state, "_meta", { value: meta });
  Object.defineProperty(state, "_db", { value: db.getId() });
  return state;
}
function cell_(v) {
  if (typeof v === "number") return { userEnteredValue: { numberValue: v } };
  if (typeof v === "boolean") return { userEnteredValue: { boolValue: v } };
  return { userEnteredValue: { stringValue: String(v == null ? "" : v) } };
}
// Historical orphan rows are preserved. Only correctly linked recipients are
// included in referral accounting; administrators see the excluded totals.
function linkedRecipients_(s) {
  const events = new Set(s.EVENTS.map(e => e.EventID));
  const parents = new Map(s.REFERRALS.map(r => [r.ReferralID, r]));
  return s.RECIPIENTS.filter(r => {
    const parent = parents.get(r.ReferralID);
    return parent && parent.EventID === r.EventID && events.has(r.EventID);
  });
}
function relationshipIssues_(s, eventIds) {
  const ids = new Set(eventIds);
  const linked = new Set(linkedRecipients_(s).map(r => r.RecipientID));
  const excluded = s.RECIPIENTS.filter(r => ids.has(r.EventID) && !linked.has(r.RecipientID));
  const affected = new Set(excluded.map(r => r.ReferralID));
  return {
    recipientRecords: excluded.length,
    mealQuantities: excluded.reduce((n, r) => n + (Number(r.MealCount) || 0), 0),
    submissionRecords: s.SUBMISSIONS.filter(r => affected.has(r.ReferralID)).length,
  };
}
function submissionReferral_(s, record) {
  const parent = s.REFERRALS.find(r => r.ReferralID === record.ReferralID);
  const children = s.RECIPIENTS.filter(r => r.ReferralID === record.ReferralID);
  if (!parent || !s.EVENTS.some(e => e.EventID === parent.EventID) ||
      !["Pending", "Approved", "Rejected"].includes(parent.Status) ||
      !children.length || children.length !== Number(parent.OriginalRecipientCount) ||
      children.some(r => r.EventID !== parent.EventID ||
        !Number.isSafeInteger(Number(r.MealCount)) || Number(r.MealCount) < 1))
    fail_("INTEGRITY", "This saved request needs administrator review. Please contact the meal program before submitting it again.");
  return parent;
}
function savedSubmissionReceipt_(s, record) {
  const parent = submissionReferral_(s, record);
  let receipt;
  try { receipt = JSON.parse(record.Receipt); } catch (_) {}
  if (!receipt || receipt.referralId !== parent.ReferralID ||
      receipt.meals !== Number(parent.OriginalRequestedMeals) ||
      receipt.recipients !== Number(parent.OriginalRecipientCount) ||
      typeof receipt.eventName !== "string" || receipt.status !== "Pending")
    fail_("INTEGRITY", "This saved request needs administrator review. Please contact the meal program before submitting it again.");
  return receipt;
}
function commit_(s) {
  const requests = [];
  Object.keys(MEAL_SCHEMA).forEach((name) => {
    const m = s._meta[name];
    const previous = JSON.parse(m.original);
    const originals = new Map(
      previous.map((r) => [String(r[ID_FIELDS[name]]), r]),
    );
    const added = [];
    s[name].forEach((row) => {
      const key = String(row[ID_FIELDS[name]]);
      const old = originals.get(key);
      // Reject newly introduced broken relationships without modifying or
      // blocking unchanged historical orphan rows during normal operations.
      if (name === "RECIPIENTS" && (!old || old.ReferralID !== row.ReferralID || old.EventID !== row.EventID)) {
        const parent = s.REFERRALS.find(r => r.ReferralID === row.ReferralID);
        if (!parent || parent.EventID !== row.EventID || !s.EVENTS.some(e => e.EventID === row.EventID))
          fail_("INTEGRITY", "Recipient records must belong to a saved referral and meal event.");
      }
      if (name === "REFERRALS" && (!old || old.EventID !== row.EventID) &&
          !s.EVENTS.some(e => e.EventID === row.EventID))
        fail_("INTEGRITY", "Referral records must belong to a saved meal event.");
      if (name === "SUBMISSIONS" && (!old || old.ReferralID !== row.ReferralID))
        savedSubmissionReceipt_(s, row);
      if (!old) added.push(row);
      else {
        originals.delete(key);
        if (JSON.stringify(row) !== JSON.stringify(old))
          requests.push({
            updateCells: {
              range: {
                sheetId: m.sheetId,
                startRowIndex: m.positions[key],
                endRowIndex: m.positions[key] + 1,
                startColumnIndex: 0,
                endColumnIndex: MEAL_SCHEMA[name].length,
              },
              rows: [{ values: MEAL_SCHEMA[name].map((h) => cell_(row[h])) }],
              fields: "userEnteredValue",
            },
          });
      }
    });
    if (originals.size) fail_("INTEGRITY", "Record deletion is not supported.");
    if (added.length)
      requests.push({
        appendCells: {
          sheetId: m.sheetId,
          rows: added.map((row) => ({
            values: MEAL_SCHEMA[name].map((h) => cell_(row[h])),
          })),
          fields: "userEnteredValue",
        },
      });
  });
  if (requests.length) Sheets.Spreadsheets.batchUpdate({ requests }, s._db);
}
function locked_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000))
    fail_(
      "BUSY",
      "The system is busy. Please try again using the same submission.",
    );
  try {
    const s = load_();
    const value = fn(s);
    commit_(s);
    return value;
  } finally {
    lock.releaseLock();
  }
}
function byId_(s, name, id) {
  const row = s[name].find((r) => String(r[ID_FIELDS[name]]) === String(id));
  if (!row) fail_("NOT_FOUND", "That record could not be found.");
  return row;
}
function version_(row, v) {
  if (Number(row.Version) !== Number(v))
    fail_(
      "CONFLICT",
      "This record changed since you opened it. Refresh before saving.",
    );
}
function touch_(row) {
  row.Version = Number(row.Version) + 1;
  row.UpdatedAt = now_();
}

// ===== Auth.gs =====
function identity_() {
  const active = String(Session.getActiveUser().getEmail() || "").toLowerCase();
  const effective = String(
    Session.getEffectiveUser().getEmail() || "",
  ).toLowerCase();
  if (!active || active !== effective)
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

// ===== Audit.gs =====
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

// ===== Events.gs =====
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

// ===== Duplicates.gs =====
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

// ===== Referrals.gs =====
function referralMeals_(s, id) {
  return linkedRecipients_(s).filter((r) => r.ReferralID === id).reduce(
    (n, r) => n + Number(r.MealCount),
    0,
  );
}
function submit_(p, adminEmail) {
  const canonical = canonicalSubmission_(p, Boolean(adminEmail)),
    submissionId = submissionId_(p.submissionId),
    hash = fingerprint_(canonical);
  return locked_((s) => {
    if (adminEmail) {
      if (admin_(s) !== adminEmail)
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
function statuses_(s, p, admin) {
  if (!["Pending", "Approved", "Rejected"].includes(p.status))
    fail_("INVALID", "Please check referral status.");
  if (
    !Array.isArray(p.referrals) ||
    !p.referrals.length ||
    p.referrals.length > 200
  )
    fail_("INVALID", "Select up to 200 referrals.");
  const seen = new Set();
  const rows = p.referrals.map((x) => {
    const id = id_(x.referralId);
    if (seen.has(id)) fail_("INVALID", "Select each referral once.");
    seen.add(id);
    const r = byId_(s, "REFERRALS", id);
    version_(r, x.version);
    editable_(byId_(s, "EVENTS", r.EventID));
    return r;
  });
  const needed = {};
  rows.forEach((r) => {
    if (r.Status === "Rejected" && p.status !== "Rejected")
      needed[r.EventID] =
        (needed[r.EventID] || 0) + referralMeals_(s, r.ReferralID);
  });
  Object.keys(needed).forEach((id) => {
    if (needed[id] > available_(s, byId_(s, "EVENTS", id)))
      fail_(
        "CAPACITY",
        "There are not enough meals available to restore the selected referrals.",
      );
  });
  rows.forEach((r) => {
    const old = r.Status;
    if (old === p.status) return;
    r.Status = p.status;
    touch_(r);
    const e = byId_(s, "EVENTS", r.EventID);
    if (old === "Approved" || p.status === "Approved") routeDirty_(e);
    audit_(
      s,
      admin,
      "Referral " + (p.status === "Pending" ? "Returned to Pending" : p.status),
      "Referral",
      r.ReferralID,
      old,
      p.status,
    );
  });
  return { updated: rows.length };
}
function editReferral_(s, p, admin) {
  const r = byId_(s, "REFERRALS", p.referralId),
    e = byId_(s, "EVENTS", r.EventID);
  editable_(e);
  version_(r, p.version);
  const org = organization_(p),
    input = recipients_(p.recipients, true),
    existing = s.RECIPIENTS.filter((x) => x.ReferralID === r.ReferralID);
  if (p.recipients.length !== existing.length)
    fail_(
      "INVALID",
      "Use Add Referral to create additional recipient records. Existing recipients cannot be removed.",
    );
  const unique = new Set();
  p.recipients.forEach((x) => {
    const old = existing.find((y) => y.RecipientID === x.recipientId);
    if (!old || unique.has(x.recipientId))
      fail_("INVALID", "Recipient IDs do not match this referral.");
    unique.add(x.recipientId);
    version_(old, x.version);
  });
  const oldMeals = referralMeals_(s, r.ReferralID),
    newMeals = input.reduce((n, x) => n + x.MealCount, 0);
  if (
    ["Pending", "Approved"].includes(r.Status) &&
    newMeals - oldMeals > available_(s, e)
  )
    fail_("CAPACITY", "There are not enough meals available for this edit.");
  const oldOrg = {
    OrganizationName: r.OrganizationName,
    OrganizationEmail: r.OrganizationEmail,
    OrganizationPhone: r.OrganizationPhone,
  };
  Object.assign(r, org);
  touch_(r);
  audit_(s, admin, "Referral Edited", "Referral", r.ReferralID, oldOrg, org);
  input.forEach((x, i) => {
    const old = existing.find(
      (y) => y.RecipientID === p.recipients[i].recipientId,
    );
    const previous = Object.assign({}, old);
    if (old.Address !== x.Address) {
      old.AddressStatus = "Needs Review";
      old.VerifiedAt = "";
    }
    if (p.recipients[i].addressReceipt) {
      old.AddressStatus = addressProofStatus_(
        x.Address,
        p.recipients[i].addressReceipt,
      );
      old.VerifiedAt = old.AddressStatus === "Confirmed" ? now_() : "";
    }
    Object.assign(old, x);
    touch_(old);
    audit_(
      s,
      admin,
      "Recipient Edited",
      "Recipient",
      old.RecipientID,
      previous,
      old,
    );
  });
  if (r.Status === "Approved") routeDirty_(e);
  refreshDuplicates_(s, e.EventID);
  return { referralId: r.ReferralID };
}

// ===== Reports.gs =====
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

// ===== Addresses.gs =====
function mapsEnabled_() {
  if (properties_().getProperty("MEALS_MAPS_LIVE_ENABLED") !== "true")
    fail_(
      "API_DISABLED",
      "Live Maps APIs are disabled. Separate billing/API approval and configuration are required.",
    );
}
function addressLookup_(address) {
  mapsEnabled_();
  const key = properties_().getProperty("MEALS_ADDRESS_API_KEY");
  if (!key) fail_("CONFIG", "Address Validation is not configured.");
  mapsUsage_("validation", 1);
  const response = UrlFetchApp.fetch(
    "https://addressvalidation.googleapis.com/v1:validateAddress",
    {
      method: "post",
      contentType: "application/json",
      headers: { "X-Goog-Api-Key": key },
      payload: JSON.stringify({
        address: { regionCode: "US", addressLines: [address] },
      }),
      muteHttpExceptions: true,
    },
  );
  if (response.getResponseCode() !== 200)
    fail_("MAPS", "This address could not be confirmed. Please review it.");
  const result = JSON.parse(response.getContentText()).result || {},
    v = result.verdict || {},
    geo = result.geocode || {};
  const confirmed =
    v.addressComplete === true &&
    !v.hasUnconfirmedComponents &&
    !v.hasInferredComponents &&
    !v.hasReplacedComponents &&
    ["PREMISE", "SUB_PREMISE"].includes(v.validationGranularity) &&
    geo.location;
  return {
    confirmed: Boolean(confirmed),
    latitude: confirmed ? geo.location.latitude : "",
    longitude: confirmed ? geo.location.longitude : "",
  };
}
function verifyAddress_(p) {
  const a = requireAdmin_(),
    isStart = p.entity === "event",
    r = byId_(
      a.state,
      isStart ? "EVENTS" : "RECIPIENTS",
      isStart ? p.eventId : p.recipientId,
    ),
    e = isStart ? r : byId_(a.state, "EVENTS", r.EventID);
  editable_(e);
  version_(r, p.version);
  const address = isStart ? r.StartAddress : r.Address;
  const lookup = addressLookup_(address);
  return locked_((s) => {
    const admin = admin_(s),
      row = byId_(
        s,
        isStart ? "EVENTS" : "RECIPIENTS",
        isStart ? p.eventId : p.recipientId,
      ),
      event = isStart ? row : byId_(s, "EVENTS", row.EventID);
    editable_(event);
    version_(row, p.version);
    const old = isStart ? row.StartAddressStatus : row.AddressStatus;
    if (isStart) {
      row.StartAddressStatus = lookup.confirmed ? "Confirmed" : "Needs Review";
    } else {
      row.AddressStatus = lookup.confirmed ? "Confirmed" : "Needs Review";
      row.VerifiedAt = now_();
    }
    touch_(row);
    routeDirty_(event);
    audit_(
      s,
      admin,
      "Address Reviewed",
      isStart ? "Event" : "Recipient",
      isStart ? row.EventID : row.RecipientID,
      old,
      lookup.confirmed ? "Confirmed" : "Needs Review",
    );
    return {
      confirmed: lookup.confirmed,
      message: lookup.confirmed ? "Address confirmed." : "Address Needs Review",
    };
  });
}
// Reserve usage before the external call; failed calls count conservatively.
// No names, addresses or credentials are included in counters.
// Address budgets use Pacific calendar dates. Keep existing counters on installation.
// Application limits do not cap calls made outside this Apps Script project.
function mapsUsage_(kind, units) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000))
    fail_("BUSY", "The system is busy. Try again shortly.");
  try {
    const p = properties_(),
      date = Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd"),
      month = date.slice(0, 7);
    let daily, monthly;
    try {
      daily = JSON.parse(p.getProperty("MEALS_MAPS_USAGE_DAY") || "{}");
      monthly = JSON.parse(p.getProperty("MEALS_MAPS_USAGE_MONTH") || "{}");
    } catch (_) {
      fail_("CONFIG", "Maps usage counters need administrator review.");
    }
    if (daily.date !== date) daily = { date, validation: 0, optimization: 0 };
    if (monthly.month !== month)
      monthly = { month, validation: 0, optimization: 0 };
    const dailyLimit =
        kind === "autocomplete" ? 1500 : kind === "validation" ? 800 : 500,
      monthLimit = kind === "autocomplete" ? 10000 : kind === "validation" ? 800 : 3000;
    if (
      (daily[kind] || 0) + units > dailyLimit ||
      (monthly[kind] || 0) + units > monthLimit
    )
      fail_(
        "API_QUOTA",
        "The configured Maps usage limit has been reached. No additional API call was made.",
      );
    if (kind !== "optimization") {
      const minuteKey = Math.floor(Date.now() / 60000);
      let minute;
      try {
        minute = JSON.parse(
          p.getProperty("MEALS_ADDRESS_USAGE_MINUTE") || "{}",
        );
      } catch (_) {
        fail_("CONFIG", "Address usage counters need administrator review.");
      }
      if (minute.time !== minuteKey) minute = { time: minuteKey };
      if ((minute[kind] || 0) + units > (kind === "autocomplete" ? 60 : 20))
        fail_(
          "API_QUOTA",
          "Address checking is busy. Keep the address or try again shortly.",
        );
      minute[kind] = (minute[kind] || 0) + units;
      p.setProperty("MEALS_ADDRESS_USAGE_MINUTE", JSON.stringify(minute));
    }
    daily[kind] = (daily[kind] || 0) + units;
    monthly[kind] = (monthly[kind] || 0) + units;
    p.setProperty("MEALS_MAPS_USAGE_DAY", JSON.stringify(daily));
    p.setProperty("MEALS_MAPS_USAGE_MONTH", JSON.stringify(monthly));
  } finally {
    lock.releaseLock();
  }
}

// Manual review is an explicit admin attestation, never a Google geocode result.
function addressReviewed_(status) {
  return status === "Confirmed" || status === "Manually Reviewed";
}
function manualAddressReview_(s, p, admin) {
  if (p.confirmed !== true)
    fail_(
      "CONFIRM",
      "Confirm that you checked the saved address before marking it reviewed.",
    );
  if (!["event", "recipient"].includes(p.entity))
    fail_("INVALID", "Please select an address to review.");
  const isStart = p.entity === "event",
    row = byId_(
      s,
      isStart ? "EVENTS" : "RECIPIENTS",
      isStart ? p.eventId : p.recipientId,
    ),
    event = isStart ? row : byId_(s, "EVENTS", row.EventID);
  editable_(event);
  version_(row, p.version);
  const old = isStart ? row.StartAddressStatus : row.AddressStatus;
  if (isStart) row.StartAddressStatus = "Manually Reviewed";
  else {
    row.AddressStatus = "Manually Reviewed";
    row.VerifiedAt = now_();
  }
  touch_(row);
  routeDirty_(event);
  audit_(
    s,
    admin,
    "Address Manually Reviewed",
    isStart ? "Event" : "Recipient",
    isStart ? row.EventID : row.RecipientID,
    old,
    "Manually Reviewed",
  );
  return {
    reviewed: true,
    message:
      "Saved address manually reviewed; Google validation was not performed.",
  };
}

// ===== AddressEntry.gs =====
// Places API (New), separate from the route optimization feature flag.
function addressFeatures_() {
  const p = properties_();
  return {
    autocomplete:
      p.getProperty("MEALS_ADDRESS_AUTOCOMPLETE_ENABLED") === "true",
    validation: p.getProperty("MEALS_ADDRESS_VALIDATION_ENABLED") === "true",
  };
}
function addressSession_(p) {
  const token = text_(p.sessionToken, "address session", 36, false);
  if (token && !/^[a-zA-Z0-9_-]{1,36}$/.test(token))
    fail_("INVALID", "Please restart the address search.");
  return token;
}
function addressServiceRequest_(url, key, payload, mask) {
  if (!key) fail_("CONFIG", "Address services are not configured.");
  const headers = { "X-Goog-Api-Key": key };
  if (mask) headers["X-Goog-FieldMask"] = mask;
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200)
    fail_(
      "ADDRESS_UNAVAILABLE",
      "Address checking is unavailable. You can keep the address for administrator review.",
    );
  return JSON.parse(res.getContentText());
}
function addressSuggestions_(p) {
  if (!addressFeatures_().autocomplete)
    fail_("API_DISABLED", "Address suggestions are currently disabled.");
  const input = text_(p.address, "address", 500, true);
  if (input.length < 4) return { suggestions: [] };
  const token = addressSession_(p);
  if (!token) fail_("INVALID", "An address session is required.");
  mapsUsage_("autocomplete", 1);
  const result = addressServiceRequest_(
    "https://places.googleapis.com/v1/places:autocomplete",
    properties_().getProperty("MEALS_PLACES_API_KEY"),
    {
      input,
      sessionToken: token,
      includedRegionCodes: ["us"],
      languageCode: "en",
      includeQueryPredictions: false,
    },
    "suggestions.placePrediction.text.text,suggestions.placePrediction.placeId",
  );
  return {
    suggestions: (result.suggestions || [])
      .slice(0, 5)
      .filter((x) => x.placePrediction && x.placePrediction.text)
      .map((x) => ({
        address: text_(x.placePrediction.text.text, "suggestion", 500, true),
      })),
  };
}
function addressUnits_(address) {
  return (
    String(address).match(
      /(?:\b(?:apartment|apt|suite|ste|unit|floor|fl|building|bldg|room|rm)\.?\s*|#\s*)[a-z0-9][a-z0-9 -]*/gi,
    ) || []
  )
    .map((x) => addressKey_(x).replace(/\bste\b/g, "unit"))
    .sort();
}
function sameAddress_(a, b) {
  const clean = (x) =>
    addressKey_(x)
      .replace(/\b(?:usa|united states)\b/g, "")
      .trim()
      .replace(/\s+/g, " ");
  return clean(a) === clean(b);
}
function preserveAddressUnits_(original, recommended) {
  // Conservative: a missing or changed unit is never accepted silently.
  const units = addressUnits_(original),
    next = addressUnits_(recommended);
  const changed =
    units.length > 0 && JSON.stringify(units) !== JSON.stringify(next);
  if (!changed) return { address: recommended, unitIssue: false };
  const parts =
    String(original).match(
      /(?:\b(?:apartment|apt|suite|ste|unit|floor|fl|building|bldg|room|rm)\.?\s*|#\s*)[a-z0-9][a-z0-9 -]*/gi,
    ) || [];
  // Conflicting units: retain the original address rather than inventing a combination.
  return {
    address: next.length ? original : recommended + ", " + parts.join(", "),
    unitIssue: true,
  };
}
function addressReceipt_(address, status) {
  const props = properties_();
  let secret = props.getProperty("MEALS_ADDRESS_RECEIPT_SECRET");
  if (!secret) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000))
      fail_("BUSY", "Please try the address check again.");
    try {
      secret = props.getProperty("MEALS_ADDRESS_RECEIPT_SECRET");
      if (!secret) {
        secret = uuid_() + uuid_();
        props.setProperty("MEALS_ADDRESS_RECEIPT_SECRET", secret);
      }
    } finally {
      lock.releaseLock();
    }
  }
  // Only a hash is returned, never a name or an address inside this receipt.
  const body = Utilities.base64EncodeWebSafe(
    JSON.stringify({
      hash: fingerprint_(address),
      status,
      expires: Date.now() + 7200000,
    }),
  );
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(body, secret),
  );
  return body + "." + sig;
}
function addressProofStatus_(address, receipt) {
  if (typeof receipt !== "string" || receipt.length > 1000)
    return "Needs Review";
  const secret = properties_().getProperty("MEALS_ADDRESS_RECEIPT_SECRET");
  if (!secret) return "Needs Review";
  try {
    const parts = receipt.split(".");
    if (parts.length !== 2) return "Needs Review";
    const expected = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(parts[0], secret),
    );
    let diff = expected.length ^ parts[1].length;
    for (let i = 0; i < expected.length; i++)
      diff |= expected.charCodeAt(i) ^ (parts[1].charCodeAt(i) || 0);
    if (diff) return "Needs Review";
    const data = JSON.parse(
      Utilities.newBlob(
        Utilities.base64DecodeWebSafe(parts[0]),
      ).getDataAsString(),
    );
    return data.hash === fingerprint_(address) &&
      data.expires > Date.now() &&
      data.status === "Confirmed"
      ? "Confirmed"
      : "Needs Review";
  } catch (_) {
    return "Needs Review";
  }
}
function addressPreview_(p) {
  if (!addressFeatures_().validation)
    fail_(
      "API_DISABLED",
      "Address validation is currently disabled. You can keep the address for administrator review.",
    );
  const original = text_(p.address, "address", 500, true);
  const candidate = text_(
    p.candidate || original,
    "selected address",
    500,
    true,
  );
  const before = preserveAddressUnits_(original, candidate);
  const body = {
    address: { regionCode: "US", addressLines: [before.address] },
  };
  const token = addressSession_(p);
  if (token) body.sessionToken = token;
  mapsUsage_("validation", 1);
  const response = addressServiceRequest_(
    "https://addressvalidation.googleapis.com/v1:validateAddress",
    properties_().getProperty("MEALS_ADDRESS_API_KEY"),
    body,
  );
  const result = response.result || {},
    v = result.verdict || {},
    a = result.address || {};
  const safe = preserveAddressUnits_(
    original,
    text_(
      a.formattedAddress || before.address,
      "recommended address",
      500,
      true,
    ),
  );
  const unitIssue =
    safe.unitIssue ||
    (before.unitIssue && addressUnits_(safe.address).length === 0);
  const confident =
    v.addressComplete === true &&
    !v.hasUnconfirmedComponents &&
    ["PREMISE", "SUB_PREMISE"].includes(v.validationGranularity) &&
    !(a.missingComponentTypes || []).length &&
    !(a.unresolvedTokens || []).length &&
    !(a.addressComponents || []).some(
      (c) =>
        c.unexpected || c.confirmationLevel === "UNCONFIRMED_AND_SUSPICIOUS",
    ) &&
    !unitIssue &&
    (!addressUnits_(original).length ||
      v.validationGranularity === "SUB_PREMISE");
  const equivalent =
    sameAddress_(original, safe.address) &&
    !v.hasReplacedComponents &&
    !v.hasInferredComponents;
  return {
    original,
    recommended: safe.address,
    confident,
    equivalent,
    unitIssue,
    originalReceipt: addressReceipt_(
      original,
      confident && equivalent ? "Confirmed" : "Needs Review",
    ),
    recommendedReceipt: addressReceipt_(
      safe.address,
      confident ? "Confirmed" : "Needs Review",
    ),
  };
}
function publicAddressCall_(action, p) {
  if (action === "addressConfig") return addressFeatures_();
  // Public callers cannot use this interface to read saved addresses or recipients.
  const s = load_(),
    e = byId_(s, "EVENTS", id_(p.eventId));
  if (!acceptsPublicReferrals_(e) || available_(s, e) <= 0)
    fail_("CLOSED", "This event is no longer accepting requests.");
  if (action === "addressSuggestions") return addressSuggestions_(p);
  if (action === "addressPreview") return addressPreview_(p);
  fail_("FORBIDDEN", "This public operation is unavailable.");
}

// ===== Routing.gs =====
function approvedStops_(s, eventId) {
  const ids = new Set(
    s.REFERRALS.filter(
      (r) => r.EventID === eventId && r.Status === "Approved",
    ).map((r) => r.ReferralID),
  );
  return s.RECIPIENTS.filter(
    (r) => r.EventID === eventId && ids.has(r.ReferralID),
  );
}
function route_(s, eventId) {
  const e = byId_(s, "EVENTS", eventId);
  const rows = approvedStops_(s, eventId).sort(
    (a, b) =>
      (Number(a.RoutePosition) || 1e9) - (Number(b.RoutePosition) || 1e9) ||
      a.CreatedAt.localeCompare(b.CreatedAt) ||
      a.RecipientID.localeCompare(b.RecipientID),
  );
  let running = 0;
  const stops = rows.map((r, i) => ({
    recipientId: r.RecipientID,
    stop: i + 1,
    recipientName: r.RecipientName,
    address: r.Address,
    phone: r.Phone,
    meals: Number(r.MealCount),
    runningMeals: (running += Number(r.MealCount)),
    dietaryRestrictions: r.DietaryRestrictions,
    doorPreference: r.DoorPreference,
    deliveryInstructions: r.DeliveryInstructions,
    addressStatus: r.AddressStatus,
  }));
  const unresolved = stops.filter((r) => !addressReviewed_(r.addressStatus));
  return {
    eventId: e.EventID,
    eventName: e.EventName,
    deliveryDate: e.DeliveryDate,
    startAddress: e.StartAddress,
    startAddressStatus: e.StartAddressStatus,
    version: Number(e.RouteVersion),
    readOnly: e.Archived === true || e.Status === "Completed",
    needsReview: Boolean(e.RouteNeedsReview),
    mapsEnabled:
      properties_().getProperty("MEALS_MAPS_LIVE_ENABLED") === "true",
    isFinal:
      !e.RouteNeedsReview &&
      addressReviewed_(e.StartAddressStatus) &&
      !unresolved.length,
    unresolved,
    stops,
    totalMeals: running,
  };
}
function deliverySheetHtml_(route) {
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
  const detail = (label, value) =>
    value ? `<p><strong>${label}</strong> ${escape(value)}</p>` : "";
  const stops = route.stops.map((r) => `
    <section class="stop">
      <h2><span class="check"></span>Stop ${escape(r.stop)} — ${escape(r.recipientName)}</h2>
      <p>${escape(r.address)}</p>
      <p><strong>Meals:</strong> ${escape(r.meals)} &nbsp; <strong>Running Meal Total:</strong> ${escape(r.runningMeals)}</p>
      ${detail("Phone:", r.phone)}
      ${detail("Dietary:", r.dietaryRestrictions)}
      ${detail("Door:", r.doorPreference)}
      ${detail("Delivery Instructions:", r.deliveryInstructions)}
    </section>`).join("");
  return `<!doctype html>
    <html lang="en"><head><meta charset="utf-8"><title>Delivery Sheet</title>
    <style>
      @page { size: letter; margin: 0.55in; }
      body { margin: 0; color: #000; background: #fff; font: 11pt/1.3 Arial, sans-serif; }
      h1, h2, p { overflow-wrap: anywhere; word-wrap: break-word; }
      h1 { font-size: 18pt; margin: 0 0 5pt; }
      h2 { font-size: 12pt; margin: 0 0 3pt; }
      p { margin: 2pt 0; white-space: pre-wrap; }
      header { margin-bottom: 10pt; break-after: avoid; page-break-after: avoid; }
      .stop { border: 1pt solid #555; padding: 7pt; margin: 0 0 8pt;
        break-inside: avoid; page-break-inside: avoid; }
      .check { display: inline-block; border: 1pt solid #000;
        width: 10pt; height: 10pt; margin-right: 6pt; vertical-align: -1pt; }
    </style></head><body>
    <header><h1>${escape(route.eventName)} Delivery Sheet</h1>
      ${detail("Delivery date:", route.deliveryDate)}
      ${detail("Pickup:", route.startAddress)}
      <p><strong>${route.stops.length} Stops · ${escape(route.totalMeals)} Meals</strong></p>
    </header>
    ${stops}
    </body></html>`;
}
function deliveryPdf_(s, p) {
  const route = route_(s, id_(p.eventId));
  if (route.version !== p.routeVersion || !route.isFinal || !route.stops.length)
    fail_("CONFLICT", "The delivery route changed. Review the current route and save its order before preparing the PDF.");
  try {
    const pdf = HtmlService.createHtmlOutput(deliverySheetHtml_(route)).getAs("application/pdf");
    const bytes = pdf.getBytes();
    if (bytes.slice(0, 5).join(",") !== "37,80,68,70,45")
      throw new Error("Invalid PDF output");
    return { filename: "delivery-sheet-" + route.deliveryDate + ".pdf", base64: Utilities.base64Encode(bytes) };
  } catch (_) {
    fail_("PDF", "The delivery PDF could not be generated. Try Prepare Delivery PDF again.");
  }
}
function routeOrder_(s, p, admin, optimized) {
  const e = byId_(s, "EVENTS", p.eventId);
  editable_(e);
  if (Number(e.RouteVersion) !== Number(p.routeVersion))
    fail_(
      "CONFLICT",
      "The delivery route changed. Refresh before saving this order.",
    );
  const stops = approvedStops_(s, e.EventID),
    ids = stops.map((r) => r.RecipientID),
    order = p.recipientIds;
  if (
    !Array.isArray(order) ||
    order.length !== ids.length ||
    new Set(order).size !== ids.length ||
    order.some((id) => !ids.includes(id))
  )
    fail_(
      "INVALID",
      "The route must include every approved recipient exactly once.",
    );
  const old = stops
    .slice()
    .sort(
      (a, b) =>
        (Number(a.RoutePosition) || 1e9) - (Number(b.RoutePosition) || 1e9),
    )
    .map((r) => r.RecipientID);
  order.forEach((id, i) => {
    const r = byId_(s, "RECIPIENTS", id);
    r.RoutePosition = i + 1;
  });
  e.RouteVersion = Number(e.RouteVersion) + 1;
  e.RouteNeedsReview =
    stops.some((r) => !addressReviewed_(r.AddressStatus)) ||
    !addressReviewed_(e.StartAddressStatus);
  audit_(
    s,
    admin,
    optimized ? "Route Optimized" : "Route Reordered",
    "Event",
    e.EventID,
    old,
    order,
  );
  return route_(s, e.EventID);
}
function optimize_(p) {
  const a = requireAdmin_(),
    e = byId_(a.state, "EVENTS", p.eventId);
  editable_(e);
  if (Number(p.routeVersion) !== Number(e.RouteVersion))
    fail_("CONFLICT", "The delivery route changed. Refresh before optimizing.");
  const stops = approvedStops_(a.state, e.EventID);
  if (!stops.length)
    fail_("INVALID", "Approve at least one recipient before optimizing.");
  if (
    !addressReviewed_(e.StartAddressStatus) ||
    stops.some((r) => !addressReviewed_(r.AddressStatus))
  )
    fail_(
      "ADDRESS_REVIEW",
      "Address Needs Review. Confirm the pickup address and every approved recipient before optimization.",
    );
  mapsEnabled_();
  const project = properties_().getProperty("MEALS_CLOUD_PROJECT_ID");
  if (!project) fail_("CONFIG", "Route Optimization is not configured.");
  // Google-derived coordinates stay transient: never write them to Sheets or audit history.
  const pickup = addressLookup_(e.StartAddress);
  const locations = stops.map((r) => addressLookup_(r.Address));
  if (!pickup.confirmed || locations.some((x) => !x.confirmed))
    fail_(
      "ADDRESS_REVIEW",
      "An address could not be reconfirmed. Review the addresses before routing.",
    );
  // Route Optimization rejects nonzero timestamp nanos (millisecond fractions).
  const start = new Date(Math.floor(Date.now() / 1000) * 1000 + 60000),
    end = new Date(start.getTime() + 86400000);
  const payload = {
    model: {
      globalStartTime: start.toISOString(),
      globalEndTime: end.toISOString(),
      vehicles: [
        {
          startLocation: {
            latitude: pickup.latitude,
            longitude: pickup.longitude,
          },
          costPerHour: 1,
        },
      ],
      shipments: stops.map((r, i) => ({
        label: r.RecipientID,
        deliveries: [
          {
            arrivalLocation: {
              latitude: locations[i].latitude,
              longitude: locations[i].longitude,
            },
          },
        ],
      })),
    },
    timeout: "30s",
  };
  mapsUsage_("optimization", stops.length);
  const res = UrlFetchApp.fetch(
    "https://routeoptimization.googleapis.com/v1/projects/" +
      encodeURIComponent(project) +
      ":optimizeTours",
    {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    },
  );
  if (res.getResponseCode() !== 200)
    fail_("MAPS", routingFailureMessage_(res));
  const result = JSON.parse(res.getContentText());
  if ((result.skippedShipments || []).length)
    fail_(
      "MAPS",
      "The routing service could not include every stop. The previous order is unchanged.",
    );
  const visits = (result.routes || []).flatMap((r) => r.visits || []);
  const ids = visits.map(
    (v) => v.shipmentLabel || (stops[v.shipmentIndex || 0] || {}).RecipientID,
  );
  return locked_((s) =>
    routeOrder_(
      s,
      { eventId: e.EventID, routeVersion: p.routeVersion, recipientIds: ids },
      admin_(s),
      true,
    ),
  );
}

// Return only bounded machine codes. Never expose Google's raw message/body.
function routingFailureMessage_(response) {
  let error = {};
  try { error = JSON.parse(response.getContentText()).error || {}; } catch (_) {}
  const safeCode = value => /^[A-Z][A-Z0-9_]{0,80}$/.test(String(value || "")) ? String(value) : "";
  const details = Array.isArray(error.details) ? error.details.slice(0, 5) : [];
  const codes = [safeCode(error.status), ...details.map(d => safeCode(d && d.reason))].filter(Boolean);
  let guidance = "";
  if (codes.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT"))
    guidance = " Authorize Google Cloud routing permission and deploy a New version with the updated appsscript.json.";
  else if (codes.includes("SERVICE_DISABLED"))
    guidance = " Enable Route Optimization API in the configured Google Cloud project.";
  else if (codes.includes("BILLING_DISABLED"))
    guidance = " Check billing on the configured Google Cloud project.";
  return "Route optimization failed: HTTP " + response.getResponseCode() +
    (codes.length ? " — " + codes.join(" / ") : "") + "." + guidance +
    " The previous order is unchanged.";
}
function checkRoutingConnection() {
  requireAdmin_();
  const project = properties_().getProperty("MEALS_CLOUD_PROJECT_ID");
  if (!project) fail_("CONFIG", "MEALS_CLOUD_PROJECT_ID is missing.");
  const response = UrlFetchApp.fetch(
    "https://routeoptimization.googleapis.com/v1/projects/" + encodeURIComponent(project) + ":optimizeTours",
    {
      method: "post", contentType: "application/json",
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({ solvingMode: "VALIDATE_ONLY", model: {
        vehicles: [{ startLocation: { latitude: 36.69, longitude: -79.87 }, costPerHour: 1 }], shipments: []
      }}), muteHttpExceptions: true
    }
  );
  const message = response.getResponseCode() === 200 ? "Routing connection: HTTP 200 | OK" : routingFailureMessage_(response);
  console.log(message);
  return message;
}
function authorizeRouting() {
  requireAdmin_();
  ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ["https://www.googleapis.com/auth/cloud-platform"]);
  return checkRoutingConnection();
}

// ===== Schema.gs =====
// Editor-only helpers: names ending in _ cannot be called with google.script.run.
function schemaPlan_() {
  const db = database_();
  const plans = [];
  Object.keys(MEAL_SCHEMA).forEach((name) => {
    const sheet = db.getSheetByName(name);
    if (!sheet)
      plans.push({ name, action: "create", headers: MEAL_SCHEMA[name] });
    else {
      const header = sheet
        .getRange(1, 1, 1, MEAL_SCHEMA[name].length)
        .getValues()[0];
      if (JSON.stringify(header) !== JSON.stringify(MEAL_SCHEMA[name]))
        fail_(
          "SCHEMA",
          "Existing " +
            name +
            " headers differ. No automatic overwrite is allowed.",
        );
      plans.push({ name, action: "preserve" });
    }
  });
  return plans;
}
function setupDevelopmentSchema_() {
  const p = properties_();
  if (
    p.getProperty("MEALS_ENV") !== "development" ||
    p.getProperty("MEALS_ALLOW_SCHEMA_SETUP") !== "true"
  )
    fail_("CONFIG", "Development schema setup is not explicitly enabled.");
  const email = identity_();
  const bootstrap = String(p.getProperty("MEALS_BOOTSTRAP_ADMIN_EMAILS") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (
    !bootstrap.includes(email) ||
    bootstrap.length !== 2 ||
    new Set(bootstrap).size !== 2
  )
    fail_(
      "AUTH",
      "Configure exactly two administrator accounts securely in Script Properties.",
    );
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) fail_("BUSY", "Try setup again.");
  try {
    const db = database_(),
      plan = schemaPlan_();
    let next =
      Math.max.apply(
        null,
        db
          .getSheets()
          .map((s) => s.getSheetId())
          .concat([0]),
      ) + 1;
    const requests = [];
    plan
      .filter((x) => x.action === "create")
      .forEach((x) => {
        const sid = next++;
        requests.push({
          addSheet: { properties: { sheetId: sid, title: x.name } },
        });
        const rows = [{ values: x.headers.map(cell_) }];
        if (x.name === "ADMINUSERS")
          bootstrap.forEach((email) =>
            rows.push({ values: [cell_(email), cell_(true), cell_("admin")] }),
          );
        requests.push({
          updateCells: {
            start: { sheetId: sid, rowIndex: 0, columnIndex: 0 },
            rows,
            fields: "userEnteredValue",
          },
        });
      });
    // Connector-created headers may already exist. Bootstrap only an empty
    // ADMINUSERS tab; never overwrite or replace an existing account record.
    const admins = db.getSheetByName("ADMINUSERS");
    if (admins && admins.getLastRow() === 1) {
      requests.push({
        appendCells: {
          sheetId: admins.getSheetId(),
          rows: bootstrap.map((email) => ({
            values: [cell_(email), cell_(true), cell_("admin")],
          })),
          fields: "userEnteredValue",
        },
      });
    }
    if (requests.length)
      Sheets.Spreadsheets.batchUpdate({ requests }, db.getId());
    return plan;
  } finally {
    lock.releaseLock();
  }
}
function legacyMigrationPlan_() {
  const db = database_(),
    sheet = db.getSheetByName("Requests");
  if (!sheet)
    return {
      records: 0,
      action: "No legacy Requests tab in this development spreadsheet.",
    };
  const rows = sheet
    .getRange(1, 1, Math.max(sheet.getLastRow(), 1), sheet.getLastColumn())
    .getValues();
  const comments = rows[0].indexOf("Comments");
  return {
    records: rows.slice(1).filter((r) => r.some((v) => v !== "")).length,
    recordsWithComments:
      comments < 0
        ? 0
        : rows.slice(1).filter((r) => String(r[comments] || "").trim()).length,
    headers: rows[0],
    proposedMapping: {
      Name: "RecipientName",
      "Address Raw": "Address",
      Phone: "Phone",
      "Dietary Restrictions": "DietaryRestrictions",
      "Door Of Entry": "DoorPreference",
      Comments:
        "UNRESOLVED: preserve original field; obtain explicit mapping approval",
    },
    missingFields: [
      "Event assignment",
      "Organization details",
      "Meal quantities",
      "Permanent IDs",
    ],
    canMigrate: false,
    message:
      "Legacy tabs remain untouched. Do not import until event, organization, quantities and Comments mapping are explicitly approved.",
  };
}

// ===== Code.gs =====
const MEALS_BACKEND_VERSION = "2026-11-06-delivery-pdf-v1";
function include_(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}
function doGet(e) {
  if (e && e.parameter && e.parameter.page === "admin") {
    const auth = safeBoundary_(() => {
      const a = requireAdmin_();
      return a.email;
    });
    if (!auth.ok)
      return HtmlService.createHtmlOutput(
        "<h1>Administrator access unavailable</h1><p>Open the authenticated admin deployment using an approved Google account. If Google cannot identify your account, stop and contact the program administrator.</p>",
      );
    return HtmlService.createHtmlOutput(ADMIN_PAGE_HTML_)
      .setTitle("Community Meals Administration")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }
  const action = e && e.parameter && e.parameter.action;
  if (action === "submissionReceipt")
    return json_(safeBoundary_(() => publicSubmissionReceipt_(e.parameter.submissionId)));
  return json_(
    action === "events"
      ? safeBoundary_(publicEvents_)
      : {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "This public operation is unavailable.",
          },
        },
  );
}
function publicSubmissionReceipt_(submissionId) {
  // Possession of an unguessable submission UUID is required. Return only the
  // same minimal public receipt; never referral/recipient/contact information.
  const id = submissionId_(submissionId);
  const s = load_(), record = s.SUBMISSIONS.find(r => r.SubmissionID === id);
  if (!record) return { receipt: null };
  const referral = submissionReferral_(s, record);
  if (referral.SubmittedByAdmin !== false) return { receipt: null };
  const receipt = savedSubmissionReceipt_(s, record);
  return { receipt: {
    referralId: receipt.referralId, eventName: receipt.eventName,
    meals: receipt.meals, recipients: receipt.recipients, status: "Pending"
  } };
}
function doPost(e) {
  return json_(
    safeBoundary_(() => {
      const raw = e && e.postData && e.postData.contents;
      if (!raw || Utilities.newBlob(raw).getBytes().length > MEAL_LIMITS.bytes)
        fail_("INVALID", "The request is too large. Submit fewer recipients.");
      let p;
      try {
        p = JSON.parse(raw);
      } catch (_) {
        fail_("INVALID", "The request could not be read.");
      }
      if (
        p &&
        ["addressConfig", "addressSuggestions", "addressPreview"].includes(
          p.action,
        )
      )
        return publicAddressCall_(p.action, p);
      if (!p || p.action !== "submit")
        fail_("FORBIDDEN", "This public operation is unavailable.");
      return submit_(p, null);
    }),
  );
}
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function adminCall(action, p) {
  return safeBoundary_(() => {
    // Authorization must happen before dispatch, including every read.
    const auth = requireAdmin_();
    p = p || {};
    if (
      Utilities.newBlob(JSON.stringify(p)).getBytes().length > MEAL_LIMITS.bytes
    )
      fail_("INVALID", "The request is too large.");
    if (action === "addressConfig") return addressFeatures_();
    if (action === "addressSuggestions") return addressSuggestions_(p);
    if (action === "addressPreview") return addressPreview_(p);
    if (action === "publicFormLink") return publicFormLink_();
    if (action === "identity")
      return {
        email: auth.email,
        environment: properties_().getProperty("MEALS_ENV"),
        backendVersion: MEALS_BACKEND_VERSION,
      };
    if (action === "events")
      return auth.state.EVENTS.slice().sort((a, b) =>
        a.DeliveryDate.localeCompare(b.DeliveryDate),
      );
    if (action === "dashboard") return dashboard_(auth.state, p);
    if (action === "route") return route_(auth.state, id_(p.eventId));
    if (action === "deliveryPdf") return deliveryPdf_(auth.state, p);
    if (action === "reports") return reports_(auth.state, p);
    if (action === "createReferral") return submit_(p, auth.email);
    if (action === "submissionReceipt") {
      const record = auth.state.SUBMISSIONS.find(r => r.SubmissionID === submissionId_(p.submissionId));
      if (!record) return { receipt: null };
      const parent = submissionReferral_(auth.state, record);
      return { receipt: parent.SubmittedByAdmin === true ? savedSubmissionReceipt_(auth.state, record) : null };
    }
    if (action === "verifyAddress") return verifyAddress_(p);
    if (action === "optimize") return optimize_(p);
    return locked_((s) => {
      const admin = admin_(s);
      switch (action) {
        case "manualAddressReview":
          return manualAddressReview_(s, p, admin);
        case "saveEvent":
          return eventWrite_(s, p, admin);
        case "archive":
          return archiveWrite_(s, p, admin);
        case "statuses":
          return statuses_(s, p, admin);
        case "editReferral":
          return editReferral_(s, p, admin);
        case "reorder":
          return routeOrder_(s, p, admin, false);
        default:
          fail_("FORBIDDEN", "This administrator operation is unavailable.");
      }
    });
  });
}
function publicFormLink_() {
  const url = String(properties_().getProperty("MEALS_PUBLIC_FORM_URL") || "").trim();
  if (!url)
    fail_("CONFIG", "The public referral website link is not configured yet. Add MEALS_PUBLIC_FORM_URL in Apps Script Script Properties using the public form website URL, not an admin or API URL.");
  if (
    !/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::443)?(?:\/[^\s\\]*)?$/i.test(url) ||
    /[?&](?:page=admin|action=)/i.test(url)
  )
    fail_("CONFIG", "MEALS_PUBLIC_FORM_URL must be an HTTPS public referral website link, not an admin or API URL.");
  return { url };
}

```
