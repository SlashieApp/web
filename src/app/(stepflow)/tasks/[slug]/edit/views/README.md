# Edit task views

`/tasks/[slug]/edit` (FE-297): the poster changes an open task. It lives in
the step-flow shell (`StepFlowHeader`, `StepFlowLayout`, one Save at the
bottom) and reuses create's sections. Product rules: wiki
`01-Product/Create-Task-Location-First-Flow.md` (edit section).

`getEditTaskView({ session, query, task })` picks the view; each has one
config file here and `index.ts` maps names to configs (`EDIT_TASK_VIEWS`).
`page.tsx` renders the form (`components/EditTaskScreen`), a status screen
(`components/EditTaskStatus`) or the splash. Copy lives in `../i11n.json`
(en + zh-HK); the sections' copy is create's.

| View | Who, when | Shows | Actions |
|---|---|---|---|
| `edit.signIn` | Signed out | none: log in, then back here | none |
| `edit.loading` | The account or the task is loading | Splash | none |
| `edit.loadError` | The task or the account didn't load | We couldn't load this task | Try again, Back to my tasks |
| `edit.notFound` | No task (removed, hidden, bad link) | This task isn't available | Back to my tasks |
| `edit.notOwner` | Signed in, someone else's task | Only the poster can edit this task | View task |
| `edit.booked` | Owner, a worker is booked (or the job is done) | This task can't be edited now | View task |
| `edit.cancelled` | Owner, cancelled | This task was cancelled | Post it again, View task |
| `edit.open` | Owner, open or draft, no live quotes | The form | Save changes |
| `edit.openWithQuotes` | Owner, open, live quotes | The form, after "{count} workers have already quoted. They won't be told about your changes…" | Save changes |

Precedence: session, the query, no task, not the poster, then the status.

## The form

- Sections in order: Details (title, categories, description), Timing,
  Location (a small map, two fingers to move it on touch, then create's area
  chip and exact address, with "Shared only with the worker you accept."
  under the field), Budget, Photos (saved ones plus new, up to 10 in all),
  Contact.
- The map looks and works like create's (FE-356): the same Mapbox style
  (light or dark), centre pin and area halo, floating search bar with
  locate-me, logo and zoom buttons (`useTaskLocationMap`,
  `TaskLocationSearchBar`). When locate-me can't get a location, create's
  "We couldn't get your location…" shows under the map until the pin moves.
- **Only what changed is saved** (`buildEditTaskInput`): the API keeps the
  rest, the timeline lists real changes, and the contact method (which the
  API doesn't tell us) stays unless a new one is picked.
- "Use pin address" appears once the pin has moved (before that the map's
  label is the stored town, not an address).
- Save is locked while saving and while the task page loads. Photos upload
  after the update into the free slots (0 to 9, lowest first, never above 9);
  any that fail are counted in a toast and the rest still upload. Date rules
  and API date errors are create's. Then the task page replaces this one with "Changes saved".
- Leaving with changes: Close asks "Discard your changes?"; a reload or
  closing the tab gets the browser's own question.
- Desktop rail: status and quotes, View task, See it as workers do
  (`/tasks/[slug]/preview`), help. Phones: the status and the guest view in
  a bar above the form.
