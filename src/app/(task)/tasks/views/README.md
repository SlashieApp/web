# My Tasks views

`/tasks` lists the tasks you posted (Hosted) and the tasks you quoted on
(Quoted), like Uber's Activity screen: **Upcoming**, then **Open**, then
**Past**. There is no separate "Needs you" group: what a task waits on you
for is its button. A worker who can't quote right now sees a "Before you can
quote" strip above the list. `getMyTasksView({ hasTasks, hasMatches,
loading, failed, filtered })` picks what the list column shows; each view has
one config file in this folder (filter button on or off, body, message,
buttons) and `index.ts` maps names to configs.

- `components/MyTasksScreen.tsx` runs the queries, keeps search, Category and
  Hosted / Quoted in the URL (`?q=&category=&role=`) and picks the view. One
  centred column on every screen; the list / chart toggle swaps the list for
  Your activity.
- `components/ui/MyTasksList.tsx` renders the config and the sections;
  `MyTaskCard` is one task (a card or a compact row); `MyTasksFilters` is the
  filter icon and its drawer.
- Sections, order and buttons come from `helpers/myTasksHub.ts`
  (`buildMyTasksHub`).
- The strip comes from `helpers/quoteBlocker.ts` (`MyTasksQuoteBlocker`).
- Stories: `MyTasksList.stories.tsx` (one per view, plus the sections),
  `MyTaskCard.stories.tsx`, `MyTasksFilters.stories.tsx`.

Copy lives in `../i11n.json` (en + zh-HK).

| View | When | Filter button | Shows | Buttons |
|---|---|---|---|---|
| `loading` | First load, nothing to show yet. | no | 3 card placeholders | none |
| `searching` | New filters are loading and nothing matches yet. | yes | 3 card placeholders | none |
| `error` | The lists failed with nothing cached. | no | "Could not load your tasks" + the reason | Try again |
| `empty` | No posted tasks and no quotes. | no | "No tasks yet" | Post a task, Browse tasks |
| `noMatches` | Search or filters leave nothing. | yes | "No matching tasks" | Clear filters |
| `list` | There are rows to show (a failed refresh keeps them, with Try again above). | yes | The sections | none |

## Who sees what

Guests never reach the page: `AccountAuthGate` sends them to log in.

| Viewer | Rows | Filters | Your activity |
|---|---|---|---|
| Customer only | Hosted rows | Search, Category | Customer panel |
| Worker only | Quoted rows | Search, Category | Worker panel |
| Posts and quotes | Both | Search, Show (posted or quoted), Category | Both panels |

## The sections

| Section | Rows | Order | Looks |
|---|---|---|---|
| Upcoming | Hosted tasks with a booking, and quotes that won, not finished (a CONFLICT still counts) | Soonest first by the booked start; untimed last | Cards: the day ("Today", "Tomorrow", "On Wednesday" for 2 to 6 days out, "Thu 5 Nov", "Overdue" in red once the day has passed, "Before 5 Nov" or "Flexible"), the title, then "28 Oct, 16:25 · area · price" |
| Open | Your open tasks, and your pending quotes on open tasks nobody else won | Soonest first by the task's time; flexible last | Rows: photo (or a category icon), the title, "3 quotes · £60" or "Quote sent · £75" |
| Past | Completed, cancelled, didn't go ahead (both marked Failed), not selected, declined | Newest first by when the booking closed, else when you quoted, else when you posted it | The newest is a card with no photo (title, date and price, how it ended); the rest are rows ("Completed · 28 Oct · £95"). The newest 3, then "Show all (n)" (all of them while filtering) |

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

## The ⋮ menu

Share task on every row; Edit task on your own open tasks; Report task only
on other people's tasks. Tapping anywhere else on a card or row opens the
task.

## Filters

The filter icon next to the title ("Filters, 2 active" when filters are on)
opens a drawer: a bottom sheet on phones and tablets, a side panel on
desktop. It has Search (title, description and place), Show (All tasks,
Posted by you, Quoted by you; only with both kinds of task) and Category
(All categories, then `me.hubTaskCategories`), then Clear and Apply.
Changes wait for Apply (or Enter in the search); Clear turns every filter
off at once. Copy matches Expo's hub (FE-361).
