# Public profile views

`/profile/[userId]` is the one public page for every user: what a customer
checks before accepting a quote, and what a worker sees of a customer. Product
rules: wiki `01-Product/Unified-Public-Profile.md` (founder lock) and
`Worker-Public-Profile-Page.md` (worker block).

`getPublicProfileView({ query, profile })` picks the view from the
PublicProfile query, `isSelf`, `isHidden`, the user type and the API's
`worker.viewer.contactAction`. A private profile is null for everyone but its
owner, who gets it with `isHidden: true`. Each view has
one config file here; `index.ts` maps names to configs and
`components/PublicProfileScreen.tsx` renders them. Copy lives in `../i11n.json`
(en + zh-HK).

| View | Who sees it, when | Shows | Main action |
|---|---|---|---|
| `loading` | First load, nothing cached | Skeleton in the page's shape | none |
| `loadError` | Query failed, nothing cached | Could not load this profile | Try again |
| `unavailable` | No profile: private, suspended, banned, deleting, deleted or an unknown id (noindex) | Profile unavailable | Back to search |
| `worker.guest` | Signed out, worker profile | Hero, stats, worker sections, Trust; Save asks to sign in | Sign in to contact {name} |
| `worker.visitor` | Signed in, no quote or job with them (`ACCEPT_QUOTE_FIRST`) | Same, plus Leave a review when eligible | Post a task |
| `worker.quoted` | They quoted on your open task (`OPEN_QUOTE`) | Same | View {name}'s quote (`#task-quotes`) |
| `worker.booked` | You have a booked job with them (`OPEN_TASK`) | Same | Open your job |
| `worker.owner` | Your own worker profile | Owner bar, the visitor body without Save, review, contact or Report, then Your activity | Edit profile (owner bar) |
| `worker.ownerHidden` | Your own worker profile while it is private (`isHidden`) | `worker.owner` under a hidden notice ("Your profile is hidden") instead of the owner bar | Profile settings (`/profile?section=visibility`) |
| `customer.visitor` | Anyone else, customer profile | Hero, stats, Open tasks (with budget), Reviews; 720px column | none (task cards) |
| `customer.owner` | Your own customer profile (or a worker before setup is done) | Owner bar, the visitor body, then Your activity | Edit profile (owner bar) |
| `customer.ownerHidden` | Your own customer profile while it is private | `customer.owner` under the hidden notice | Profile settings |

Precedence: query state, then no profile, then your own profile (hidden or
not), then customer, then the worker's contact state. A quote or job with no task id
falls back to `worker.visitor`.

## Inside a view

- **Stats strip:** rating (average from 3 reviews, else the count), jobs done
  (`worker.completedJobsCount`), bookings completed (customers,
  `hostedCompletedCount`), years' experience, open tasks (customers), joined.
  Counts come from the API's totals, not list lengths. Cells without a value
  are left out (`profileStats`).
- **Sections:** listed in order per view. Empty ones are left out unless the
  view keeps their empty state (`keepEmpty`: Reviews everywhere, Open tasks on
  customer profiles), so the owner sees exactly what visitors see
  (`visibleSections`).
- **Leave a review:** in `heroActions` for signed-in visitors; it renders only
  when `worker.viewer.canLeaveReview` and the API names the job
  (`reviewTaskId` and `reviewOrderId`), linking to `reviewFormPath`.
- **Reviews:** each shows the author's first name and photo and the job title;
  a deleted or unnamed author reads "A Slashie user", and a missing job title
  is left out.
- **Work on Slashie:** plain rows (the newest 100); the count is the API's
  total. Completed tasks open only for the two people on them.
- **Long lists:** reviews and completed jobs show 5, then Show all.
- **Phone:** one column; the main action and its helper line sit in a bar above
  the bottom nav instead of the sidebar card.

## Stories

`components/PublicProfileScreen.stories.tsx`: one story per view, plus review
counts, long lists, a day-one worker, a worker who also hosts, zh-HK and phone.
`components/ui/PublicProfileAchievements.stories.tsx`: the owner's activity.
