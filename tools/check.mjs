import fs from "node:fs";
import vm from "node:vm";
const files = fs
  .readdirSync("apps-script")
  .filter((f) => f.endsWith(".gs") && !f.startsWith("CommunityMeals-"));
for (const f of files)
  new vm.Script(fs.readFileSync("apps-script/" + f, "utf8"), { filename: f });
new vm.Script(fs.readFileSync("apps-script/AdminClient.html", "utf8"), {
  filename: "AdminClient",
});
for (const f of ["app.js", "address-entry.js", "submission-confirmation.js", "admin.js", "config.js"])
  new vm.Script(fs.readFileSync(f, "utf8"), { filename: f });
JSON.parse(fs.readFileSync("apps-script/appsscript.json", "utf8"));
const install = fs.readFileSync(".artifacts/apps-script/apps-script-installation.md", "utf8");
for (const f of [
  ...files,
  "Admin.html",
  "AdminClient.html",
  "AddressClient.html",
  "AdminStyles.html",
  "appsscript.json",
]) {
  const heading = new RegExp(
    "## File \\d+: " + f.replaceAll(".", "\\.") + "\\n",
  );
  const offset = install.search(heading);
  if (offset < 0) throw new Error("Missing installation file: " + f);
  const block = install.slice(offset).match(/```[^\n]*\n([\s\S]*?)```/);
  if (!block || block[1] !== fs.readFileSync("apps-script/" + f, "utf8"))
    throw new Error("Installation contents differ: " + f);
}
if (
  fs.readFileSync("styles.css", "utf8") !==
  fs.readFileSync("apps-script/AdminStyles.html", "utf8")
)
  throw new Error("Shared CSS differs");
const front = ["app.js", "admin.js", "config.js", "index.html", "admin.html"]
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");
if (/ADMIN_PASSWORD|ADMIN_USERNAME|mealAdminLoggedIn|AIza[\w-]+/.test(front))
  throw new Error("Unsafe frontend auth/key pattern");
console.log(
  "Syntax, manifest, shared styles and frontend credential checks passed.",
);

if (
  fs.readFileSync("address-entry.js", "utf8") !==
  fs.readFileSync("apps-script/AddressClient.html", "utf8")
)
  throw new Error("Shared address client differs");
new vm.Script(fs.readFileSync(".artifacts/apps-script/CommunityMeals-OneFile.gs", "utf8"));
