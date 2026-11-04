import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require(
  (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ||
    "/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules") +
    "/playwright",
);
const server = spawn(
  process.execPath,
  ["tools/dev-server.mjs", "4175", "--address-fixtures"],
  { stdio: ["ignore", "pipe", "pipe"] },
);
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.on("error", reject);
  server.on("exit", (c) => reject(new Error("server exit " + c)));
});
let browser;
const results = [];
async function check(name, fn) {
  await fn();
  results.push({
    name,
    status: "PASS",
    scope: "Local Chromium; synthetic Google and Apps Script adapters",
  });
  console.log("PASS " + name);
}
// Public production referrals intentionally defer Google review to admins.
// Mount the shared address component explicitly only for these isolated fixture
// tests; do not imply that the production public form enables Google services.
async function attachFixture(page) {
  await page.evaluate(() => {
    MealAddresses.attach(document.querySelector('[name="address"]'), async (action, payload) => {
      const response = await fetch('/api', { method: 'POST', body: JSON.stringify({action, ...payload}) });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    }, () => ({eventId: document.getElementById('eventSelect').value}));
  });
}
try {
  browser = await chromium.launch({
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
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4175/");
  await page
    .locator("#eventSelect option")
    .first()
    .waitFor({ state: "attached" });
  const input = page.locator('[name="address"]');
  await attachFixture(page);
  await check(
    "mobile autocomplete selection fills the address and equivalent validation skips confirmation",
    async () => {
      await input.fill("10 Synthetic");
      await page
        .getByRole("button", {
          name: "100 Synthetic Street, Example City, VA 00000",
          exact: true,
        })
        .waitFor();
      await page
        .getByRole("button", {
          name: "100 Synthetic Street, Example City, VA 00000",
          exact: true,
        })
        .click();
      await page.getByText("Address Verified", { exact: true }).waitFor();
      assert.equal(await page.locator("dialog[open]").count(), 0);
      assert.equal(
        await input.inputValue(),
        "100 Synthetic Street, Example City, VA 00000",
      );
      assert.equal(
        await page.locator(".address-state").textContent(),
        "Address Verified",
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page.screenshot({
        path: ".artifacts/address-mobile.png",
        fullPage: true,
      });
    },
  );
  await check(
    "keep entered value, Edit choice and equivalent addresses skip confirmation",
    async () => {
      await input.fill("10 Synthetic Lane");
      await page
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Keep What I Entered", exact: true })
        .click();
      assert.equal(await input.inputValue(), "10 Synthetic Lane");
      assert.equal(
        await page.locator(".address-state").textContent(),
        "Needs Review",
      );
      await input.fill("10 Synthetic");
      await page
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      assert.equal(await input.inputValue(), "10 Synthetic");
      assert.match(
        await page.locator(".address-state").textContent(),
        /edit the address/,
      );
      await input.fill("100 Synthetic St, Example City, VA 00000");
      await page
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await page.getByText("Address Verified", { exact: true }).waitFor();
      assert.equal(await page.locator("dialog[open]").count(), 0);
    },
  );
  await check(
    "unit loss is flagged and recommended value preserves the complete entered unit",
    async () => {
      await input.fill(
        "100 Synthetic Street Apt 4 East, Example City, VA 00000",
      );
      await page
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await page
        .getByText(
          "Apartment / suite / unit information needs review. Your entered unit has been preserved.",
        )
        .waitFor();
      await page
        .getByRole("button", { name: "Use Recommended", exact: true })
        .click();
      assert.match(await input.inputValue(), /Apt 4 East/);
      assert.equal(
        await page.locator(".address-state").textContent(),
        "Needs Review",
      );
    },
  );
  await check(
    "unconfirmed address can be kept and submitted with immediate reservation",
    async () => {
      await input.fill("Uncertain Synthetic Lane");
      await page
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Keep What I Entered", exact: true })
        .click();
      await page
        .locator('[name="organizationName"]')
        .fill("Synthetic Browser Outreach");
      await page
        .locator('[name="organizationEmail"]')
        .fill("synthetic@example.test");
      await page.locator('[name="organizationPhone"]').fill("202-555-0100");
      await page
        .locator('[name="recipientName"]')
        .fill("Synthetic Address Test");
      await page
        .getByRole("button", { name: "Submit Meal Request", exact: true })
        .click();
      await page.locator("#successPanel").waitFor({ state: "visible" });
      await page.waitForFunction(
        () => document.getElementById("remaining").textContent === "14",
      );
    },
  );
  await check(
    "stale suggestions and validation responses cannot replace later edits",
    async () => {
      const race = await page.context().newPage();
      await race.setViewportSize({ width: 390, height: 844 });
      await race.goto("http://127.0.0.1:4175/");
      await attachFixture(race);
      await race
        .locator("#eventSelect option")
        .first()
        .waitFor({ state: "attached" });
      let delayed;
      const arrived = new Promise((resolve) => {
        delayed = resolve;
      });
      let release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      await race.route("**/api", async (route) => {
        if (route.request().postDataJSON()?.action === "addressSuggestions") {
          delayed();
          await gate;
          await route.fulfill({
            json: {
              ok: true,
              data: {
                suggestions: [{ address: "STALE Synthetic Suggestion" }],
              },
            },
          });
        } else await route.continue();
      });
      const a = race.locator('[name="address"]');
      await a.fill("Old Synthetic Search");
      await arrived;
      await a.fill("New");
      release();
      // Ordered request completion, rather than claiming a live Google race.
      await race.waitForResponse(
        (r) =>
          r.url().endsWith("/api") &&
          r.request().postDataJSON()?.action === "addressSuggestions",
      );
      assert.equal(
        await race
          .getByRole("button", { name: "STALE Synthetic Suggestion" })
          .count(),
        0,
      );
      await race.unroute("**/api");
      let validationArrived, validationRelease;
      const waiting = new Promise((resolve) => {
        validationArrived = resolve;
      });
      const proceed = new Promise((resolve) => {
        validationRelease = resolve;
      });
      await race.route("**/api", async (route) => {
        if (route.request().postDataJSON()?.action === "addressPreview") {
          validationArrived();
          await proceed;
          await route.continue();
        } else await route.continue();
      });
      await a.fill("100 Synthetic Street, Example City, VA 00000");
      await race
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await waiting;
      await a.fill("Different Synthetic Street");
      const response = race.waitForResponse(
        (r) =>
          r.url().endsWith("/api") &&
          r.request().postDataJSON()?.action === "addressPreview",
      );
      validationRelease();
      await response;
      assert.equal(await a.inputValue(), "Different Synthetic Street");
      assert.equal(
        await race.getByText("Address Verified", { exact: true }).count(),
        0,
      );
      await race.close();
    },
  );
  await check(
    "continuous typing starts lookup early, coalesces edits and never overlaps requests",
    async () => {
      const typing = await page.context().newPage();
      await typing.goto("http://127.0.0.1:4175/");
      await typing.evaluate(() => {
        document.body.innerHTML = '<label>Address<input id="typing-address"></label>';
        window.typingStats = { requests: [], active: 0, maxActive: 0, configCalls: 0 };
        MealAddresses.attach(document.querySelector("input"), async (action, p) => {
          if (action === "addressConfig") {
            typingStats.configCalls++;
            return { autocomplete: true, validation: true };
          }
          typingStats.active++;
          typingStats.maxActive = Math.max(typingStats.active, typingStats.maxActive);
          typingStats.requests.push(p.address);
          await new Promise(resolve => setTimeout(resolve, 500));
          typingStats.active--;
          return { suggestions: [{ address: p.address + " suggestion" }] };
        });
      });
      const field = typing.locator("input");
      await field.pressSequentially("100 Synthetic Street", { delay: 80 });
      const during = await typing.evaluate(() => typingStats.requests);
      assert.ok(during.length > 0);
      assert.notEqual(during[0], "100 Synthetic Street");
      await typing.getByRole("button", { name: "100 Synthetic Street suggestion", exact: true }).waitFor();
      const stats = await typing.evaluate(() => typingStats);
      assert.equal(stats.maxActive, 1);
      assert.equal(stats.configCalls, 1);
      assert.ok(stats.requests.length <= 4);
      await typing.close();
    },
  );
  const admin = await page.context().newPage();
  await admin.setViewportSize({ width: 1280, height: 900 });
  admin.on("pageerror", (e) => errors.push(e.message));
  await admin.goto("http://127.0.0.1:4175/preview-admin");
  await admin.locator("#requestCards article").first().waitFor();
  await check(
    "admin Add Referral and Edit Referral share controls and save verification",
    async () => {
      await admin
        .getByRole("button", { name: "Add Referral", exact: true })
        .click();
      const editor = admin.locator("#referralEditor");
      await editor
        .locator('[name="organizationName"]')
        .fill("Synthetic Admin Address");
      await editor
        .locator('[name="organizationEmail"]')
        .fill("synthetic-admin@example.test");
      await editor.locator('[name="organizationPhone"]').fill("202-555-0100");
      await editor
        .locator('[name="recipientName"]')
        .fill("Synthetic Admin Recipient");
      await editor.locator('[name="address"]').fill("10 Synthetic");
      await editor
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await admin
        .getByRole("button", { name: "Use Recommended", exact: true })
        .click();
      await admin
        .getByRole("button", { name: "Save Referral", exact: true })
        .click();
      await admin.locator("#referralDialog").waitFor({ state: "hidden" });
      const card = admin
        .locator(".request-card")
        .filter({ hasText: "Synthetic Admin Address" });
      await card.getByRole("button", { name: "Edit", exact: true }).click();
      assert.equal(
        await editor.locator('[name="address"]').inputValue(),
        "100 Synthetic Street, Example City, VA 00000",
      );
      assert.equal(
        await editor.locator(".address-state").textContent(),
        "Address Verified",
      );
      await editor.locator('[name="address"]').fill("Uncertain Synthetic");
      await editor
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await admin
        .getByRole("button", { name: "Keep What I Entered", exact: true })
        .click();
      await admin
        .getByRole("button", { name: "Save Referral", exact: true })
        .click();
      await admin.locator("#referralDialog").waitFor({ state: "hidden" });
      assert.match(await card.textContent(), /Address Needs Review/);
    },
  );
  await check(
    "pickup settings and event creation include address checking on desktop and mobile",
    async () => {
      await admin
        .getByRole("button", { name: "Event Settings", exact: true })
        .click();
      const settings = admin.locator("#settingsForm");
      await settings.locator('[name="startAddress"]').fill("10 Synthetic");
      await settings
        .getByRole("button", { name: "Check Address", exact: true })
        .click();
      await admin
        .getByRole("button", { name: "Use Recommended", exact: true })
        .click();
      await admin
        .getByRole("button", { name: "Save Event Settings", exact: true })
        .click();
      await admin
        .getByText("Pickup address confirmed.", { exact: true })
        .waitFor();
      await admin.setViewportSize({ width: 390, height: 844 });
      await admin
        .getByRole("button", { name: "Create Event", exact: true })
        .click();
      assert.equal(
        await admin
          .locator("#eventEditor")
          .getByRole("button", { name: "Check Address", exact: true })
          .count(),
        1,
      );
      assert.equal(
        await admin.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await admin.locator("#closeEvent").click();
      assert.deepEqual(errors, []);
    },
  );
  fs.writeFileSync(
    ".artifacts/address-browser-results.json",
    JSON.stringify(results, null, 2),
  );
} finally {
  if (browser) await browser.close();
  server.kill();
}
