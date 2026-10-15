# Task detail views

Task detail shows one **Task summary** section. What it says depends on who
is looking and where the task and its booking stand. That decision is made in
one place, `getTaskDetailView(task, order, viewer, now)`, which returns one of
the names below. Each name has one config file in this folder (status pill,
headline, sub-line, facts in order, primary action); `index.ts` maps names to
configs. `components/summary/TaskSummary.tsx` only renders the config, and
`TaskSummary.stories.tsx` has one story per view.

Copy lives in `../i11n.json` under `summary` (en + zh-HK). `{count}` counts
live (PENDING) quotes only. `{name}` is the other person on the booking.
`{date}` is the booking's `autoDoneAt` (7 days after a one-sided Done).

| View | Who / when | Headline | Sub-line | Facts (in order) | Primary action |
|---|---|---|---|---|---|
| `loading` | Viewer-scoped task (and order) still loading. | (skeleton) | (skeleton) | budget, preferredTime, location, categories, description (from the listing seed or the public task; skeletons until known) | none |
| `owner.open.noQuotes` | Owner, task OPEN, no pending quotes yet. | Your task is live - reaching workers | Nearby workers can see your task. Share it to get quotes faster. | budget, preferredTime, location, categories, description | Preview |
| `owner.open.quotes` | Owner, task OPEN, one or more pending (live) quotes. | {count} quote - compare and accept / {count} quotes - compare and accept | Review each quote and accept the worker you want. | budget, preferredTime, location, categories, description | Preview |
| `owner.booked.beforeStart` | Owner, booking ACTIVE, before the booked start. | Worker booked | Coordinate the job and pay them directly. When it is done, you both mark it Done here. | bookedTime, otherParty, agreedPrice, description, bookingActions | Message |
| `owner.booked.ready` | Owner, booking ACTIVE, start time passed, nobody has marked it yet. | Job time has started | Mark it Done once the work is finished and paid for, or tell us if something went wrong. | otherParty, agreedPrice, bookedTime, description | Slide to mark Done |
| `owner.booked.iMarkedDone` | Owner marked it Done; waiting for the worker (auto-completes after 7 days). | You marked it Done | Waiting for {name}. If there's no reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description, closeSwitch | Message |
| `owner.booked.theyMarkedDone` | The worker marked it Done; waiting for the owner. | {name} marked it Done | Mark it Done too to complete the job. If you don't reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description | Slide to mark Done |
| `owner.booked.iMarkedFailed` | Owner marked it Failed; waiting for the worker. | You marked it Failed | Waiting for {name}. | otherParty, agreedPrice, bookedTime, description, closeSwitch | Message |
| `owner.booked.theyMarkedFailed` | The worker marked it Failed; waiting for the owner. | {name} marked it Failed | If the job went ahead, mark it Done and the booking will need resolving. | otherParty, agreedPrice, bookedTime, description | Slide to mark Done |
| `owner.booked.rescheduleByMe` | Owner asked to move the booking (RESCHEDULING). | Reschedule requested | You asked to move the booking. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, description | Message |
| `owner.booked.rescheduleByThem` | The worker asked to move the booking (RESCHEDULING). | {name} wants to move the booking | Pick a new time or keep the current one. | request, bookedTime, otherParty, agreedPrice, description | Message |
| `owner.booked.cancelByMe` | Owner asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | Cancellation requested | You asked to cancel. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, description | Message |
| `owner.booked.cancelByThem` | The worker asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | {name} asked to cancel | Accept to cancel the booking, or keep it. | request, bookedTime, otherParty, agreedPrice, description | Message |
| `owner.conflict.iMarkedDone` | CONFLICT: the owner marked it Done, the worker marked it Failed. | This booking needs resolving | You marked it Done and {name} marked it Failed. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, conflictActions, description | Message |
| `owner.conflict.iMarkedFailed` | CONFLICT: the owner marked it Failed, the worker marked it Done. | This booking needs resolving | You marked it Failed and {name} marked it Done. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, conflictActions, description | Message |
| `owner.completed` | Owner, booking COMPLETED (both marked Done, or the 7-day auto-Done). | Job complete | The details below are your record of the work. | record, otherParty, agreedPrice, bookedTime, reviews, description, repost | Review, then Get receipt |
| `owner.bookingCancelled` | Owner, booking CANCELLED (a cancel request was accepted). | Booking cancelled | The booking with {name} was cancelled. Post the task again if you still need help. | record, otherParty, agreedPrice | Repost this task |
| `owner.bookingFailed` | Owner, booking CANCELLED because both sides marked it Failed. | Booking didn't go ahead | You and {name} both marked it Failed. Post the task again if you still need help. | record, otherParty, agreedPrice | Repost this task |
| `owner.cancelled` | Owner, task CANCELLED. | Task cancelled | Post it again if you still need help. | budget, preferredTime, location, categories, description | Repost this task |
| `worker.booked.beforeStart` | Booked worker, booking ACTIVE, before the booked start. | You are booked for this job | Coordinate the job and get paid directly. When it is done, you both mark it Done here. | bookedTime, otherParty, agreedPrice, location, description, bookingActions | Message |
| `worker.booked.ready` | Booked worker, start time passed, nobody has marked it yet. | Job time has started | Mark it Done once the work is finished and paid for, or tell us if something went wrong. | location, otherParty, agreedPrice, bookedTime, description | Slide to mark Done |
| `worker.booked.iMarkedDone` | Booked worker marked it Done; waiting for the owner (auto-completes after 7 days). | You marked it Done | Waiting for {name}. If there's no reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description, closeSwitch | Message |
| `worker.booked.theyMarkedDone` | The owner marked it Done; waiting for the booked worker. | {name} marked it Done | Mark it Done too to complete the job. If you don't reply, it completes automatically on {date}. | otherParty, agreedPrice, bookedTime, description | Slide to mark Done |
| `worker.booked.iMarkedFailed` | Booked worker marked it Failed; waiting for the owner. | You marked it Failed | Waiting for {name}. | otherParty, agreedPrice, bookedTime, description, closeSwitch | Message |
| `worker.booked.theyMarkedFailed` | The owner marked it Failed; waiting for the booked worker. | {name} marked it Failed | If the job went ahead, mark it Done and the booking will need resolving. | otherParty, agreedPrice, bookedTime, description | Slide to mark Done |
| `worker.booked.rescheduleByMe` | Booked worker asked to move the booking (RESCHEDULING). | Reschedule requested | You asked to move the booking. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, location, description | Message |
| `worker.booked.rescheduleByThem` | The owner asked to move the booking (RESCHEDULING). | {name} wants to move the booking | Pick a new time or keep the current one. | request, bookedTime, otherParty, agreedPrice, location, description | Message |
| `worker.booked.cancelByMe` | Booked worker asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | Cancellation requested | You asked to cancel. Waiting for {name}. | request, bookedTime, otherParty, agreedPrice, location, description | Message |
| `worker.booked.cancelByThem` | The owner asked to cancel the booking (CANCEL_REQUESTED, or during CONFLICT). | {name} asked to cancel | Accept to cancel the booking, or keep it. | request, bookedTime, otherParty, agreedPrice, location, description | Message |
| `worker.conflict.iMarkedDone` | CONFLICT: the booked worker marked it Done, the owner marked it Failed. | This booking needs resolving | You marked it Done and {name} marked it Failed. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, conflictActions, description | Message |
| `worker.conflict.iMarkedFailed` | CONFLICT: the booked worker marked it Failed, the owner marked it Done. | This booking needs resolving | You marked it Failed and {name} marked it Done. Message them to sort it out, or ask to cancel if it shouldn't stand. | otherParty, agreedPrice, bookedTime, conflictActions, description | Message |
| `worker.completed` | Booked worker, booking COMPLETED. | Job complete | The details below are your record of the work. | record, otherParty, agreedPrice, bookedTime, reviews, description | Review, then Get receipt |
| `worker.bookingCancelled` | Booked worker, booking CANCELLED (a cancel request was accepted). | Booking cancelled | The booking with {name} was cancelled. Browse other tasks nearby. | record, otherParty, agreedPrice | Browse other tasks |
| `worker.bookingFailed` | Booked worker, booking CANCELLED because both sides marked it Failed. | Booking didn't go ahead | You and {name} both marked it Failed. Browse other tasks nearby. | record, otherParty, agreedPrice | Browse other tasks |
| `worker.open.notQuoted` | Worker (profile set up), task OPEN, no live quote from them (a withdrawn quote reads the same: they can quote again). | Open for quotes / Open for quotes - {count} so far | Send your price and availability to win this job. | budget, preferredTime, location, categories, postedBy, description | Send quote |
| `worker.open.quoted` | Worker, task OPEN, their quote is PENDING. | Quote sent | The customer has your quote. We will notify you of any response. | myQuote, preferredTime, location, categories, postedBy, description | Edit quote |
| `worker.open.declined` | Worker, task OPEN, their quote was DECLINED (or REJECTED): they can send a new one. | Quote declined | The customer went with another option. You can send a new quote. | budget, preferredTime, location, categories, postedBy, description | Send quote |
| `worker.awarded.declined` | Worker, task AWARDED to someone else, their quote was DECLINED (or REJECTED). | Quote declined | The customer went with another option. Browse other tasks nearby. | preferredTime, location, categories, postedBy, description | Browse other tasks |
| `worker.notSelected` | Worker, task AWARDED to someone else, their quote is NOT_SELECTED. | You weren't selected | The customer chose another worker. Browse other tasks nearby. | location, categories, postedBy, description | Browse other tasks |
| `customer.open` | Signed in without a worker profile, task OPEN. | You can earn {amount} (an hour / a day; no budget: Open for quotes) | Become a worker to quote on this task. | payment, preferredTime, location, categories, postedBy, description | Become a worker |
| `guest.open` | Signed out, task OPEN. | You can earn {amount} (an hour / a day; no budget: Open for quotes) | Sign in as a worker to send a quote. | payment, preferredTime, location, categories, postedBy, description | Sign in to quote |
| `visitor.awarded` | Anyone not on the booking (guest, customer, worker without a quote) on an AWARDED task. | Worker booked | This task has been awarded to a worker. | location, categories, postedBy, description | none |
| `visitor.cancelled` | Anyone except the owner on a CANCELLED task. | Task cancelled | This task is no longer active. | location, categories, postedBy, description | none |

## Rules worth knowing

- The task status enum is OPEN, AWARDED, CANCELLED, DRAFT. There is no
  CLOSED, and a finished job stays AWARDED; completion lives on the order.
- There is no FAILED order status: both sides marking Failed cancels the
  order. `bookingFailed` is a CANCELLED order where both close actions are
  Failed; any other CANCELLED order is `bookingCancelled`.
- A pending request wins over CONFLICT, so a cancel asked during a conflict
  shows the `cancelByMe` / `cancelByThem` view.
- `Task.quotes` omits WITHDRAWN and EXPIRED quotes, so a worker who withdrew
  sees `worker.open.notQuoted` and can quote again. A declined worker can
  quote again while the task is OPEN (`worker.open.declined`).
- API contract: an AWARDED task returns the order for its poster and booked
  worker. Without it the owner falls back to `visitor.awarded`.
