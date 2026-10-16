# Login views

`/login` shows one view at a time. `getLoginView({ session, retryInSeconds,
securityCheckRequired })` picks it; each view has one config file in this
folder (sign-in column or splash, security check, primary action) and
`index.ts` maps names to configs. `components/LoginScreen.tsx` holds the state
and `components/LoginPanel.tsx` only renders the config, inside the shared
auth shell and card (`components/ui/AuthShell`, `AuthCard`) every auth page
uses.
`LoginPanel.stories.tsx` has a story per view, message and notice.

Customer, worker and owner see the same page and land in the same place, so
views are states, not roles. Copy lives in `../i11n.json` (en + zh-HK).

| View | Who / when | Shows | Primary action |
|---|---|---|---|
| `checkingSession` | The request has a session cookie (read on the server, so the form never flashes). Leaves for `next` (or /search) when the session is valid; falls back to `signIn` when it isn't. | Session splash ("Just a moment…") | none |
| `signIn` | Signed out. | The sign-in card: Google, Apple, email form; Create account under it | Log in |
| `securityCheck` | Third failed attempt in this tab, or the API answered `CAPTCHA_REQUIRED` / `CAPTCHA_FAILED`. | `signIn` plus the security check (Turnstile) | Log in, enabled once the check is solved |
| `rateLimited` | The API answered `LOGIN_RATE_LIMITED` or `LOGIN_LOCKED` with `retryAfterSeconds`, until the countdown ends. | `signIn` | "Try again in {seconds}s" (disabled) |

## Messages

The line above the main button after a failed attempt, from
`loginMessageFor(error)`. It stays until the next attempt. Shared messages
are worded once in `../../components/i11n.json` (`messages`) and used by
every auth form.

| Message | When | Copy |
|---|---|---|
| `invalidCredentials` | `INVALID_CREDENTIALS` | Email or password is incorrect. |
| `securityCheckRequired` | `CAPTCHA_REQUIRED` | Complete the security check to continue. (shared) |
| `securityCheckFailed` | `CAPTCHA_FAILED` | Security check failed or expired. Complete it again and retry. (shared) |
| `rateLimited` | `LOGIN_RATE_LIMITED`, `LOGIN_LOCKED` | Too many attempts right now. Please wait a bit and try again. (shared) |
| `networkError` | The request never reached the API (fetch failed, bad gateway). | Can't reach Slashie. Check your connection and try again. (shared) |
| `failed` | Anything else. | Login failed. |

## Notices

From the link that brought them here, shown above the sign-in options in
every form view.

| Notice | Link | Copy |
|---|---|---|
| Deletion scheduled | `?deletion=YYYY-MM-DD` (after requesting deletion) | Your account will be deleted on {date}. Sign in before then to restore it. |
| Deletion scheduled, no date | `?deletion=1` | Your account will be deleted in 30 days. Sign in before then to restore it. |
| Restore | `?restore=1` (deletion emails) | Sign in to restore your account. You'll be asked to confirm. |

## After sign-in

Email sign-in goes to `next` (validated, same-origin only) or /search. Google
and Apple go through `resolvePostAuthRedirect` (unverified emails to
/verify-email/sent) until FE-304 replaces that with the verification code
popup (blocked by BE-84). A suspended account signs in and sees the suspended
banner; an account waiting for deletion signs in to the app-wide restore
screen.
