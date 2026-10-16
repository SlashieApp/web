# Messages views

`/messages` and `/messages/[threadId]`: the inbox, the open conversation, and
the card pinned under a task thread's header (FE-291). Product rules: wiki
`01-Product/Messages.md`.

Each view has one config file here; `index.ts` maps names to configs
(`INBOX_VIEWS`, `THREAD_VIEWS`, `PIN_VIEWS`) and the components only render
them. Copy lives in `../i11n.json` (en + zh-HK); the pinned card reuses task
detail's pills, headlines, sub-lines and controls.

## Inbox: `getInboxView({ query, threadCount })`

| View | When | Shows |
|---|---|---|
| `inbox.loading` | First load, nothing cached | Skeleton rows |
| `inbox.error` | Threads query failed, nothing cached | Couldn't load your messages · Try again |
| `inbox.empty` | No conversations | No messages yet |
| `inbox.list` | Otherwise | Task threads and the Slashie thread, most recent first |

## Conversation: `getThreadView({ threadId, query, thread, notSelected })`

`query` comes from `threadQueryState` (`helpers/messagesThread.ts`): the API
answers FORBIDDEN (or nothing) for a conversation you're not in, which is
`notFound`, not a failed request.

| View | When | Shows | Composer area |
|---|---|---|---|
| `thread.none` | Desktop, nothing picked | Choose a conversation to read it | none |
| `thread.loading` | First load | Skeleton header and bubbles | none |
| `thread.loadError` | Network or server error | Couldn't load your messages · Try again · Back to messages | none |
| `thread.notFound` | Not your conversation, removed, or a bad id | This conversation isn't available · Back to messages | none |
| `thread.system` | Slashie announcements | Header, timeline, no pinned card | You can't reply here |
| `thread.open` | `canSend` | Header, pinned card, timeline | One-line composer (44px, grows to 160px) |
| `thread.blocked` | You blocked them | Same | Unblock them to send |
| `thread.notSelected` | The task went to another worker | Same | This task went to another worker |
| `thread.locked` | Before a quote is accepted | Same | You can message here once a quote is accepted |

Precedence: nothing picked, the query, Slashie threads, then why you can or
can't send. The timeline has Today / Yesterday / date dividers, and a run of
messages from one side within five minutes shows one time (`timelineRows`).

## Pinned card: `getThreadPinView(taskDetailView)`

The thread header mounts task detail's `TaskDetailProvider`, so the card reads
task detail's own named view and maps it here. **Needs you** (`ask`, a tinted
card) is true for exactly the views My tasks files under Needs you
(`ASK_BY_VIEW`); a test keeps the two in step.

Above the status: the other person (photo, name, Worker or Customer, View
profile). The owner has no person before a quote is accepted: one thread holds
every quote.

| Pin view | Task detail views | Status line | Controls |
|---|---|---|---|
| `pin.quotes` (ask) | `owner.open.quotes` | Open · "{count} quotes - compare and accept" | Compare quotes (`#task-quotes`) |
| `pin.status` | `owner.open.noQuotes` | Open · "Your task is live - reaching workers" | none |
| `pin.quoting` | `worker.open.quoted` | Open · Quote sent · your price | Edit quote |
| `pin.requote` | `worker.open.declined`, `worker.open.notQuoted` | Open · the headline | Send quote |
| `pin.booked` | `*.booked.beforeStart` | Awarded · booked time · "{price} agreed" | none (no Message self-link) |
| `pin.waiting` | `*.booked.rescheduleByMe`, `cancelByMe`, `iMarkedDone`, `iMarkedFailed` | Awarded · headline, then the sub-line ("Waiting for {name}…") | none (withdraw and change your mind are on task detail) |
| `pin.answer` (ask) | `*.booked.rescheduleByThem`, `cancelByThem` | The headline | Task detail's answer buttons (`RequestFact`) |
| `pin.close` (ask) | `*.booked.ready` | "Job time has started" · booked time · price | Slide to mark Done, Something went wrong |
| `pin.confirm` (ask) | `*.booked.theyMarkedDone`, `theyMarkedFailed` | The headline, then the sub-line (auto-complete date) | Slide to mark Done, Something went wrong |
| `pin.conflict` (ask) | `*.conflict.*` | "This booking needs resolving" | Open task |
| `pin.done` | `*.completed` | Completed · "{price} agreed" | Review, then Get receipt |
| `pin.notSelected` | `worker.notSelected` | Not selected (the composer area says why) | none |
| `pin.closed` | `*.bookingCancelled`, `*.bookingFailed`, `owner.cancelled`, `worker.awarded.declined`, `visitor.*` | The pill and headline | none |

No card while the task loads (a placeholder row), for `customer.open` and
`guest.open` (they can't be in a task thread), and on Slashie threads. On
phones the card is capped at 45% of the screen and scrolls, so an ask never
pushes the conversation off screen.
