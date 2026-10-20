# Profile views

`/profile` is how other people see you: the **hero** (photo, name, joined
date, status, one "View public profile"), the **worker card**, and in the rail
the **next step** (only when something is pending) and **Visibility** (the
private profile switch). Email, phone and sign-in live on `/account`; the plan
lives on `/billing`.

`getProfileView({ workerPublishState, phoneVerified, isPrivate })` picks
the view from the API's `me.worker.publishState` (DRAFT, HIDDEN, PUBLISHED);
customers follow `settings.isProfilePrivate`; each view has one config file here and `index.ts` maps names to
configs. `components/ProfileScreen.tsx` renders the cards from the config.

Copy lives in `../i11n.json` (en + zh-HK).

| View | Who | Badge | Public link | Next step | Worker card |
|---|---|---|---|---|---|
| `customer` | No worker profile, profile public | Customer | View public profile | none | Invitation: Become a worker |
| `customerHidden` | No worker profile, profile private | Hidden | See what others see (your preview) | none | Invitation |
| `workerSetup` | `publishState` DRAFT (private or not) | Setup in progress | none (the draft is private) | Continue setup | The saved draft, not published, no Edit |
| `workerHidden` | `publishState` HIDDEN | Hidden | See what others see (your preview) | none | Live, badge Hidden, with Edit and to-dos |
| `workerVerifyPhone` | PUBLISHED, phone not verified | Action required | View public profile | Verify phone (to `/account#contact`) | Live |
| `workerReady` | PUBLISHED, phone verified | Worker active | View public profile | none | Live |

Precedence: draft, then hidden, then the phone. A hidden profile's link opens
`/profile/{id}`, where only its owner gets the preview with a hidden notice.

**Suspended** (any view, `useAccountSuspended`): read only. No photo or
details editing, no Edit, no next step, the switch is disabled.

**Loading and errors** belong to `AccountAuthGate` (the `(dashboard)` layout).

## The worker card's to-dos

`helpers/workerProfileTodos.ts` maps the API's `me.worker.profileGaps` (PHOTO,
HEADLINE, BIO, SKILLS, SERVICE_AREA, PORTFOLIO, in its order) to to-dos; no
rules are worked out on the client. The API uses the edit form's floors
(headline 10, bio 80, 3 skills), with the optional portfolio last.
The photo to-do opens the photo editor; the rest open the worker editor. The
phone is the `workerVerifyPhone` next step, not a to-do.

## Editing

`ProfileEditDrawer` sections: `photo`, `personal` (display name, private date
of birth) and `worker` (finished workers only; unfinished ones edit in worker
setup). The worker editor saves a finished profile with one
`updateWorkerProfile`; a DRAFT keeps worker setup's `saveWorkerSetupStep`
calls. API codes show worker setup's copy (`serverErrors`), with this page's
own line for WORKER_SETUP_INCOMPLETE. Portfolio links: https, up to 2,048
characters, at most 12 (shared with worker setup). The form errors come from `createProfileApiFormSchema` /
`createWorkerFormSchema` with this page's copy. The worker editor reuses worker
setup's inputs (bio composer, categories, skills, qualifications, portfolio),
which stay English until FE-296.

`?section=worker` and `?section=visibility` (or a matching `#hash`) scroll to
that card.

## Stories

`components/ProfileScreen.stories.tsx`: one per view, suspended, zh-HK,
phone, and the worker editor open. Cards have their own:
`ProfileIdentityHero`, `WorkerProfileCard`, `ProfileSidebarCards`.
