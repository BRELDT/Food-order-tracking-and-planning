// Local-only synthetic preview. Never use this server as a production backend.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { harness, createEvent, payload, approve } from "../tests/harness.mjs";
const h = harness();
// Explicit synthetic Google fixture: never makes an external request.
if (process.argv.includes("--address-fixtures")) {
  h.props.MEALS_ADDRESS_AUTOCOMPLETE_ENABLED = "true";
  h.props.MEALS_ADDRESS_VALIDATION_ENABLED = "true";
  h.props.MEALS_PLACES_API_KEY = "synthetic-key";
  h.props.MEALS_ADDRESS_API_KEY = "synthetic-key";
  h.state.fetch = (url, options) => {
    const body = JSON.parse(options.payload);
    const result = url.includes("places.googleapis.com")
      ? {
          suggestions: [
            {
              placePrediction: {
                text: { text: "100 Synthetic Street, Example City, VA 00000" },
              },
            },
          ],
        }
      : {
          result: {
            verdict: {
              addressComplete: true,
              validationGranularity: "PREMISE",
              hasUnconfirmedComponents:
                body.address.addressLines[0].includes("Uncertain"),
            },
            address: {
              formattedAddress: "100 Synthetic Street, Example City, VA 00000",
            },
          },
        };
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify(result),
    };
  };
}
const e = createEvent(h, 20);
const sample = h.admin("createReferral", payload(e.EventID, [3, 2]));
const printEvent = createEvent(h, 100);
h.seed((s) => {
  const row = s.EVENTS.find((x) => x.EventID === printEvent.EventID);
  row.EventName = "Synthetic Print Test Event";
  row.DeliveryDate = "2026-12-24";
  row.StartAddressStatus = "Confirmed";
  row.StartLatitude = 1;
  row.StartLongitude = 2;
});
const pp = payload(printEvent.EventID, Array.from({length: 30}, (_, i) => 1 + (i % 4)));
pp.organizationName = "DO_NOT_PRINT_ORGANIZATION";
pp.organizationEmail = "DO_NOT_PRINT_EMAIL@example.test";
pp.organizationPhone = "202-555-0199";
pp.recipients.forEach((r) => {
  r.notes = "DO_NOT_PRINT_INTERNAL_NOTE";
  r.deliveryInstructions =
    "Synthetic delivery instruction. Ring bell twice and use side door.";
  r.dietaryRestrictions = "Synthetic allergy note";
  r.phone = "202-555-0102";
});
pp.recipients[5].address = "506 " + "LongAddressSegment".repeat(24) + " Apt QA-6, Example City, VA 00000";
pp.recipients[6].recipientName = "Zoë & José Synthetic";
const pr = h.admin("createReferral", pp).data;
approve(h, [pr.referralId]);
h.seed((s) => {
  const e = s.EVENTS.find((x) => x.EventID === printEvent.EventID);
  e.RouteNeedsReview = false;
  s.RECIPIENTS.filter((x) => x.EventID === e.EventID).forEach((r, i) => {
    r.RoutePosition = i + 1;
    r.AddressStatus = "Confirmed";
    r.Latitude = 1;
    r.Longitude = 2;
  });
});
const args = process.argv.slice(2),
  port = Number(args[0] || 4173);
const root = process.cwd();
const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://127.0.0.1");
    if (u.pathname === "/api") {
      if (req.method === "GET") {
        res.setHeader("Content-Type", "application/json");
        res.end(h.ctx.doGet({ parameter: Object.fromEntries(u.searchParams) }).text);
        return;
      }
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 200000) {
          res.writeHead(413);
          res.end();
          return;
        }
      }
      res.setHeader("Content-Type", "application/json");
      res.end(h.ctx.doPost({ postData: { contents: body } }).text);
      return;
    }
    if (u.pathname === "/admin-rpc" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const p = JSON.parse(body);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(h.admin(p.action, p.payload)));
      return;
    }
    if (u.pathname === "/preview-admin") {
      let html = fs.readFileSync("apps-script/Admin.html", "utf8");
      html = html
        .replace(
          "<?!= include_('AdminStyles'); ?>",
          fs.readFileSync("apps-script/AdminStyles.html", "utf8"),
        )
        .replace(
          "<?!= include_('AddressClient'); ?>",
          fs.readFileSync("apps-script/AddressClient.html", "utf8"),
        )
        .replace(
          "<?!= include_('AdminClient'); ?>",
          fs.readFileSync("apps-script/AdminClient.html", "utf8"),
        );
      const bridge = `<script>window.google={script:{get run(){let success,failure;const chain={withSuccessHandler(fn){success=fn;return chain},withFailureHandler(fn){failure=fn;return chain},adminCall(action,payload){fetch('/admin-rpc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,payload})}).then(r=>r.json()).then(r=>success(r)).catch(e=>failure(e))}};return chain}}};</script>`;
      html = html.replace("<script>", bridge + "<script>");
      res.setHeader("Content-Type", "text/html");
      res.end(html);
      return;
    }
    if (u.pathname === "/config.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(
        "window.MEALS_CONFIG={publicApiUrl:location.origin+'/api',adminAppUrl:''};",
      );
      return;
    }
    const name =
      u.pathname === "/"
        ? "index.html"
        : decodeURIComponent(u.pathname).slice(1);
    const file = path.resolve(root, name);
    if (
      !file.startsWith(root + path.sep) ||
      name.includes("..") ||
      !(
        name === "index.html" ||
        name === "privacy.html" ||
        name === "terms.html" ||
        name === "admin.html" ||
        name === "app.js" ||
        name === "address-entry.js" ||
        name === "submission-confirmation.js" ||
        name === "admin.js" ||
        name === "styles.css"
      )
    ) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.setHeader(
      "Content-Type",
      name.endsWith(".html")
        ? "text/html"
        : name.endsWith(".css")
          ? "text/css"
          : "text/javascript",
    );
    res.end(fs.readFileSync(file));
  } catch (_) {
    res.writeHead(500);
    res.end("Synthetic preview error");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log("Synthetic preview ready: http://127.0.0.1:" + server.address().port),
);
