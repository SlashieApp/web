# Account views

`/account` is where you stay reachable and safe: **Contact**, **Sign-in and
security**, **Notifications and language**, then **Delete account**, in one
720px column. How other people see you lives on `/profile`; your plan lives
on `/billing`.

`getAccountView({ suspended, hasPassword })` picks the view; each view has one
config file in this folder and `index.ts` maps names to configs.
`components/AccountScreen.tsx` renders the sections from the config; the
section cards hold no viewer logic.

Copy lives in `../i11n.json` (en + zh-HK). The contact rows and their dialogs
have their own bags (`components/ui/contact/i11n.json`,
`components/ui/verification/i11n.json` in `(dashboard)`).

| View | Who | Rows can change | Password row | Delete account |
|---|---|---|---|---|
| `password` | Signs in with email and password (Google or Apple may be linked too) | yes | yes: "Change password" emails a reset link (email handed over in sessionStorage) | yes |
| `social` | Google or Apple only | yes | no; the email row says it comes from the provider | yes |
| `suspended` | `me.disabled`, or a request failed with ACCOUNT_DISABLED | no: no buttons, switches off | no | no (the API refuses it) |

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
| `emailLocked` | Verified email on a Google / Apple-only account | Verified | none; "Comes from your Google sign-in." |
| `emailUnverified` | Email not confirmed | Not verified | Verify (sends the link) |
| `emailPending` | A new email waits for its link | none | Resend link, Cancel change |
| `phoneMissing` | No number saved | none | Add phone |
| `phoneUnverified` | Number saved, not confirmed | Not verified | Verify (texts a code) |
| `phoneVerified` | Number confirmed | Verified | Change (code to the new number) |
| `phonePending` | A new number waits for its code | none | Enter code, Cancel change |

## Stories

`components/AccountScreen.stories.tsx`: one per view, plus a worker, zh-HK
and a phone viewport. `ContactRows.stories.tsx`: one per row view, read-only
and zh-HK.
