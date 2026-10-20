# Plan & billing views

`/billing` shows **one plan card** in a 720px column: title and badge, one
sentence with the date that matters, the free quota meter when it applies, the
price, and one button. Under it: job payments are arranged directly (Slashie
never handles them) and **Compare plans** (`/pricing`).

`getBillingView({ worker, pricing, checkout })` picks the view from the API's
membership flags (the same `hasUnlimitedQuotes` / `canUpgrade` /
`canStartTrial` that `/pricing` reads) plus the Checkout return. The Stripe
status only tells apart what the flags can't: trial vs paid, payment trouble,
paused, unfinished. Each view has one config file here; `index.ts` maps names
to configs and `components/ui/BillingPlanCard.tsx` renders them.

Copy lives in `../i11n.json` (en + zh-HK). Price and trial come from the
Pricing query (`pricingTrialLength`, `pricingPriceLine`), never the API's
English `trialLabel`. A plan billed every few months (`priceIntervalCount` > 1)
reads "£54 every 3 months" (zh-HK "每 3 個月 £54") in place of "/ month".

| View | When | Badge | Body | Meter | Price line | Button |
|---|---|---|---|---|---|---|
| `customer` | No worker profile | none | Plans are for workers | no | no | Become a worker |
| `workerSetup` | Worker setup unfinished | none | Plans start after setup | no | no | Finish setup |
| `loading` | Free plan, price still loading | Free | Quote on 3 new tasks a month... | yes | placeholder | none |
| `priceUnavailable` | Free plan, price failed | Free | Couldn't load the price | yes | no | Try again |
| `free` | Free, trial on offer (`canStartTrial`) | Free | Quote on 3 new tasks a month... | yes | 6 months free, then £19.99 / month | Start free trial |
| `lapsed` | Free after a subscription (`canUpgrade`, no trial) | Free | Ended on {date} | yes | £19.99 / month | Resubscribe |
| `trialing` | `TRIALING` | Trial | Free until {date} | no | Then £19.99 / month | Manage billing + "Cancel anytime in Manage billing." |
| `subscribed` | `ACTIVE` | Active | Renews on {date} | no | £19.99 / month | Manage billing |
| `cancelling` | Unlimited with `cancelAtPeriodEnd` | Ending | Unlimited quotes until {date} | no | no | Keep Slashie Unlimited (portal) |
| `paymentProblem` | `PAST_DUE` or `UNPAID` | Payment problem | Quoting is paused until it's fixed | no | no | Fix payment (portal) |
| `paused` | `PAUSED` | Paused | Open Manage billing to resume | no | no | Manage billing |
| `incomplete` | `INCOMPLETE` | Not finished | Checkout didn't finish | no | no | Check again (re-sync) |
| `activating` | Back from Checkout, Stripe not confirmed yet | Activating | Usually a few seconds (spinner) | no | no | none, so no second Checkout |
| `activationDelayed` | Still not confirmed after about 16 seconds | Activating | Taking longer than usual | no | no | Check again |

Precedence: customer, then the Checkout return (while not yet unlimited), then
unlimited states, then payment / paused / unfinished, then setup, then the
price, then free vs lapsed.

## Checkout and the portal

- `useBillingActions` starts hosted Checkout or opens the portal (no
  Stripe.js). Return URLs keep the language (`/zh-hk/billing`) and say how
  Checkout ended: `?checkout=success` or `?checkout=cancelled` (the API only
  checks the origin).
- `useCheckoutReturn` handles the return: cancelled shows a toast; success
  polls `syncWorkerBilling` every 2 seconds, 8 times, then `delayed`.
- Loading and "couldn't load your account" belong to `AccountAuthGate`.

## Stories

`components/BillingScreen.stories.tsx`: every view the screen reaches with
canned data, zh-HK and phone. `BillingPlanCard.stories.tsx`: the Checkout
states and missing dates.
