# Account views

`/account` is where you stay reachable and safe: **Contact**, **Sign-in and
security**, **Notifications and language**, then **Delete account**, in one
720px column. How other people see you lives on `/profile`; your plan lives
on `/billing`.

`getAccountView({ suspended, hasPassword })` picks the view; each view has one
config file in this folder and `index.ts` maps names to configs. The view's
`passwordForm` says which password dialog the Password row opens.
`components/AccountScreen.tsx` renders the sections from the config; the
section cards hold no viewer logic.

Copy lives in `../i11n.json` (en + zh-HK). The contact rows and their dialogs
have their own bags (`components/ui/contact/i11n.json`,
`components/ui/verification/i11n.json` in `(dashboard)`).

| View | Who | Rows can change | Password row | Delete account |
|---|---|---|---|---|
| `password` | Signs in with email and password (Google or Apple may be linked too) | yes | "Change password": current, new and confirm (`changePassword`) | yes |
| `social` | Google or Apple only | yes | "Set a password": new and confirm (`setPassword`, needs a sign-in from the last 10 minutes); the email row says to add a password before changing the email | yes |
| `suspended` | `me.disabled`, or a request failed with ACCOUNT_DISABLED | no: no buttons, switches off | no button | no (the API refuses it) |

## Sign-in and security

One row per way in, then This device (Log out):

| Row | Shows | Action |
|---|---|---|
| Password | "Sign in with {email} and your password." or "Not set yet." | Change password / Set a password (dialog) |
| Google / Apple, linked | "Linked as {provider address}" (`googleLoginEmail` / `appleLoginEmail`; an Apple Hide My Email relay shows the same way). Not the account email | Unlink (confirm dialog, `unlinkLoginMethod`) |
| Google / Apple, not linked | "Not linked" | Link (dialog with the provider's own button in token mode, `linkLoginMethod`; no sign-in, the session and the account email stay) |

Link is hidden when that provider isn't configured. Link and unlink errors
come from `methods.errors` by code: LAST_LOGIN_METHOD (set a password or keep
the other provider), OAUTH_ACCOUNT_CONFLICT, INVALID_OAUTH_TOKEN,
LOGIN_METHOD_NOT_SUPPORTED, APPLE_EMAIL_REQUIRED. Password errors come from
`password.errors`: WEAK_PASSWORD, PASSWORD_UNCHANGED, PASSWORD_NOT_SET,
PASSWORD_ALREADY_SET, INVALID_CREDENTIALS, REAUTH_REQUIRED. On REAUTH_REQUIRED
the set-password dialog offers a fresh Google / Apple sign-in that returns to
`/account?password=set` and reopens it (like Delete account). Every success
writes the returned login methods into the store's `me`.

## Delete account

`me.deletionBlockers` lists live bookings. While it has any, Delete account
opens "Finish your live bookings first" with a link per booking ("Booking 1",
to `/tasks/{taskId}#task-order`) and never calls the API. Otherwise the
confirm dialog runs as before; ACCOUNT_HAS_LIVE_ORDERS stays as the fallback.

Log out and Language work in every view. The app-wide suspended banner
explains the suspension.

## States the page doesn't own

Loading and "couldn't load your account" belong to `AccountAuthGate` (the
`(dashboard)` layout): the page only renders once `me` is there. See the gate
stories `Loading` and `LoadFailed`.

## Contact rows

`components/ui/contact/contactRowView.ts` picks what each row shows; the rows
are shared with worker setup's phone step.

| Row view | When | Badge | Action |
|---|---|---|---|
| `emailVerified` | Verified email on an account with a password | Verified | Change (password + link to the new address) |
| `emailLocked` | Verified email on a Google / Apple-only account | Verified | none; "To change this email, add a password under Sign-in and security first." |
| `emailUnverified` | Email not confirmed | Not verified | Verify (sends the link) |
| `emailPending` | A new email waits for its link | none | Resend link, Cancel change |
| `phoneMissing` | No number saved | none | Add phone |
| `phoneUnverified` | Number saved, not confirmed | Not verified | Verify (texts a code) |
| `phoneVerified` | Number confirmed | Verified | Change (code to the new number; password accounts confirm with their password, others need a recent sign-in) |
| `phonePending` | A new number waits for its code | none | Enter code, Cancel change |

## Stories

`components/AccountScreen.stories.tsx`: one per view, plus linked providers,
a worker, zh-HK and a phone viewport. `AccountPasswordDialog`,
`LoginMethodDialogs`, `DeleteAccountDialog` and `DeleteAccountSection` have
their own (including the blocked-by-bookings state). `ContactRows.stories.tsx`: one per row view, read-only
and zh-HK.
