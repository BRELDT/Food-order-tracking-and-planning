import fs from "node:fs";
const names = [
  "Validation",
  "Store",
  "Auth",
  "Audit",
  "Events",
  "Duplicates",
  "Referrals",
  "Reports",
  "Addresses",
  "AddressEntry",
  "Routing",
  "Schema",
  "Code",
];
let html = fs.readFileSync("apps-script/Admin.html", "utf8");
for (const name of ["AdminStyles", "AddressClient", "AdminClient"])
  html = html.replace(
    `<?!= include_('${name}'); ?>`,
    fs.readFileSync(`apps-script/${name}.html`, "utf8"),
  );
const modules = names
  .map((name) => {
    let code = fs.readFileSync(`apps-script/${name}.gs`, "utf8");
    if (name === "Code")
      code = code.replace(
        'HtmlService.createTemplateFromFile("Admin")\n      .evaluate()',
        "HtmlService.createHtmlOutput(ADMIN_PAGE_HTML_)",
      );
    return `// ===== ${name}.gs =====\n${code}`;
  })
  .join("\n");
const bundle = `// Build marker: COMMUNITY-MEALS-20261106-DELIVERY-PDF\n/* Community Meals V1 — generated from the modular files in this commit.\n   Install the ENTIRE file as Code.gs. No other .gs/.html files required.\n   Preserve existing Script Properties and deployment settings.\n   No setup or migration function needs to run. */\nconst ADMIN_PAGE_HTML_ = ${JSON.stringify(html)};\n\n${modules}`;
const target = "apps-script/CommunityMeals-OneFile.gs";
if (process.argv.includes("--check")) {
  if (fs.readFileSync(target, "utf8") !== bundle)
    throw new Error("One-file bundle differs from modular source");
} else {
  fs.writeFileSync(target, bundle);
  fs.writeFileSync("docs/community-meals-one-file-copy-paste.md", "# Complete Code.gs replacement\n\nCopy the entire contents of this single code box into Code.gs. This includes the backend and complete admin interface. No setup or migration function should be run. Address services and routing remain disabled until separately configured.\n\n```javascript\n" + bundle + "\n```\n");
}
console.log("One-file bundle matches modular source.");
