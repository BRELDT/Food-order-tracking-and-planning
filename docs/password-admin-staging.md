# Stage username sign-in

The owner signs in with Google to create the username and issue a setup code. The paramedic enters the code and chooses a password on the Apps Script page. A reset or disable action ends the current session. Use the existing admin page for Google sign-in.

## Set up a synthetic environment

1. Use a new restricted test Sheet with synthetic data and a separate Apps Script project. Enable the Sheets advanced service, set the development properties for this test Sheet, and initialize the test schema and Google admin allowlist. Use the one-file source or the modular files as a complete set. Keep the production deployments pinned during staging.
2. Create two deployments from the same staging project. The Google deployment executes as the accessing user and requires Google sign-in. The password deployment executes as the deploying owner and allows signed-out visitors. Both staging URLs must point to the same test data. Check the organization's policy if Google does not offer anonymous access.
3. Set these private Apps Script properties in the staging project.

   | Property | Value |
   | --- | --- |
   | `MEALS_PASSWORD_OWNER` | Exact email of the deploying owner. The same Google account must be an active admin in the test Sheet. |
   | `MEALS_PASSWORD_KEY` | Separate 32-byte random secret as lowercase hex. Generate privately with `openssl rand -hex 32` and enter it directly in Script Properties. |
   | `MEALS_PASSWORD_URL` | The password deployment's bare `https://script.google.com/macros/s/…/exec` URL. |
   | `MEALS_PASSWORD_LOGIN` | `true` for staging. |
   | `MEALS_PASSWORD_MAPS` | Leave unset initially. Manual address review and route ordering are available. |

4. Run the editor-only `setupPasswordColumns_` as the configured owner. It adds four headers to unused columns D–G of `ADMINUSERS` and preserves existing Google admin rows. If existing columns conflict, resolve that before proceeding. Retain the sheet's restricted sharing.
5. Open the Google deployment at `?page=admin` as the owner and use **Manage username accounts**. Issue a code for a synthetic username. Open the password URL at `?page=password` in a signed-out window, set a test password, and sign in. Keep credentials and setup codes in their intended pages and private channels.

## Release checks

- Verify that a signed-out browser can finish setup, sign in, create a **draft** synthetic event, sign out, and sign in again. Verify that a second non-owner Google admin can still use the Google dashboard and cannot provision local accounts.
- Check expired codes, resets, disabled users, expired sessions and signed-out calls on the real deployment. Check that dashboard data disappears on sign-out, and that prior requests cannot repopulate the screen. Confirm real Apps Script sign-in latency and quota use at the existing password work factor before exposing the new URL. Test simultaneous writes across deployments and review the Apps Script execution logs for sensitive data.
- Confirm owner approval for launch before updating a production deployment or adding `passwordAdminAppUrl` to the static site configuration. Install and test the updated Google owner interface before onboarding the paramedic. Keep the existing public endpoint on its reviewed version and leave the live event state closed.
- For rollback, set `MEALS_PASSWORD_LOGIN=false`, remove the public username sign-in link, and archive the new deployment if appropriate. Rotate the password key before re-enabling after a security rollback. Rotation invalidates session tokens and outstanding setup codes. Stored password verifiers remain usable. Provision new setup codes only if needed.

The release should use the same Apps Script project for the Google, public and username paths so writes to the same Sheet share a script lock. In production, open the password deployment as a signed-out user before adding the static link. Maps via the password path uses owner credentials and quotas, so enable it only after separate review.
