# Profile views

`/profile` is how other people see you: the **hero** (photo, name, joined
date, status, one "View public profile"), the **worker card**, and in the rail
the **next step** (only when something is pending) and **Visibility** (the
private profile switch). Email, phone and sign-in live on `/account`; the plan
lives on `/billing`.

`getProfileView({ hasWorker, setupComplete, phoneVerified, isPrivate })` picks
the view; each view has one config file here and `index.ts` maps names to
configs. `components/ProfileScreen.tsx` renders the cards from the config.

Copy lives in `../i11n.json` (en + zh-HK).

| View | Who | Badge | Public link | Next step | Worker card |
|---|---|---|---|---|---|
| `customer` | No worker profile, profile public | Customer | yes | none | Invitation: Become a worker |
| `customerHidden` | No worker profile, profile private | Hidden | no (nothing to open) | none | Invitation |
| `workerSetup` | Worker setup not finished (private or not) | Setup in progress | no (the draft is private) | Continue setup | The saved draft, not published, no Edit |
| `workerHidden` | Finished worker, profile private | Hidden | no | none | Live, with Edit and to-dos |
| `workerVerifyPhone` | Finished, public, phone not verified | Action required | yes | Verify phone (to `/account#contact`) | Live |
| `workerReady` | Finished, public, phone verified | Worker active | yes | none | Live |

Precedence: unfinished setup, then private, then the phone.

**Suspended** (any view, `useAccountSuspended`): read only. No photo or
details editing, no Edit, no next step, the switch is disabled.

**Loading and errors** belong to `AccountAuthGate` (the `(dashboard)` layout).

## The worker card's to-dos

`helpers/workerProfileTodos.ts` lists what a finished worker could still add,
by the same floors as the setup and edit forms: photo, headline (10+
characters), bio (80+), 3+ skills, service area, then portfolio (optional).
The photo to-do opens the photo editor; the rest open the worker editor. The
phone is the `workerVerifyPhone` next step, not a to-do.

## Editing

`ProfileEditDrawer` sections: `photo`, `personal` (display name, private date
of birth) and `worker` (finished workers only; unfinished ones edit in worker
setup). The form errors come from `createProfileApiFormSchema` /
`createWorkerFormSchema` with this page's copy. The worker editor reuses worker
setup's inputs (bio composer, categories, skills, qualifications, portfolio),
which stay English until FE-296.

`?section=worker` and `?section=visibility` (or a matching `#hash`) scroll to
that card.

## Stories

`components/ProfileScreen.stories.tsx`: one per view, suspended, zh-HK,
phone, and the worker editor open. Cards have their own:
`ProfileIdentityHero`, `WorkerProfileCard`, `ProfileSidebarCards`.
