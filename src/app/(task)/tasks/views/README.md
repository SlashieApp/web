# My Tasks views

`/tasks` lists the tasks you posted (Hosted) and the tasks you quoted on
(Quoted), like Uber's Activity screen: **Upcoming**, then **Open**, then
**Past**. There is no separate "Needs you" group: what a task waits on you
for is its button. A worker who can't quote right now sees a "Before you can
quote" strip above the list. `getMyTasksView({ hasTasks, hasMatches,
loading, failed, filtered })` picks what the list column shows; each view has
one config file in this folder (filters on or off, body, message, buttons)
and `index.ts` maps names to configs.

- `components/MyTasksScreen.tsx` runs the queries, keeps search, Category and
  Hosted / Quoted in the URL (`?q=&category=&role=`) and picks the view. One
  list column in the page container (the header's width, `PAGE_CONTAINER_MAX_W`,
  FE-453). From `lg` up the filters sit in a rail to its left, at its own
  width, and the list takes the rest; below `lg` they are the icon by the
  title and its drawer, and the list fills the container.
- `components/ui/MyTasksList.tsx` renders the config and the sections;
  `MyTaskCard` is one task (a card or a compact row).
- Filters: `MyTasksFiltersRail` (desktop rail), `MyTasksFilters` (icon and
  drawer below `lg`) and `MyTasksFilterFields` (the Search, Show and Category
  controls both use).
- Sections, order and buttons come from `helpers/myTasksHub.ts`
  (`buildMyTasksHub`).
- The strip comes from `helpers/quoteBlocker.ts` (`MyTasksQuoteBlocker`).
- The Category choices come from `me.hubTaskCategories`
  (`graphql/MyTaskCategories.gql`, `helpers/useMyTaskCategories.ts`).
- Stories: `MyTasksScreen.stories.tsx` (the whole page at desktop, tablet and
  phone width), `MyTasksList.stories.tsx` (one per view, plus the sections),
  `MyTaskCard.stories.tsx`, `MyTasksFilters.stories.tsx`,
  `MyTasksFiltersRail.stories.tsx`, `MyTasksFilterFields.stories.tsx`.

Copy lives in `../i11n.json` (en + zh-HK).

| View | When | Filters | Shows | Buttons |
|---|---|---|---|---|
| `loading` | First load, nothing to show yet. | no | 3 card placeholders | none |
| `searching` | New filters are loading and nothing matches yet. | yes | 3 card placeholders | none |
| `error` | The lists failed with nothing cached. | no | "Could not load your tasks" + the reason | Try again |
| `empty` | No posted tasks and no quotes. | no | "No tasks yet" | Post a task, Browse tasks |
| `noMatches` | Search or filters leave nothing. | yes | "No matching tasks" | Clear filters |
| `list` | There are rows to show (a failed refresh keeps them, with Try again above). | yes | The sections | none |

"Filters: no" hides the icon and the rail until there is something to
search. On desktop the list column keeps the rail's room during `loading`, so
it doesn't jump right when the rail appears; `empty` and `error` have no rail
and use the whole container.

## Who sees what

Guests never reach the page: `AccountAuthGate` sends them to log in.

| Viewer | Rows | Filters |
|---|---|---|
| Customer only | Hosted rows | Search, Category |
| Worker only | Quoted rows | Search, Category |
| Posts and quotes | Both | Search, Show (posted or quoted), Category |

## The sections

| Section | Rows | Order | Looks |
|---|---|---|---|
| Upcoming | Hosted tasks with a booking, and quotes that won, not finished (a CONFLICT still counts) | Soonest first by the booked start; untimed last | Cards: the day ("Today", "Tomorrow", "On Wednesday" for 2 to 6 days out, "Thu 5 Nov", "Overdue" in red once the day has passed, "Before 5 Nov" or "Flexible"), the title, then "28 Oct, 16:25 · area · price" |
| Open | Your open tasks, and your pending quotes on open tasks nobody else won | Soonest first by the task's time; flexible last | Rows: photo (or a category icon), the title, "3 quotes · £60" or "Quote sent · £75" |
| Past | Completed, cancelled, didn't go ahead (both marked Failed), your pending quote on a task someone else booked or finished (Booked by someone else, Task completed), and anything else that is over (Closed: your quote closed) | Newest first by when the booking closed, else when you quoted, else when you posted it | The newest is a card with no photo (title, date and price, how it ended); the rest are rows ("Completed · 28 Oct · £95"). The newest 3, then "Show all (n)" (all of them while filtering) |

Without filters every section shows, with a line when it is empty. While
filtering, a section with no matches is left out.

## The button

Each row runs through `getTaskDetailView` (task detail's own view picker).
These views give it one button, which opens the task at that action; any
other row shows the ⋮ menu instead. The button's name says which task
("Compare quotes: Fix a tap"), as does the menu's ("Options for Fix a tap").

| Task detail view | Button | Opens |
|---|---|---|
| `owner.open.quotes` | Compare quotes | `#task-quotes` |
| `*.booked.rescheduleByThem` | Answer reschedule | `#task-order` |
| `*.booked.cancelByThem` | Answer cancellation | `#task-order` |
| `*.booked.ready` | Mark done | `#task-order` |
| `*.booked.theyMarkedDone` | Confirm done | `#task-order` |
| `*.booked.theyMarkedFailed` | Answer failed | `#task-order` |
| `*.conflict.*` | Sort out conflict | `#task-order` |

Past rows get **Review** (the review form, `/tasks/[id]/review?orderId=`)
when the order is COMPLETED and `Order.reviewState.canSubmit` is true
(`MyOrders` selects it; `OrderReviewState: { merge: true }` in
`utils/apolloClient.ts` keeps it from overwriting task detail's reviews).

### How a Past row ended

`outcome` on a Past row. `outcomeFor` checks a cancelled task first, then
your booking, then a quote of yours that is still pending:

| Outcome | When | Badge or line |
|---|---|---|
| `cancelled` | The task was cancelled, or your booking was cancelled | Cancelled |
| `completed` | Your booking is COMPLETED | Completed (green) |
| `failed` | Your booking was cancelled with both sides marked Failed | Didn't go ahead |
| `bookedByOther` | A quote of yours is still PENDING and the task's `bookingStatus` is BOOKED (BE-113) | Booked by someone else |
| `taskCompleted` | The same, with `bookingStatus` COMPLETED | Task completed |
| `otherBookingEnded` | The same, with the task AWARDED and `bookingStatus` NONE: the booking was cancelled or failed and the owner hasn't reopened the task (BE-116) | Booking cancelled |
| `closed` | Anything else that is over, such as a quote that closed with its booking | Closed |

Your quote stays PENDING while someone else is booked, and nothing tells you,
so `MyQuotes` selects `bookingStatus` and the row says it. Those rows have no
button, only the ⋮ menu. A CLOSED quote reads Closed even when the task is
booked again, and so does any other task that isn't AWARDED. The same words
as task detail's `worker.bookedByOther`, `worker.completedByOther` and
`worker.otherBookingEnded`, and the Expo hub.

## The ⋮ menu

Share task on every row; Edit task on your own open tasks; Report task only
on other people's tasks. Tapping anywhere else on a card or row opens the
task.

## Suspensions and reopened tasks (BE-108)

A suspended task stays in your list (in its section, with its words; the
API only leaves it out for other people), but its row has no button and no
Edit task (`suspended`); a booking whose other party is suspended has no
button either. Share task stays. The booking a row follows is task
detail's `currentTaskOrder`, so a reopened task sits in Open, not Past, a
rebooked one follows its new booking, and the worker whose booking a reopen
cancelled (their quote is CLOSED) reads "Closed" in Past. The same rules as
the Expo hub.

## Filters

Search (title, description and place), Show (All tasks, Posted by you, Quoted
by you; only with both kinds of task) and Category (All categories, then
`me.hubTaskCategories`) are the same controls and copy in both layouts, and
one state: `MyTasksScreen` keeps them in the URL (`?q=&category=&role=`), so
resizing the window keeps them. Each layout hides itself with CSS (no flash on
first paint). Copy matches Expo's hub (FE-361).

| Screen | Where | When a change applies |
|---|---|---|
| Phones and tablets (below `lg`) | The filter icon next to the title ("Filters, 2 active" when filters are on) opens a bottom sheet. | On Apply, or Enter in the search. Clear turns every filter off at once. |
| Desktop (`lg` and up) | A rail left of the list, always open. No icon and no sheet. | At once. A chip when pressed. The search 300 ms after typing stops (`helpers/searchDebounce.ts`) or on Enter; the X in the field clears it at once. A chip pressed while typing sends the typed search with it. |

The rail shows Clear filters (a text button by its title) only while a filter
is on, and it clears all of them. The list's own Clear filters (in
`noMatches`) clears the rail too.

## Your activity

My tasks no longer has Your activity (FE-377): no list / chart toggle, no stat
panels, no `me.taskAchievements` query. The owner's own public profile still
shows it (`PublicProfileAchievements`), so `components/ui/MyTasksActivityDetails.tsx`,
`helpers/taskAchievements.ts` and the `achievements` copy in `../i11n.json`
stay for the profile. Don't delete them as dead code.
