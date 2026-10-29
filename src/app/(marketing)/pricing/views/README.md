# Pricing views

`/pricing` shows the page header (FE-458: Back and a large "Membership" that
shrinks into the bar on scroll, as Account and Plan & billing do; it is the
page's one h1), the plans section (its head "Simple plans. Clear quotes.", an
h2, and the two plan cards, Free and Slashie Unlimited) and the FAQ, in the
marketing frame (FE-471: `components/PricingPageView.tsx`; the layout is described
in `components/ui/landing/README.md`, Pricing page). The cards depend on who's
looking, so they come from one view at a time. `getPricingView({ available, session, worker })` picks it, each view
has one config file in this folder (which card is "Your plan", whether
Unlimited leads with the trial, each card's button), and `index.ts` maps names
to configs.

- `components/PricingPlans.tsx` works out the input: the session cookie read
  on the server (`hasSession`), then the signed-in profile (`me`). With a
  session, buttons are placeholders until the profile loads, so a worker never
  sees a customer's button first.
- `components/ui/plan/PricingPlanCards.tsx` only renders the config, plus the
  store purchases note under the cards (`plans.purchasesNote`), the same in
  every view. `PricingCheckoutButton` is the one client island that starts
  Checkout. The paid plan's button (a link or the checkout button) is the green
  `primary` pill and carries `data-page-green-action` (the page's one main
  action; the marketing header's Get started yields to it while it is on
  screen); Free's is outline. Plum is that card's label and hairline.
- Membership comes from the API's flags (`hasUnlimitedQuotes`, `canUpgrade`,
  `canStartTrial`), never the Stripe status, so pricing offers exactly what
  /billing would.
- Prices, the trial length (`trialDays`) and the free allowance
  (`freeQuotesPerMonth`) come from the `pricing` query; all words come from
  `../i11n.json` (en + zh-HK). The trial claim only shows when the config says
  `trial` and the API reports a trial. The interval follows
  `priceIntervalCount`: one is "/ month"; more is "every 3 months" (zh-HK
  "每 3 個月"), in the cards, the FAQ, /billing and the /home teaser. Free
  always reads per one interval.
- `PricingPlanCards.stories.tsx` has a story per view; `PricingPlans.stories.tsx`
  covers the session wiring.

"Pro" and "Unlimited" are the same plan (one API product), so there's one
Unlimited card.

| View | Who / when | Free card | Unlimited card | Trial claim |
|---|---|---|---|---|
| `unavailable` | The API returned no plans (anyone). | "Pricing isn't loading": Try again (/pricing), Browse tasks (/search). No FAQ. | | |
| `checkingSession` | Session cookie; profile still loading. | placeholder | placeholder | yes |
| `guest` | No session. | Get started: sign up, then /worker/setup | Start free trial: sign up, then /worker/setup?next=/pricing | yes |
| `customer` | Signed in, no worker profile. | Become a worker: /worker/setup | Start free trial: /worker/setup?next=/pricing | yes |
| `workerSetup` | Worker profile not finished (can't quote yet). | Your plan | Finish worker setup: /worker/setup?next=/pricing | yes |
| `workerFree` | `canUpgrade` and `canStartTrial` (never subscribed). | Your plan | Start free trial (Checkout) | yes |
| `workerLapsed` | `canUpgrade` without `canStartTrial` (ended, or checkout expired). | Your plan | Resubscribe (Checkout) | no, the price |
| `workerUnlimited` | `hasUnlimitedQuotes` (trial, active, or cancelling with time left). Wins over an unfinished profile. | | Your plan; Manage billing: /billing | no, the price |
| `workerBilling` | Neither (past due, unpaid, paused, incomplete). Billing fixes it; never a second Checkout. | Your plan | Manage billing: /billing | no, the price |

Route loading is `../loading.tsx` (header, two card skeletons, FAQ rows).

## FAQ

Same for everyone: customers, free quotes, Slashie Unlimited, payments, the
trial (only when the API reports one), cancelling; then a Terms link.
