# My Tasks views

`/tasks` lists the tasks you posted (Hosted) and the tasks you quoted on
(Quoted), grouped **Booked / In progress**, then **Open**, then
**Completed**. `getMyTasksView({ hasTasks, hasMatches, loading, failed,
filtered })` picks what the list column shows; each view has one config file
in this folder (search bar on or off, body, message, buttons) and `index.ts`
maps names to configs.

- `components/MyTasksScreen.tsx` runs the queries, keeps search, Category and
  Hosted / Quoted in the URL (`?q=&category=&role=`, like /search) and picks
  the view.
- `components/ui/MyTasksList.tsx` renders the config; `MyTaskCard` puts each
  row on the search page's `TaskCard`; `MyTasksSearch` is the search page's
  bar and filter chips.
- Grouping and order come from `helpers/myTasksHub.ts` (`buildMyTasksHub`).
- Stories: `MyTasksList.stories.tsx` (one per view, plus customer, worker
  and dual role), `MyTaskCard.stories.tsx`, `MyTasksSearch.stories.tsx`.

Copy lives in `../i11n.json` (en + zh-HK).

| View | When | Search bar | Shows | Buttons |
|---|---|---|---|---|
| `loading` | First load, nothing to show yet. | no | 3 card placeholders | none |
| `searching` | A new search or category is loading and nothing matches yet. | yes | 3 card placeholders | none |
| `error` | The lists failed with nothing cached. | no | "Could not load your tasks" + the reason | Try again |
| `empty` | No posted tasks and no quotes. | no | "No tasks yet" | Post a task, Browse tasks |
| `noMatches` | Search or filters leave nothing. | yes | "No matching tasks" | Clear filters |
| `list` | There are rows to show (a failed refresh keeps them, with Try again above). | yes | The groups | none |

## Who sees what

Guests never reach the page: `AccountAuthGate` sends them to log in.

| Viewer | Rows | Search chips | Your activity |
|---|---|---|---|
| Customer only | Hosted rows | Category | Customer panel |
| Worker only | Quoted rows | Category | Worker panel |
| Posts and quotes | Both | Category, Hosted / Quoted | Both panels |

## The groups

| Group | Rows | Order |
|---|---|---|
| Booked / In progress | Hosted tasks with a booking, and quotes that won | Overdue, then soonest, then flexible |
| Open | Your open tasks, and your pending quotes on open tasks | Same |
| Completed | Done or cancelled work, and quotes that ended | Newest first; the newest 3, then "Show all (n)" (all of them while searching or filtering) |

## The card

- **Pills** (one row, fading out before the ⋮): Hosted or Quoted, Not selected
  when someone else got the job (`QuoteStatus.NOT_SELECTED`), then each
  category.
- **Meta line:** price, place, timing. On booked work the time leads in bold
  ("Today 14:00"); past its date it reads Overdue in red. Completed rows drop
  the time.
- **Detail line:** "With {worker}" once booked, "{n} quotes" on your open task,
  or "Hosted by {name}" on a task you quoted.
- **⋮ menu:** Share task on every row; Edit task on your own open tasks;
  Report task only on other people's tasks.
- Tapping the card opens the task.
