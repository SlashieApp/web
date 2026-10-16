# Worker setup views

`/worker/setup` (FE-296): someone becomes a worker. Six screens in the
step-flow shell (`StepFlowHeader`, `StepFlowLayout`: a rail on desktop, a
progress strip on phones). Product rules: wiki
`01-Product/Worker-Setup-Page.md`.

`getWorkerSetupView({ status, screen })` picks the view; each has one config
file here and `index.ts` maps names to configs (`WORKER_SETUP_VIEWS`).
`components/ui/shared/WorkerSetupAuthGate` asks about the session,
`components/WorkerSetupScreen` about the rest. A screen's config lists the API
sub-steps it saves (in order), the sections it renders
(`components/ui/steps/WorkerSetupStepContent`) and its button. Copy lives in
`../i11n.json` (en + zh-HK).

| View | Who, when | Shows | Saves | Button |
|---|---|---|---|---|
| `setup.signIn` | Signed out, or the session expired | none: log in, then back here with `?next` | | |
| `setup.loading` | The account or the setup record is loading | Splash | | |
| `setup.loadError` | The setup record didn't load (in the gate: the account) | We couldn't load your setup | | Try again, Leave setup |
| `setup.complete` | Already a worker | Splash while sent to `?next`, else `/profile` | | |
| `setup.about` | Step 1 | First and last name, date of birth (private, 18 or over), profile photo | `profile.details`, `profile.photo` | Continue |
| `setup.work` | Step 2 | Main trade, skills (3 to 12, the trade's suggestions), years of experience, qualifications (optional) | `services.skills`, `services.experience` | Continue |
| `setup.profile` | Step 3 | Headline (starts from the trade and years), bio, work photos (optional) | `profile.bio`, `verify.portfolio` | Continue |
| `setup.area` | Step 4 | Town or postcode, an approximate map and the town customers see, travel distance (optional: 5, 10, 15, 25 or 50 miles) | `area.location`, `area.travel` | Continue |
| `setup.phone` | Step 5 | Verify a phone (the API won't finish setup without one) | `verify.phone` | Continue |
| `setup.review` | Step 6 | Profile strength with links to fix gaps, the profile as customers see it, notes | `review.submit` | Start quoting |

Precedence: the session, then the record (loading, failed, complete), then
the screen.

## How it moves

- It opens at the first screen not done, in this order (`resumeScreen`). A
  screen is done when its required sub-steps are saved; travel distance and
  work photos are optional, as in the API, which takes sub-steps in any order.
- Continue checks the screen (`validateWorkerSetupScreen`), saves its
  sub-steps in order and opens the next screen; the new title takes focus. A
  problem scrolls to and focuses the first field with an error, and editing a
  field clears only its error.
- The rail opens done screens and the next one; Back goes one screen back
  without saving. What the worker typed stays in the form across screens:
  saves don't reload it from the API.
- The headline starts from the suggestion when the profile screen opens
  empty; "Use …" puts the suggestion back.
- Start quoting finishes setup and goes back to `?next` (a task to quote) or
  home, with a toast. When the email isn't verified the toast says that's
  next, since quoting needs it.
