# Task detail views

Task detail shows one **Task summary** section. What it says depends on who
is looking and where the task and its booking stand. That decision is made in
one place, `getTaskDetailView(task, order, viewer, now)`, which returns one of
the names below. Each name has one config file in this folder: the status
badge (the summary's eyebrow), headline, sub-line, facts in order, the
booking actions it adds to Help & actions, and the primary action.
`index.ts` maps names to configs. `components/summary/TaskSummary.tsx` only
renders the config, and `TaskSummary.stories.tsx` has one story per view.

The summary is a card on web and flush on phones and tablets. The main
button sits outside it (top right on web, pinned on phones). Help & actions
is the desktop rail card and the title's menu on phones; the view's booking
actions come first, then the task-level ones (share, edit, repost, safety,
help, report, cancel task).

Copy lives in `../i11n.json` under `summary` (en + zh-HK). `{count}` counts
live (PENDING) quotes only. `{name}` is the other person on the booking.
`{date}` is the booking's `autoDoneAt` (7 days after a one-sided Done).

| View | Who / when | Badge | Headline | Sub-line | Facts (in order) | Help & actions | Primary action |
|---|---|---|---|---|---|---|---|
| `loading` | Viewer-scoped task (and order) still loading. | (skeleton) | (skeleton) | (skeleton) | budget, preferredTime, location, categories, description, photos | - | none |
| `owner.open.noQuotes` | Owner, task OPEN, no pending quotes yet. | Open | Your task is live - reaching workers | Nearby workers can see your task. Share it to get quotes faster. | budget, preferredTime, location, categories, description, photos | - | Preview |
| `owner.open.quotes` | Owner, task OPEN, one or more pending (live) quotes. | Open | {count} quote - compare and accept / {count} quotes - compare and accept | Review each quote and accept the worker you want. | budget, preferredTime, location, categories, description, photos | - | Preview |
| `owner.booked.beforeStart` | Owner, booking ACTIVE, before the booked start. | Awarded | Worker booked | Coordinate the job and pay them directly. When it is done, you both mark it Done here. | bookedTime, otherParty, agreedPrice, description, photos | Reschedule, Cancel booking | Message |
| `owner.booked.ready` | Owner, booking ACTIVE, start time passed, nobody has marked it yet. | Awarded | Job time has started | Mark it Done once the work is finished and paid for, or tell us if something went wrong. | otherParty, agreedPrice, bookedTime, description, photos | - | Slide to mark Done |
| `owner.booked.iMarkedDone` | Owner marked it Done; waiting for the worker (auto-completes after 7 days). | Awarded | You marked it Done | Waiting for {name}. If there's no reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description, photos | Something went wrong? | Message |
| `owner.booked.theyMarkedDone` | The worker marked it Done; waiting for the owner. | Awarded | {name} marked it Done | Mark it Done too to complete the job. If you don't reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description, photos | - | Slide to mark Done |
| `owner.booked.iMarkedFailed` | Owner marked it Failed; waiting for the worker. | Awarded | You marked it Failed | Waiting for {name}. | otherParty, agreedPrice, bookedTime, description, photos | Changed your mind? Mark it Done | Message |
| `owner.booked.theyMarkedFailed` | The worker marked it Failed; waiting for the owner. | Awarded | {name} marked it Failed | If the job went ahead, mark it Done and the booking will need resolving. | otherParty, agreedPrice, bookedTime, description, photos | - | Slide to mark Done |
| `owner.booked.rescheduleByMe` | Owner asked to move the booking (RESCHEDULING). | Awarded | Reschedule requested | You asked to move the booking. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, description, photos | Withdraw request | Message |
| `owner.booked.rescheduleByThem` | The worker asked to move the booking (RESCHEDULING). | Awarded | {name} wants to move the booking | Pick a new time or keep the current one. | request, bookedTime, otherParty, agreedPrice, description, photos | - | Message |
| `owner.booked.cancelByMe` | Owner asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | Awarded | Cancellation requested | You asked to cancel. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, description, photos | Withdraw request | Message |
| `owner.booked.cancelByThem` | The worker asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | Awarded | {name} asked to cancel | Accept to cancel the booking, or keep it. | request, bookedTime, otherParty, agreedPrice, description, photos | - | Message |
| `owner.conflict.iMarkedDone` | CONFLICT: the owner marked it Done, the worker marked it Failed. | Awarded | This booking needs resolving | You marked it Done and {name} marked it Failed. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, description, photos | Ask to cancel, Report profile | Message |
| `owner.conflict.iMarkedFailed` | CONFLICT: the owner marked it Failed, the worker marked it Done. | Awarded | This booking needs resolving | You marked it Failed and {name} marked it Done. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, description, photos | Ask to cancel, Report profile | Message |
| `owner.completed` | Owner, booking COMPLETED (both marked Done, or the 7-day auto-Done). | Completed | Job complete | The details below are your record of the work. | record, otherParty, agreedPrice, bookedTime, reviews, description, photos | - | Review, then Get receipt |
| `owner.bookingCancelled` | Owner, booking CANCELLED (a cancel request was accepted). The task stays AWARDED. | Cancelled | Booking cancelled | The booking with {name} was cancelled. Post the task again if you still need help. | record, otherParty, agreedPrice | - | Reopen task when the API says the owner can (`canReopen`, asks first; Repost stays in Help & actions), else Repost this task |
| `owner.bookingFailed` | Owner, booking CANCELLED because both sides marked it Failed. The task stays AWARDED. | Cancelled | Booking didn't go ahead | You and {name} both marked it Failed. Post the task again if you still need help. | record, otherParty, agreedPrice | - | Reopen task when the API says the owner can (`canReopen`, asks first; Repost stays in Help & actions), else Repost this task |
| `owner.cancelled` | Owner, task CANCELLED. | Cancelled | Task cancelled | Post it again if you still need help. | budget, preferredTime, location, categories, description, photos | - | Reopen task when the API says the owner can (`canReopen`, asks first; Repost stays in Help & actions) |
| `worker.booked.beforeStart` | Booked worker, booking ACTIVE, before the booked start. | Awarded | You are booked for this job | Coordinate the job and get paid directly. When it is done, you both mark it Done here. | bookedTime, otherParty, agreedPrice, location, description, photos | Reschedule, Cancel booking | Message |
| `worker.booked.ready` | Booked worker, start time passed, nobody has marked it yet. | Awarded | Job time has started | Mark it Done once the work is finished and paid for, or tell us if something went wrong. | location, otherParty, agreedPrice, bookedTime, description, photos | - | Slide to mark Done |
| `worker.booked.iMarkedDone` | Booked worker marked it Done; waiting for the owner (auto-completes after 7 days). | Awarded | You marked it Done | Waiting for {name}. If there's no reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description, photos | Something went wrong? | Message |
| `worker.booked.theyMarkedDone` | The owner marked it Done; waiting for the booked worker. | Awarded | {name} marked it Done | Mark it Done too to complete the job. If you don't reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description, photos | - | Slide to mark Done |
| `worker.booked.iMarkedFailed` | Booked worker marked it Failed; waiting for the owner. | Awarded | You marked it Failed | Waiting for {name}. | otherParty, agreedPrice, bookedTime, description, photos | Changed your mind? Mark it Done | Message |
| `worker.booked.theyMarkedFailed` | The owner marked it Failed; waiting for the booked worker. | Awarded | {name} marked it Failed | If the job went ahead, mark it Done and the booking will need resolving. | otherParty, agreedPrice, bookedTime, description, photos | - | Slide to mark Done |
| `worker.booked.rescheduleByMe` | Booked worker asked to move the booking (RESCHEDULING). | Awarded | Reschedule requested | You asked to move the booking. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, location, description, photos | Withdraw request | Message |
| `worker.booked.rescheduleByThem` | The owner asked to move the booking (RESCHEDULING). | Awarded | {name} wants to move the booking | Pick a new time or keep the current one. | request, bookedTime, otherParty, agreedPrice, location, description, photos | - | Message |
| `worker.booked.cancelByMe` | Booked worker asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | Awarded | Cancellation requested | You asked to cancel. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, location, description, photos | Withdraw request | Message |
| `worker.booked.cancelByThem` | The owner asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | Awarded | {name} asked to cancel | Accept to cancel the booking, or keep it. | request, bookedTime, otherParty, agreedPrice, location, description, photos | - | Message |
| `worker.conflict.iMarkedDone` | CONFLICT: the booked worker marked it Done, the owner marked it Failed. | Awarded | This booking needs resolving | You marked it Done and {name} marked it Failed. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, description, photos | Ask to cancel, Report profile | Message |
| `worker.conflict.iMarkedFailed` | CONFLICT: the booked worker marked it Failed, the owner marked it Done. | Awarded | This booking needs resolving | You marked it Failed and {name} marked it Done. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, description, photos | Ask to cancel, Report profile | Message |
| `worker.completed` | Booked worker, booking COMPLETED. | Completed | Job complete | The details below are your record of the work. | record, otherParty, agreedPrice, bookedTime, reviews, description, photos | - | Review, then Get receipt |
| `worker.bookingCancelled` | Booked worker, booking CANCELLED (a cancel request was accepted). | Cancelled | Booking cancelled | The booking with {name} was cancelled. Browse other tasks nearby. | record, otherParty, agreedPrice | - | Browse other tasks |
| `worker.bookingFailed` | Booked worker, booking CANCELLED because both sides marked it Failed. | Cancelled | Booking didn't go ahead | You and {name} both marked it Failed. Browse other tasks nearby. | record, otherParty, agreedPrice | - | Browse other tasks |
| `worker.open.notQuoted` | Worker (profile set up), task OPEN, no live quote from them (a withdrawn quote reads the same: they can quote again; a closed one is `worker.open.closed`). | Open | Open for quotes / Open for quotes - {count} so far | Send your price and availability to win this job. | budget, preferredTime, location, categories, postedBy, description, photos | - | Send quote |
| `worker.open.quoted` | Worker, task OPEN, their quote is PENDING. | Open | Quote sent | The customer has your quote. We will notify you of any response. | myQuote, preferredTime, location, categories, postedBy, description, photos | - | Edit quote |
| `worker.open.closed` | Worker, task OPEN, their quote is CLOSED: the booking it won ended early and the owner reopened the task (BE-113). It never comes back; they can send a new one. | Open | Quote closed | Your booking ended. You can send a new quote. | budget, preferredTime, location, categories, postedBy, description, photos | - | Send quote |
| `worker.bookedByOther` | Worker whose own quote is still PENDING, task AWARDED, `bookingStatus` BOOKED (BE-113). Status only: nobody told them, and they never learn who. | Awarded | Booked by someone else | Browse other tasks nearby. | myQuote, location, categories, postedBy, description, photos | - | Browse other tasks |
| `worker.completedByOther` | The same, `bookingStatus` COMPLETED. | Completed | Task completed | Browse other tasks nearby. | location, categories, postedBy, description, photos | - | Browse other tasks |
| `customer.open` | Signed in without a worker profile, task OPEN. | Open | You can earn {amount} (an hour / a day; no budget: Open for quotes) | Become a worker to quote on this task. | payment, preferredTime, location, categories, postedBy, description, photos | - | Become a worker |
| `guest.open` | Signed out, task OPEN. | Open | You can earn {amount} (an hour / a day; no budget: Open for quotes) | Sign in as a worker to send a quote. | payment, preferredTime, location, categories, postedBy, description, photos | - | Sign in to quote |
| `visitor.awarded` | Anyone not on the booking (guest, customer, a worker without a live quote) on a booked task: AWARDED with `bookingStatus` BOOKED, or one this build doesn't expect. | Awarded | Worker booked | This task has been awarded to a worker. | location, categories, postedBy, description, photos | - | none |
| `visitor.completed` | The same, `bookingStatus` COMPLETED. | Completed | Task completed | This task is no longer taking quotes. | location, categories, postedBy, description, photos | - | none |
| `visitor.cancelled` | Anyone except the owner on a CANCELLED task. | Cancelled | Task cancelled | This task is no longer active. | location, categories, postedBy, description, photos | - | none |

## Rules worth knowing

- The task status enum is OPEN, AWARDED, CANCELLED, DRAFT. There is no
  CLOSED, and a finished job stays AWARDED; completion lives on the order,
  and, for viewers without the order, on `Task.bookingStatus`.
- There is no FAILED order status: both sides marking Failed cancels the
  order. `bookingFailed` is a CANCELLED order where both close actions are
  Failed; any other CANCELLED order is `bookingCancelled`.
- A pending request wins over CONFLICT, so a cancel asked during a conflict
  shows the `cancelByMe` / `cancelByThem` view.
- `Task.quotes` omits WITHDRAWN and EXPIRED quotes, so a worker who withdrew
  sees `worker.open.notQuoted` and can quote again.
- The owner can't decline a quote (BE-113, decided 24 Oct): one quote per
  task, and Accept is the only answer. Accepting leaves the other quotes
  PENDING, with no flash, push or log line for their workers, so a reopen
  can bring them back. When a booking ends early and the owner reopens the
  task, the booked worker's quote becomes CLOSED and the others can be
  accepted again.
- `Task.bookingStatus` (BE-113) is NONE, BOOKED or COMPLETED, the same for
  every viewer, and never says who is booked; `Task.status` stays AWARDED for
  both a booking and a finished job. A booked or completed task opens
  read-only for anyone, guests included, but search lists open tasks only.
  An AWARDED task whose booking was cancelled is NONE, and is only for its
  owner and the booked worker until the owner reopens it.
- A worker's own quote changes their view only while it is PENDING, or CLOSED
  on an open task. On an AWARDED task a PENDING quote reads from
  `bookingStatus`: BOOKED is `worker.bookedByOther`, COMPLETED is
  `worker.completedByOther`. Any other status (withdrawn, one web doesn't
  know yet) reads like no quote: `worker.open.notQuoted` while the task is
  open, so they can quote again, and `visitor.awarded` / `visitor.completed`
  once it is booked. So does a CLOSED quote on a task that is booked again.
  A `bookingStatus` web doesn't expect on an AWARDED task reads
  `visitor.awarded`. The Quotes section's badge says Accepted, or a neutral
  Closed for any other finished status, and never raw status text.
- A reopen closes the booked worker's quote (`worker.open.closed`) and leaves
  the others PENDING, so any of them can be accepted. Workers with a pending
  quote get a TASK_REOPENED flash then; nothing told them when someone else
  was booked.
- Accept shows only on a PENDING quote of an OPEN task (`canAcceptQuote`).
  Edit quote needs an OPEN task too (`hasPendingQuote`). Withdraw stays on
  any PENDING quote (`canWithdrawQuote`), booked task or not: the quote page
  has it while the task is open, and the Messages thread menu has it always.
  Once the task is booked the quote page sends the worker back to the task,
  so there the thread menu is the only way to withdraw.
- Only the owner learns who sent a quote (BE-105). Anyone else, guests
  included, gets the other PENDING quotes with no `workerUserId` or
  `worker` while the task is OPEN, plus their own quote at any status; once
  it isn't OPEN, only their own. The Quotes section lists the others as
  "Worker" with the price, times, message and when it was sent (FE-370);
  the viewer's own quote stays in the summary.
- API contract: an AWARDED task returns the order for its poster and booked
  worker. Without it the owner falls back to `visitor.awarded`.
- A reopened task (BE-108) can have more than one order, the old ones
  CANCELLED. The booking the page is about is `currentTaskOrder`
  (`src/utils/orderHelpers.ts`): a live one (booked or CONFLICT), else the
  newest by `createdAt`, and none while the task is OPEN or DRAFT, so a
  reopened task reads as `owner.open.*`, not its old booking. My tasks picks
  it the same way (the Expo app's `currentOrder`).

## Suspensions (BE-108)

Ops can suspend a task, and suspending a user suspends the tasks they
posted and freezes their quotes and bookings. Nothing is deleted; lifting it
restores everything. Copy is shared with the Expo app word for word (en +
zh-HK), and so are the names and rules below.

### The notice: `getTaskNoticeView({ suspension, order, viewer })`

A notice card at the top of the Overview, above the summary
(`../components/overview/TaskSuspensionNotice.tsx`, an `@ui` InfoBar). Each
name has one config file here (`notice.*.ts`, `TASK_NOTICE_VIEWS`); copy is
under `notice` and `reopen` in `../i11n.json`. `{name}` is
`Order.counterpartySuspension.name`, else the poster's name
(`taskNoticePersonName`).

| Notice | Who / when | Title | Body | Action |
|---|---|---|---|---|
| `notice.owner.taskSuspended` | Owner, `Task.suspension.bySlashie`. | This task is suspended | Slashie has suspended this task, so no one can quote, book or message on it. Contact support if you think this is a mistake. | Contact support (`mailto:` the app's contact address, admin@slashie.app) |
| `notice.owner.workerSuspended` | Customer, live booking (or CONFLICT), `counterpartySuspension.role` WORKER and `canReopen`. | {name}'s account has been suspended | This booking is on hold. Reopen the task to cancel it and choose another quote. | Reopen task |
| `notice.owner.workerSuspendedOnHold` | The same with `canReopen` false. | {name}'s account has been suspended | This booking is on hold. You can't message, reschedule or mark it done while their account is suspended. | none |
| `notice.worker.customerSuspended` | Booked worker, live booking (or CONFLICT), `counterpartySuspension.role` CUSTOMER or `Task.suspension.posterSuspended`. | {name}'s account has been suspended | This booking is on hold. You can't message, reschedule or mark it done while their account is suspended. | none |
| `notice.worker.taskSuspended` | Booked worker (live booking or CONFLICT) or quoting worker (own quote PENDING), `Task.suspension.bySlashie`. Wins over the poster's suspension. | This task is suspended | Slashie has suspended this task. Your quote and any booking are on hold until it's restored. | none |
| `notice.worker.posterSuspended` | Quoting worker with no booking, `Task.suspension.posterSuspended`; {name} is the poster. | {name}'s account has been suspended | Your quote is on hold while their account is suspended. | none |

No notice once the booking has finished, for a quote that isn't pending, for
anyone not on the booking or quoting, or for an owner whose own account is
suspended (the app-wide banner says so).

### Reopen task

`permissions.canReopen` is the API's own answer (`Task.canReopen`, BE-113):
true only for the owner, when `reopenTask` would succeed. That is a
CANCELLED task, an AWARDED task whose booking was cancelled (both agreed, or
both marked it Failed) with nothing live or completed, and a live booking
whose worker is suspended; never a suspended task or a completed booking.
Web keeps no reopen rules of its own, so it follows the API.

Where it shows: the main button of `owner.cancelled`, and of
`owner.bookingCancelled` / `owner.bookingFailed` in place of Repost
(`availablePrimaryAction`; Repost stays in Help & actions, and is the main
button again when `canReopen` is false), and the `notice.owner.workerSuspended`
action. Each opens `ReopenTaskDialog` ("Reopen this task?", Reopen task /
Not now). Its body says the booking with {name} will be cancelled only for a
live booking with a suspended worker (`Order.counterpartySuspension.canReopen`);
otherwise that the task takes quotes again and workers with pending quotes
will be told. Then it calls `reopenTask`. On success the task refetches
(status, quotes, orders, `canReopen`, Activity), as do My tasks
(`MyRequests`, `MyOrders`) and the Messages inbox, and "Task reopened"
shows. A refusal shows its copy (`serverErrors`: TASK_SUSPENDED,
COUNTERPARTY_SUSPENDED, TASK_ALREADY_OPEN, TASK_NOT_REOPENABLE,
WORKER_NOT_SUSPENDED, TASK_CHANGED, ACCOUNT_DISABLED; anything else falls
back to the shared error copy) as a toast, keeps the dialog open and
reloads the task.

### Frozen

`permissions.isSuspended`: the task is suspended (for any reason).
`permissions.isFrozen`: that, or the current booking's other party is
suspended. The summary reads the same, but nothing the API would refuse is
offered:

- Help & actions: no booking actions (only Report profile on a conflict),
  no Edit or Cancel task on a suspended task. Share, Repost, safety and
  Report task stay.
- Main button (`availablePrimaryAction`): no Send quote, Edit quote, slide to
  mark Done, Reopen (on a suspended task) or Review; Get receipt stays once
  the viewer has reviewed. Message, Preview, Repost and Browse stay.
- Request answers, the request "lapses" note and review Edit are hidden. The
  two sub-lines with the auto-Done `{date}` swap to versions without it
  (`frozenSubline`: "Waiting for {name}." and "You can mark it Done too once
  the booking is no longer on hold."); Messages' pins read the same.
- The Quotes section: no Accept on a suspended task; a quote whose worker is
  suspended (`Quote.workerSuspended`) shows "Account suspended" with Accept
  off, and is never Best match.
- The review page says why (`serverErrors.TASK_SUSPENDED` /
  `COUNTERPARTY_SUSPENDED`) instead of the form.
- Messages pauses its composer (`../../../../(messages)/messages/views/README.md`).
- A request refused with TASK_SUSPENDED, COUNTERPARTY_SUSPENDED, TASK_CHANGED
  or ORDER_CHANGED reloads the task, so the page catches up.

The Activity log has lines for TASK_REOPENED (you / named / anon), and
TASK_SUSPENDED by `suspensionReason` (SLASHIE, POSTER_SUSPENDED) and
TASK_UNSUSPENDED, which the owner's guest preview leaves out (guests never
get them).

A non-party opening a suspended task gets NOT_FOUND from `task(id)`; the
page shows the existing "Task not found" card.
