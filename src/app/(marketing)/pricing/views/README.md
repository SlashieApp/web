# Pricing views

`/pricing` shows the hero (FE-552: its heading is the page's one h1), the plans
section with the two plan cards, Free and Slashie Pro, "how quotes count" and
the FAQ, in the marketing frame (`components/PricingPageView.tsx`; the layout is
described in `components/ui/landing/README.md`, Pricing page). The cards depend
on who's looking, so they come from one view at a time.
`getPricingView({ available, session, worker })` picks it, each view has one
config file in this folder (which card is "Your plan", what the paid card says,
each card's button), and `index.ts` maps names to configs.

- `components/PricingPlans.tsx` works out the input: the session cookie read
  on the server, then the signed-in profile (`me`). With a session, buttons are
  placeholders until the profile loads, so a worker never sees a customer's
  button first. It also formats the one date the paid card names (when a trial
  ends, or when a plan ends), as Billing writes dates.
- `components/ui/plan/PricingPlanCards.tsx` only renders the config. The paid
  card's `paid` line is the trial, the price, or where the worker's plan
  stands, in Billing's words (FE-290), so the two pages agree. The buttons are
  links, or the client islands that do what Billing's buttons do:
  `PricingCheckoutButton` (Checkout), `PricingPortalButton` (the Stripe portal:
  Keep Slashie Pro, Fix payment) and `PricingSyncButton` (Check again). The
  paid plan's button is the green `primary` pill and carries
  `data-page-green-action` (the page's one main action; the marketing header's
  Get started yields to it while it is on screen); Free's is outline. Plum is
  that card's title and hairline.
- Membership comes from the API's flags (`hasPro`, `canUpgrade`,
  `canStartTrial`, `canManageBilling`, `cancelAtPeriodEnd`) and the status only
  where the flags can't tell (a trial, payment trouble, paused, unfinished), in
  the same order as Billing's `getBillingView`.
- Prices, the trial length (`trialDays`) and the free allowance
  (`freeQuotesPerMonth`) come from the `pricing` query; all words come from
  `../i11n.json` (en + zh-HK). The trial claim shows only on `paid: 'trial'`
  and when the API reports a trial, with the price after it in ink and "Card
  needed to start" (Checkout asks for one). The interval follows
  `priceIntervalCount`: one is "/ month"; more is "every 3 months" (zh-HK
  "每 3 個月"). Free always reads per one interval.
- Under the cards: "You pay by card through Stripe." The cancel line on the
  card and in the FAQ names the page: Plan & billing (方案與帳單).
- `PricingPlanCards.stories.tsx` has a story per view; `PricingPlans.stories.tsx`
  covers the session wiring.

| View | Who / when | Free card | Paid card | Paid line |
|---|---|---|---|---|
| `unavailable` | The API returned no plans (anyone). | "Pricing isn't loading": Try again (green), Browse tasks (link). No FAQ. | | |
| `checkingSession` | Session cookie; profile still loading. | placeholder | placeholder | trial |
| `guest` | No session. | Become a worker: sign up, then /worker/setup | Start free trial: sign up, then /worker/setup?next=/pricing | trial |
| `customer` | Signed in, no worker profile (FE-591). | no button | Become a worker (green): /worker/setup?next=/pricing | trial, then "Slashie Pro for customers is coming soon." in place of the card line |
| `workerSetup` | Worker profile not finished. | Your plan | Finish worker setup | trial |
| `workerFree` | `canUpgrade` and `canStartTrial` (never subscribed). | Your plan | Start free trial (Checkout) | trial |
| `workerLapsed` | `canUpgrade` without `canStartTrial`. | Your plan | Resubscribe (Checkout) | price |
| `workerTrialing` | Slashie Pro, `TRIALING`. | | Your plan; Manage billing: /billing | price, "Free until {date}." |
| `workerUnlimited` | Slashie Pro that renews. | | Your plan; Manage billing: /billing | price |
| `workerCancelling` | Slashie Pro with `cancelAtPeriodEnd` and a Stripe plan. | | Your plan; Keep Slashie Pro (portal) | "Ends {date}" |
| `workerGivenUntil` | Slashie Pro given by Slashie until a date (no Stripe plan, BE-119). | | Your plan; Keep Slashie Pro (Checkout, first charge on that date) | "Ends {date}" |
| `workerGiven` | Slashie Pro given by Slashie with no end (BE-117). | | Your plan; no button | "Given by Slashie", "Unlimited quotes, with no end date." |
| `workerPaymentProblem` | `PAST_DUE` or `UNPAID`. | | Your plan; Fix payment (portal) | "Payment problem", Billing's line |
| `workerPaused` | `PAUSED`. | | Your plan; Manage billing: /billing | "Paused", Billing's line |
| `workerIncomplete` | `INCOMPLETE` (Checkout didn't finish). | Your plan | Check again (re-sync) | "Not finished", Billing's line |
| `workerBilling` | Anything else that can't start Checkout. | Your plan | Manage billing: /billing | price |

A worker with Slashie Pro sees it as their plan even with an unfinished
profile; payment trouble, paused and unfinished Checkout come before the setup
check, as on Billing.

Route loading is `../loading.tsx` (header, two card skeletons, FAQ rows).

## FAQ

Same for everyone: customers, free quotes, Slashie Pro, payments, the trial
(only when the API reports one), cancelling (in Plan & billing); then a Terms
link.
