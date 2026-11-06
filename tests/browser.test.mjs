import assert from "node:assert/strict";
import fs from "node:fs";
import { harness } from "./harness.mjs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch (_) {
  playwright = require(
    (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ||
      "/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules") +
      "/playwright",
  );
}
fs.mkdirSync(".artifacts", { recursive: true });
const server = spawn(process.execPath, ["tools/dev-server.mjs", "4174"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.on("error", reject);
  server.on("exit", (code) =>
    reject(new Error("Preview server exited " + code)),
  );
});
let browser;
const results = [];
const check = async (name, fn) => {
  await fn();
  results.push({
    name,
    status: "PASS",
    scope: "Local Chromium + synthetic Apps Script adapter",
  });
  console.log("PASS " + name);
};
try {
  browser = await playwright.chromium.launch({
    headless: true,
    ...(process.env.MEALS_BROWSER_EXECUTABLE
      ? {
          executablePath: process.env.MEALS_BROWSER_EXECUTABLE,
          args: [
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--single-process",
          ],
        }
      : {}),
  });
  const desktop = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    }),
    publicPage = await desktop.newPage(),
    admin = await desktop.newPage();
  const errors = [];
  for (const p of [publicPage, admin])
    p.on("pageerror", (e) => errors.push(e.message));
  await check(
    "Public form: nearest event, live meals, add/remove preserves data, valid multi-recipient submission",
    async () => {
      await publicPage.goto("http://127.0.0.1:4174/");
      await publicPage.waitForFunction(
        () => document.getElementById("remaining").textContent === "15",
      );
      await publicPage
        .locator('[name="organizationName"]')
        .fill("Synthetic Browser Outreach");
      await publicPage
        .locator('[name="organizationEmail"]')
        .fill("browser@example.test");
      await publicPage
        .locator('[name="organizationPhone"]')
        .fill("202-555-0110");
      const first = publicPage.locator(".recipient-card").first();
      await first
        .locator('[name="recipientName"]')
        .fill("<script>window.injected=true</script>");
      await first
        .locator('[name="address"]')
        .fill("77 Synthetic Browser Lane, Example City, VA 00000");
      await first.locator('[name="mealCount"]').fill("2");
      await publicPage
        .getByRole("button", { name: "+ Add Another Recipient", exact: true })
        .click();
      const second = publicPage.locator(".recipient-card").nth(1);
      await second.locator('[name="recipientName"]').fill("Synthetic Second");
      await second
        .locator('[name="address"]')
        .fill("78 Synthetic Browser Lane, Example City, VA 00000");
      assert.equal(
        await first.locator('[name="recipientName"]').inputValue(),
        "<script>window.injected=true</script>",
      );
      assert.equal(await publicPage.locator("#mealTotal").textContent(), "3");
      await publicPage
        .getByRole("button", { name: "+ Add Another Recipient", exact: true })
        .click();
      await publicPage
        .locator(".recipient-card")
        .nth(2)
        .getByRole("button", { name: "Remove recipient", exact: true })
        .click();
      assert.equal(await publicPage.locator(".recipient-card").count(), 2);
      await first.locator('[name="mealCount"]').fill("16");
      assert.match(
        await publicPage.locator("#quantityWarning").textContent(),
        /exceeds/,
      );
      await first.locator('[name="mealCount"]').fill("2");
      await publicPage.screenshot({
        path: ".artifacts/public-desktop.png",
        fullPage: true,
      });
      await publicPage
        .getByRole("button", { name: "Submit Meal Request", exact: true })
        .click();
      await publicPage.locator("#successPanel").waitFor({ state: "visible" });
      assert.match(
        await publicPage.locator("#successMessage").textContent(),
        /3 meals/,
      );
      await publicPage.waitForFunction(
        () => document.getElementById("remaining").textContent === "12",
      );
      const stored = await publicPage.evaluate(() =>
        sessionStorage.getItem("community-meals-submission-v1"),
      );
      assert.ok(!stored.includes("Synthetic Browser Lane"));
      assert.ok(!stored.includes("<script>"));
      await publicPage.reload();
      await publicPage.locator("#successPanel").waitFor({ state: "visible" });
    },
  );
  await check(
    "Admin: pending bulk approval, safe submitted text, view/edit, meal accounting",
    async () => {
      await admin.goto("http://127.0.0.1:4174/preview-admin");
      await admin.waitForFunction(
        () => document.querySelectorAll(".request-card").length === 2,
      );
      assert.equal(await admin.evaluate(() => window.injected), undefined);
      await admin
        .getByRole("button", { name: "Select All Pending", exact: true })
        .click();
      await admin
        .getByRole("button", { name: "Approve Selected", exact: true })
        .click();
      await admin.waitForFunction(() =>
        document
          .getElementById("metrics")
          .textContent.includes("Approved Referrals: 2"),
      );
      assert.match(
        await admin.locator("#metrics").textContent(),
        /Available: 12/,
      );
      await admin
        .locator(".request-card")
        .first()
        .getByRole("button", { name: "Edit", exact: true })
        .click();
      await admin.locator("#referralDialog").waitFor({ state: "visible" });
      await admin
        .locator('#editorRecipients [name="mealCount"]')
        .first()
        .fill("4");
      await admin
        .locator('#editorRecipients [name="notes"]')
        .first()
        .fill("DO_NOT_PRINT_INTERNAL_NOTE");
      await admin
        .getByRole("button", { name: "Save Referral", exact: true })
        .click();
      await admin.locator("#referralDialog").waitFor({ state: "hidden" });
      await admin.waitForFunction(() =>
        document
          .getElementById("metrics")
          .textContent.includes("Available: 11"),
      );
      await admin.screenshot({
        path: ".artifacts/admin-desktop.png",
        fullPage: true,
      });
    },
  );
  await check(
    "Route: unresolved recipients visible, no final route, touch controls update totals, desktop map URL",
    async () => {
      await admin
        .getByRole("button", { name: "Delivery Route", exact: true })
        .click();
      await admin.locator("#routeView").waitFor({ state: "visible" });
      assert.equal(await admin.locator(".stop").count(), 4);
      assert.match(
        await admin.locator("#routeStatus").textContent(),
        /not final/,
      );
      assert.equal(await admin.locator("#optimizeRoute").isDisabled(), true);
      assert.equal(await admin.locator("#printRoute").isDisabled(), true);
      assert.match(
        await admin.locator(".stop a").first().getAttribute("href"),
        /^https:\/\/www.google.com\/maps\/search/,
      );
      const previous = await admin.locator(".stop h3").first().textContent();
      await admin
        .locator(".stop")
        .nth(1)
        .getByRole("button", { name: "Move Up", exact: true })
        .click();
      assert.notEqual(
        await admin.locator(".stop h3").first().textContent(),
        previous,
      );
      assert.match(
        await admin.locator("#routeStatus").textContent(),
        /Save Manual Order/,
      );
      await admin
        .getByRole("button", { name: "Save Manual Order", exact: true })
        .click();
      await admin.waitForFunction(
        () =>
          !document
            .getElementById("routeStatus")
            .textContent.includes("Order changed"),
      );
    },
  );
  await check(
    "Maps-disabled manual address review enables printing only after all addresses and order are reviewed",
    async () => {
      const accept = (d) => d.accept();
      admin.on("dialog", accept);
      try {
        await admin
          .getByRole("button", { name: "Event Settings", exact: true })
          .click();
        await admin.locator("#manualPickup").click();
        await admin.waitForFunction(() =>
          document
            .getElementById("pickupStatus")
            .textContent.includes("manually reviewed"),
        );
        await admin
          .getByRole("button", { name: "Requests", exact: true })
          .click();
        const referrals = await admin.locator(".request-card").count();
        for (let i = 0; i < referrals; i++) {
          await admin
            .locator(".request-card")
            .nth(i)
            .getByRole("button", { name: "Edit", exact: true })
            .click();
          const recipients = await admin
            .locator("#editorRecipients > fieldset")
            .count();
          await admin.locator("#referralDialog").evaluate((d) => d.close());
          for (let j = 0; j < recipients; j++) {
            await admin
              .locator(".request-card")
              .nth(i)
              .getByRole("button", { name: "Edit", exact: true })
              .click();
            await admin
              .locator("#editorRecipients > fieldset")
              .nth(j)
              .getByRole("button", {
                name: "Mark Saved Address Reviewed",
                exact: true,
              })
              .click();
            await admin.locator("#referralDialog").waitFor({ state: "hidden" });
            await admin.waitForFunction(
              () => !document.getElementById("adminEvents").disabled,
            );
          }
        }
        await admin
          .getByRole("button", { name: "Delivery Route", exact: true })
          .click();
        assert.equal(await admin.locator("#printRoute").isDisabled(), true);
        await admin
          .getByRole("button", { name: "Save Manual Order", exact: true })
          .click();
        await admin.waitForFunction(
          () => !document.getElementById("printRoute").disabled,
        );
        assert.equal(await admin.locator("#optimizeRoute").isDisabled(), true);
        assert.equal(await admin.locator(".stop .badge").count(), 0);
      } finally {
        admin.off("dialog", accept);
      }
    },
  );
  await check(
    "Desktop drag-and-drop and tablet layout preserve official order and readable controls",
    async () => {
      const initial = await admin.locator(".stop h3").first().textContent();
      await admin.evaluate(() => {
        window.dragEvents = [];
        for (const kind of ["dragstart", "dragover", "drop", "dragend"])
          document.addEventListener(kind, (e) =>
            window.dragEvents.push({
              kind,
              id: e.target.closest(".stop")?.dataset.recipientId,
              tag: e.target.tagName,
            }),
          );
      });
      assert.equal(
        await admin
          .locator(".stop")
          .nth(1)
          .evaluate((x) => x.draggable),
        true,
      );
      await admin
        .locator(".stop")
        .nth(1)
        .dragTo(admin.locator(".stop").first(), {
          sourcePosition: { x: 20, y: 20 },
          targetPosition: { x: 20, y: 20 },
        });
      await admin.waitForFunction(
        (previous) =>
          document.querySelector(".stop h3").textContent !== previous,
        initial,
      );
      assert.ok(
        (await admin.evaluate(() => window.dragEvents)).some(
          (e) => e.kind === "drop",
        ),
      );
      assert.notEqual(
        await admin.locator(".stop h3").first().textContent(),
        initial,
      );
      await admin
        .getByRole("button", { name: "Save Manual Order", exact: true })
        .click();
      await admin.waitForFunction(
        () =>
          !document
            .getElementById("routeStatus")
            .textContent.includes("Order changed"),
      );
      await admin.setViewportSize({ width: 768, height: 1024 });
      assert.equal(await admin.evaluate(() => innerWidth), 768);
      assert.ok(
        await admin.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await admin.evaluate(
        () => (document.documentElement.style.fontSize = "32px"),
      );
      assert.ok(
        await admin.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await admin.evaluate(
        () => (document.documentElement.style.fontSize = ""),
      );
      await admin.setViewportSize({ width: 1280, height: 900 });
    },
  );
  const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
    }),
    phonePublic = await mobile.newPage(),
    phoneAdmin = await mobile.newPage();
  for (const p of [phonePublic, phoneAdmin])
    p.on("pageerror", (e) => errors.push(e.message));
  await check(
    "Phone viewport: public/admin fit width; Apple Maps addresses; Move Up/Down usable",
    async () => {
      await phonePublic.goto("http://127.0.0.1:4174/");
      await phonePublic.waitForFunction(
        () => document.getElementById("remaining").textContent !== "—",
      );
      assert.ok(
        await phonePublic.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await phonePublic.screenshot({
        path: ".artifacts/public-phone.png",
        fullPage: true,
      });
      await phoneAdmin.goto("http://127.0.0.1:4174/preview-admin");
      await phoneAdmin.waitForFunction(
        () => document.querySelectorAll(".request-card").length === 2,
      );
      await phoneAdmin
        .getByRole("button", { name: "Delivery Route", exact: true })
        .click();
      await phoneAdmin.locator("#routeView").waitFor({ state: "visible" });
      assert.equal(await phoneAdmin.evaluate(() => innerWidth), 390);
      assert.ok(
        await phoneAdmin.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      assert.match(
        await phoneAdmin.locator(".stop a").first().getAttribute("href"),
        /^https:\/\/maps.apple.com\/\?daddr=/,
      );
      await phoneAdmin
        .locator(".stop")
        .first()
        .getByRole("button", { name: "Move Down", exact: true })
        .click();
      assert.match(
        await phoneAdmin.locator(".stop h3").nth(1).textContent(),
        /^Stop 2/,
      );
      await phoneAdmin
        .getByRole("button", { name: "Save Manual Order", exact: true })
        .click();
      await phoneAdmin.screenshot({
        path: ".artifacts/route-phone.png",
        fullPage: true,
      });
    },
  );
  await check(
    "Multi-page print: all stops, checkbox, dietary/phone/instructions, no organization or notes",
    async () => {
      const eventId = await admin
        .locator("#adminEvents option")
        .filter({ hasText: "Synthetic Print Test Event" })
        .getAttribute("value");
      await admin.selectOption("#adminEvents", eventId);
      await admin.waitForFunction(
        () => document.querySelectorAll(".stop").length === 30,
      );
      await admin
        .getByRole("button", { name: "Delivery Route", exact: true })
        .click();
      await admin.waitForFunction(
        () => !document.getElementById("printRoute").disabled,
      );
      // Direct Ctrl+P must not print an unverified cached delivery sheet.
      await admin.emulateMedia({ media: "print" });
      assert.equal(await admin.locator(".stop").first().isVisible(), false);
      assert.equal(await admin.locator(".print-verification-warning").isVisible(), true);
      await admin.emulateMedia({ media: "screen" });
      const localRoute = await admin.request.post("http://127.0.0.1:4174/admin-rpc", {
        data: { action: "route", payload: { eventId } },
      });
      const { data: route } = await localRoute.json();
      const printable = await desktop.newPage();
      await printable.setContent(harness().ctx.deliverySheetHtml_(route));
      const text = await printable.locator("body").innerText();
      assert.equal(await printable.locator(".stop").count(), route.stops.length);
      for (const value of ["Synthetic allergy note", "202-555-0102",
        "Synthetic delivery instruction", "Running Meal Total:", "30 Stops · 73 Meals"]) {
        assert.ok(text.includes(value), value);
      }
      for (const value of ["DO_NOT_PRINT_ORGANIZATION", "DO_NOT_PRINT_EMAIL",
        "DO_NOT_PRINT_INTERNAL_NOTE", "202-555-0199"]) {
        assert.ok(!text.includes(value), value);
      }
      const pdf = await printable.pdf({
        path: ".artifacts/delivery-sheet.pdf",
        preferCSSPageSize: true,
        printBackground: true,
      });
      await printable.close();

      // The local adapter verifies the server guards, then substitutes browser-rendered
      // bytes for Google's hosted conversion so the client downloads an actual PDF.
      await admin.route("**/admin-rpc", async (request) => {
        if (request.request().postDataJSON().action !== "deliveryPdf") return request.fallback();
        const response = await request.fetch();
        const result = await response.json();
        assert.equal(result.ok, true);
        result.data.base64 = pdf.toString("base64");
        await request.fulfill({json: result});
      });
      await admin.locator("#printRoute").click();
      await admin.getByRole("link", {name: "Open PDF", exact: true}).waitFor();
      const downloadLink = admin.getByRole("link", {name: "Download PDF", exact: true});
      const [download] = await Promise.all([admin.waitForEvent("download"), downloadLink.click()]);
      assert.equal(download.suggestedFilename(), "delivery-sheet-2026-12-24.pdf");
      assert.deepEqual(fs.readFileSync(await download.path()), pdf);
      await admin.getByRole("button", {name: "Refresh", exact: true}).click();
      await downloadLink.waitFor({state: "hidden"});
      await admin.unroute("**/admin-rpc");
    },
  );
  await check(
    "Archive disappears from active selector, reports retain records, confirmed unarchive returns event",
    async () => {
      admin.on("dialog", (d) => d.accept());
      await admin
        .getByRole("button", { name: "Archive Event", exact: true })
        .click();
      await admin.waitForFunction(
        () =>
          !document
            .querySelector("#adminEvents")
            .textContent.includes("Synthetic Print Test Event"),
      );
      await admin.getByRole("button", { name: "Reports", exact: true }).click();
      await admin.waitForFunction(() =>
        document
          .getElementById("reportTotals")
          .textContent.includes("Events: 2"),
      );
      assert.match(
        await admin.locator("#reportEvent").textContent(),
        /Synthetic Print Test Event \(Archived\)/,
      );
      await admin.locator("#showArchived").check();
      await admin.waitForFunction(() =>
        document
          .querySelector("#adminEvents")
          .textContent.includes("Synthetic Print Test Event"),
      );
      const archivedId = await admin
        .locator("#adminEvents option")
        .filter({ hasText: "Synthetic Print Test Event" })
        .getAttribute("value");
      await admin.waitForFunction(
        () => !document.getElementById("adminEvents").disabled,
      );
      await admin.selectOption("#adminEvents", archivedId);
      await admin
        .getByRole("button", { name: "Reopen / Unarchive", exact: true })
        .waitFor({ state: "visible" });
      await admin
        .getByRole("button", { name: "Reopen / Unarchive", exact: true })
        .click();
      await admin.waitForFunction(
        () => document.getElementById("readonlyNotice").textContent === "",
      );
    },
  );
  await check(
    "Lost response, full-event refresh and double submit return the original receipt without duplicates",
    async () => {
      await admin.waitForFunction(
        () => !document.getElementById("adminEvents").disabled,
      );
      await admin
        .getByRole("button", { name: "Create Event", exact: true })
        .click();
      const eventForm = admin.locator("#eventEditor");
      await eventForm
        .locator('[name="eventName"]')
        .fill("Synthetic Retry Test");
      await eventForm.locator('[name="deliveryDate"]').fill("2026-11-27");
      await eventForm.locator('[name="capacity"]').fill("2");
      await eventForm
        .locator('[name="startAddress"]')
        .fill("1 Synthetic Pickup Road, Example City, VA 00000");
      await eventForm.locator('[name="status"]').selectOption("Open");
      await eventForm
        .getByRole("button", { name: "Create Event", exact: true })
        .click();
      await admin.locator("#eventDialog").waitFor({ state: "hidden" });
      await admin.waitForFunction(() =>
        document.getElementById("metrics").textContent.includes("Capacity: 2"),
      );
      await publicPage
        .getByRole("button", { name: "Start Another Referral", exact: true })
        .click();
      await publicPage.waitForFunction(() =>
        document
          .querySelector("#eventSelect")
          .textContent.includes("Synthetic Retry Test"),
      );
      const id = await publicPage
        .locator("#eventSelect option")
        .filter({ hasText: "Synthetic Retry Test" })
        .getAttribute("value");
      await publicPage.selectOption("#eventSelect", id);
      await publicPage.waitForFunction(
        () => document.getElementById("remaining").textContent === "2",
      );
      const fill = async () => {
        await publicPage
          .locator('[name="organizationName"]')
          .fill("Synthetic Retry Org");
        await publicPage
          .locator('[name="organizationEmail"]')
          .fill("retry@example.test");
        await publicPage
          .locator('[name="organizationPhone"]')
          .fill("202-555-0100");
        await publicPage
          .locator('[name="recipientName"]')
          .fill("Synthetic Retry Recipient");
        await publicPage
          .locator('[name="address"]')
          .fill("22 Synthetic Retry Road, Example City, VA 00000");
        await publicPage.locator('[name="mealCount"]').fill("2");
      };
      await fill();
      let lost = false, posts = 0;
      await publicPage.route("**/api?**", async (r) => {
        if (r.request().method() === "POST" && r.request().postDataJSON()?.action === "submit") {
          posts++;
          if (!lost) {
            lost = true;
            await r.fetch(); // Commit once, then lose only the response.
            await r.abort("failed");
            return;
          }
        }
        await r.continue();
      });
      await publicPage
        .getByRole("button", { name: "Submit Meal Request", exact: true })
        .click();
      await publicPage.evaluate(() => {
        const form = document.getElementById("referralForm");
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
      await publicPage.locator("#successPanel").waitFor({ state: "visible" });
      assert.equal(lost, true);
      assert.equal(posts, 1);
      const savedId = await publicPage.locator("#receiptId").textContent();
      await publicPage.reload();
      await publicPage.locator("#successPanel").waitFor({ state: "visible" });
      await publicPage.waitForFunction(() => !document.getElementById("eventSelect").disabled);
      await publicPage.selectOption("#eventSelect", id);
      await publicPage.waitForFunction(() => document.getElementById("remaining").textContent === "0");
      assert.equal(await publicPage.locator("#receiptId").textContent(), savedId);
      assert.equal(posts, 1);
      await admin.getByRole("button", { name: "Refresh", exact: true }).click();
      await admin.waitForFunction(() =>
        document
          .getElementById("metrics")
          .textContent.includes("Pending Referrals: 1"),
      );
      assert.match(
        await admin.locator("#metrics").textContent(),
        /Reserved: 2/,
      );
      await publicPage.reload();
      await publicPage.locator("#successPanel").waitFor({ state: "visible" });
    },
  );
  await check("Closed-event refresh preserves the draft and requires explicit event selection", async () => {
    const page = await desktop.newPage();
    let closed = false, writes = 0;
    await page.route("**/api?*", async route => {
      if (route.request().method() !== "GET") {writes++; return route.abort();}
      await route.fulfill({contentType: "application/json", body: JSON.stringify({ok: true, data: [
        ...(!closed ? [{eventId: "original-event", eventName: "Original event", deliveryDate: "2026-11-26", remaining: 5}] : []),
        {eventId: "other-event", eventName: "Other event", deliveryDate: "2026-11-27", remaining: 10},
      ]})});
    });
    await page.goto("http://127.0.0.1:4174/");
    await page.waitForFunction(() => document.getElementById("eventSelect").value === "original-event");
    await page.getByLabel("Organization name", {exact: true}).fill("Synthetic retained draft");
    closed = true;
    await page.getByRole("button", {name: "Refresh Availability", exact: true}).click();
    await page.waitForFunction(() => document.getElementById("eventMessage").textContent.includes("no longer accepting"));
    assert.equal(await page.locator("#eventSelect").inputValue(), "original-event");
    assert.equal(await page.getByLabel("Organization name", {exact: true}).inputValue(), "Synthetic retained draft");
    assert.equal(await page.locator("#submitRequest").isEnabled(), false);
    await page.selectOption("#eventSelect", "other-event");
    await page.waitForFunction(() => !document.getElementById("submitRequest").disabled);
    assert.equal(writes, 0);
    await page.close();
  });
  await check("No browser script errors", async () => {
    assert.deepEqual(errors, []);
  });
  fs.writeFileSync(
    ".artifacts/browser-results.json",
    JSON.stringify(results, null, 2),
  );
  console.log(results.length + " browser checks passed.");
} catch (e) {
  fs.writeFileSync(
    ".artifacts/browser-results.json",
    JSON.stringify(
      [...results, { status: "FAIL", message: e.message }],
      null,
      2,
    ),
  );
  throw e;
} finally {
  if (browser) await browser.close();
  server.kill();
}
