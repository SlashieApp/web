# Create task views

`/tasks/create` (FE-295): pick the spot on a full-screen map, then give the
exact address and answer the rest over the map band, then review what workers
will see and post. Product rules: wiki
`01-Product/Create-Task-Location-First-Flow.md`.

`getCreateTaskView({ session, step })` picks the view. Each view has one
config file here; `index.ts` maps names to configs (`CREATE_TASK_VIEWS`) and
lists the steps in order (`CREATE_TASK_STEPS`). `components/CreateTaskScreen`
renders a step's `sections` in order and checks its `fields` before moving on.
Copy lives in `../i11n.json` (en + zh-HK); form errors are copy keys in
`errors` (`taskFieldError`).

| View | Who, when | Map | Sections | Main action |
|---|---|---|---|---|
| `create.signIn` | Signed out | none | none: log in, then back here with the query kept | none |
| `create.loading` | The account is loading | none | Splash | none |
| `create.loadError` | The account didn't load | none | We couldn't load your account | Try again, Back to search |
| `create.location` | Step 1 | Full screen, short card | "Where is the task?", that workers only see this approximate area, "Workers will see: {town}" (or "Move the map to set the area."); fields: the pin and its area | Continue |
| `create.address` | Step 2 | Band | "What's the exact address?", shared only with the worker you accept, after you accept their quote; exact address (required, private), Use pin address | Continue |
| `create.details` | Step 3 | Band | Title, categories, description, photos (optional, up to 10, each up to 10 MB, public) | Continue |
| `create.timing` | Step 4 | Band | Flexible / Before a date / On a date and time; the date is the device picker from today in London (`londonToday`, as the API checks) | Continue |
| `create.budget` | Step 5 | Band | Budget type first, then the amount for that unit (£), then how you'll pay | Continue |
| `create.review` | Step 6 | Band | What workers will see (each row edits its step), the exact address marked private, the email check when unverified, how your worker reaches you, the allowed-tasks confirmation | Post task |

## Across steps

- **The map** is one Mapbox instance: full screen on the location step, then a
  band (160px phone, 220px tablet, task detail's band on desktop) with a
  "Near {town} · Change" chip back to the map. Reduced motion: no height
  animation.
- **The location card** (FE-352) is short and fixed: about 200 px on a 375 px
  phone, so the map keeps over half the screen (40% on a 320 x 568 phone).
  The map box stops at the card, so the pin sits in the middle of the map
  that shows. Desktop floats the same card over the map. A failed location,
  an error or the draft notice add their line to it.
- **The exact address** (FE-352) has its own step, after the pin: typing
  there never moves the pin. "Use pin address" copies the pin's street label
  only when tapped (FE-209).
- **Start centre:** a `/search` centre, else current location, else London
  (camera only, never a chosen pin).
- **Draft:** answers and the step are kept on this browser for 7 days
  (`createTaskDraft`), restored with "We kept your unfinished task · Start
  over"; a saved address comes back on the address step. Not kept: photos
  and the confirmation. A repost or a `/search` start wins over a draft.
  Cleared once the task is posted.
- **Repost** (`?repost=<id>`): title, categories, description, location and
  budget are copied once; not timing, photos or contact.
- **Stepper** (desktop): any step already reached is a button. Phones use the
  progress strip, Back, the band chip and the review's Edit buttons.
- **Errors:** checked on Continue and then as you fix them; focus moves to
  the first field with a problem. Post task re-checks everything and goes to
  the first step with a problem (`createTaskFirstErroredStep`: the pin and
  area to the location step, the address to the address step).
- **Dates:** Before and On a date need a real day that is today or later in
  London (`dateRequired`, `dateInvalid`, `dateInPast`); the API's
  DATE_REQUIRED, INVALID_DATE and DATE_IN_PAST show `serverErrors` copy.
- **Photos:** each takes a slot (0 to 9) and must be an allowed type (jpg,
  jpeg, png, webp, heic, heif, avif), from the file name or else its type
  (`utils/taskImageKeys.ts`); a picture of another type, GIF included, is
  refused when picked ("Use a JPG, PNG, WebP, HEIC or AVIF photo"). Each
  upload is `createImageUpload`, a PUT, then `finalizeTaskImage`, which stores
  the slot as a metadata-free JPEG. Uploads only run while the task is OPEN
  or DRAFT.
- **Posting:** one at a time, and never twice (`publishOnce`). Photos upload
  after the task exists; any that fail are counted in a toast and the rest
  still upload. Then the task page replaces this one.
