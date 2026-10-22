# Messages views

`/messages` and `/messages/[threadId]`: the inbox, the open conversation, and
a task thread's two pins: the top pin under the header (the live quotes or
the booking, information only) and the bottom pin above the composer (what
needs the viewer now, with its buttons). Thread screen v2 (FE-333, decided
2026-10-21). Product rules: wiki `01-Product/Messages.md`.

Each view has one config file here; `index.ts` maps names to configs
(`INBOX_VIEWS`, `THREAD_VIEWS`, `PIN_VIEWS`, `BOTTOM_PIN_VIEWS`) and the
components only render them. Copy lives in `../i11n.json` (en + zh-HK); the
pins reuse task detail's pills, headlines, sub-lines and controls.

## Titles: `threadTitle(thread, copy)` (`../helpers/messagesThread.ts`)

The inbox row and the thread header use the same title, with the task name
under it (the header's opens the task).

| Who | Title | In the header |
|---|---|---|
| Anyone with one other person (`otherParty`) | Their name ("Deleted user" from the API for a deleted account) | Opens their profile (not for a deleted account), with their photo |
| The poster before a quote is accepted, task cancelled (`task.status` CANCELLED) | "Task cancelled" | Plain text |
| The poster before a quote is accepted, with live quotes | "{count} workers quoted" / "1 worker quoted" | Plain text |
| The poster before a quote is accepted, no live quotes | "Waiting for quotes" | Plain text |
| The Slashie thread | Its own title (Slashie), "Updates from Slashie" under it | Plain text |

A task cancelled before anyone was booked has no `attention`, so without its
status the poster's title would wrongly read "Waiting for quotes"; cancelled
wins over the quote count too.

The live-quote count is `thread.attention.count` when its kind is
COMPARE_QUOTES: the API sets it for the poster of an OPEN task with pending
quotes and no booking, with the number of pending quotes. Once a quote is
accepted the API sends `otherParty` (the booked worker), so the title
becomes their name.

## Inbox: `getInboxView({ query, threadCount, matchCount })`

`matchCount` is how many conversations the search text and filter leave
(below); `threadCount` is how many there are.

| View | When | Shows | Search and filter |
|---|---|---|---|
| `inbox.loading` | First load, nothing cached | Skeleton rows | Hidden |
| `inbox.error` | Threads query failed, nothing cached | Couldn't load your messages · Try again | Hidden |
| `inbox.empty` | No conversations | No messages yet | Hidden |
| `inbox.noMatches` | Conversations, but the search and filter leave none | No conversations match · Clear search and filter | Shown |
| `inbox.list` | Otherwise | Task threads and the Slashie thread, most recent first: title (above), task name, last item, time, unread count | Shown |

### Search and filter (FE-362, decided 2026-10-22)

A search box and a filter icon button sit under the Messages title, on phones
and in the desktop left pane. `me.threads` already returns every conversation,
so both work on the device, instantly, with no request. A conversation must
pass both. `filterThreads` (`../helpers/messagesInbox.ts`) does the matching.

**Search.** Every word typed must be found, in any order, in the other
person's name, the thread's title (the task's, or Slashie for the Slashie
thread) or the latest item's title or text (a message's text; a flash's title
and text). Both sides are folded the same way: NFKD, the combining marks
(U+0300 to U+036F) off, lower case, spaces collapsed. So "chloe" finds Chloé
and full-width letters find plain ones. No text, or only spaces, keeps
everything. The API's order is kept. Keep it the same as the Expo app's
search (FE-363).

**Filter.** The icon opens the `@ui` Drawer (a bottom sheet on phones, a side
drawer from `lg`) with one choice. Picking it applies it and closes the
drawer. While it isn't All, the icon has a dot and reads "Filter, 1 active".

| Choice | Keeps |
|---|---|
| All | Everything |
| Unread | `unreadCount > 0` |
| Needs you | `attention` is set, of any kind (quotes to compare too) |
| Posted by you | The task's `poster.id` is the signed-in user's id |
| Working on | The task's poster is someone else (also a task you quoted on and lost: the thread stays) |
| Slashie updates | `kind: SYSTEM` |

A thread with no task (Slashie) is neither posted nor worked on, and neither
is a task the API sent no poster for. The thread fragment asks for
`task { poster { id } }` to tell them apart (the API cost of that is BE-104).

**State.** The text and the filter are React state, not the URL, in
`InboxSearchProvider` (`../context/`), mounted in `messages/layout.tsx`.
They can't live in the list: opening a conversation swaps the page, and the
list inside it remounts, which would clear them (the layout stays). Leaving
Messages resets them. The open conversation comes from the URL, so a search
that drops its row from the list doesn't close it on desktop.

## Conversation: `getThreadView({ threadId, query, thread, notSelected })`

`query` comes from `threadQueryState` (`helpers/messagesThread.ts`): the API
answers FORBIDDEN (`extensions.code`, or nothing) for a conversation you're not in, which is
`notFound`, not a failed request.

| View | When | Shows | Composer area |
|---|---|---|---|
| `thread.none` | Desktop, nothing picked | Choose a conversation to read it | none |
| `thread.loading` | First load | Skeleton header and bubbles | none |
| `thread.loadError` | Network or server error | Couldn't load your messages · Try again · Back to messages | none |
| `thread.notFound` | Not your conversation, removed, or a bad id | This conversation isn't available · Back to messages | none |
| `thread.system` | Slashie announcements | Header, timeline, no pins (`pins: false`) | You can't reply here |
| `thread.open` | `canSend` | Header, top pin, timeline, bottom pin when something needs you (`pins: true`) | One-line composer (44px, grows to 160px) |
| `thread.blocked` | You blocked them | Same | Unblock them to send |
| `thread.notSelected` | The task went to another worker | Same | This task went to another worker |
| `thread.locked` | Before a quote is accepted | Same | You can message here once a quote is accepted |

Precedence: nothing picked, the query, Slashie threads, then why you can or
can't send. Task threads run inside the task's `TaskDetailProvider` (the
header menu and both pins share task detail's state). The timeline has
Today / Yesterday / date dividers, and a run of messages from one side within
five minutes shows one time (`timelineRows`). While the reader is at the
newest item it stays in view when the pins load or change size.

### Timeline items

| Item | Shows |
|---|---|
| Message | A bubble, mine on the right |
| `QUOTE_RECEIVED` (the worker's "quote sent") | The full quote card: worker, price, proposed times, message, live status; the poster accepts (time picker + safety notice) or declines here |
| `SYSTEM_ANNOUNCEMENT` (Slashie thread) | A card: picture, title, body |
| Every other flash | One centred line: the flash's title (plus the quote's price on quote outcomes), time, then its body. No card, no buttons; `REVIEW_PROMPT` keeps its Leave a review link |

## Top pin: `getThreadPinView(taskDetailView)`

Always the live quote(s) or the booking, information only: price, times or
booked slot, status. No buttons (answers are on the quote card and in the
bottom pin); the header's task name opens the task. It reads task detail's
own named view and data (`sortedQuotes`, `myQuote`, `myOrder`). The person
is in the header, not here.

| Pin view | Task detail views | Shows |
|---|---|---|
| `pin.quotes` | `owner.open.quotes` | Open · "Live quotes · cheapest {price}", then up to three live (PENDING) quotes, cheapest first: worker, price, status; "+N more" after three |
| `pin.myQuote` | `worker.open.quoted`, `worker.open.declined`, `worker.awarded.declined`, `worker.notSelected` | "Your quote", price, its status (Awaiting reply, Declined, Not selected), the times offered |
| `pin.booking` | `*.booked.*`, `*.conflict.*` | Awarded · task detail's headline (left out while the bottom pin shows), then booked time · "{price} agreed" · payment method |
| `pin.status` | `owner.open.noQuotes`, `worker.open.notQuoted` | The pill and headline |
| `pin.closed` | `*.completed`, `*.bookingCancelled`, `*.bookingFailed`, `owner.cancelled`, `visitor.*` | The final status: pill and headline |

A placeholder row while the task loads; no pin for `customer.open` and
`guest.open` (they can't be in a task thread) or on Slashie threads.

## Bottom pin: `getBottomPinView({ attention, view })`

The one thing that needs the viewer now, above the composer, with task
detail's own controls. Shown only when the API's `thread.attention` and task
detail's view agree, so it hides as soon as the viewer answers (task detail
updates first) and never offers controls task detail wouldn't. COMPARE_QUOTES
has no bottom pin (the quote cards handle it); nothing waiting means no pin;
Slashie threads have none. Tinted, labelled "Needs you", task detail's
headline first.

| Bottom pin view | `attention.kind` | Task detail views | Sub-line | Controls |
|---|---|---|---|---|
| `bottomPin.reschedule` | ANSWER_RESCHEDULE | `*.booked.rescheduleByThem` | no | Their times with Use this time, Keep current time (`RequestFact`) |
| `bottomPin.cancel` | ANSWER_CANCEL | `*.booked.cancelByThem` | no | Accept cancellation, Keep booking (`RequestFact`) |
| `bottomPin.markDone` | MARK_DONE | `*.booked.ready` | no | Slide to mark Done, Something went wrong (`OrderCloseControls`) |
| `bottomPin.confirmDone` | CONFIRM_DONE | `*.booked.theyMarkedDone` | yes (auto-complete date) | Slide to mark Done, Something went wrong |
| `bottomPin.answerFailed` | ANSWER_FAILED | `*.booked.theyMarkedFailed` | yes | Slide to mark Done, Something went wrong |
| `bottomPin.conflict` | CONFLICT | `*.conflict.*` | yes | Open task |

It sits in the column's flow between the timeline and the composer, so it
never covers either, and is capped at 45% of the screen height and scrolls,
so on phones the conversation keeps room.

The API works out `attention` when it sends the thread, but task detail
polls and moves on (for example to `*.booked.ready` at the booked start)
with no new item, so `ThreadAttentionRefresh` refetches the threads whenever
task detail's view changes, not for the first view. That query rewrites the
same cached `Thread` the conversation reads.
