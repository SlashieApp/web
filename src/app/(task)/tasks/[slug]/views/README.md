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
| `owner.bookingCancelled` | Owner, booking CANCELLED (a cancel request was accepted). | Cancelled | Booking cancelled | The booking with {name} was cancelled. Post the task again if you still need help. | record, otherParty, agreedPrice | - | Repost this task |
| `owner.bookingFailed` | Owner, booking CANCELLED because both sides marked it Failed. | Cancelled | Booking didn't go ahead | You and {name} both marked it Failed. Post the task again if you still need help. | record, otherParty, agreedPrice | - | Repost this task |
| `owner.cancelled` | Owner, task CANCELLED. | Cancelled | Task cancelled | Post it again if you still need help. | budget, preferredTime, location, categories, description, photos | - | Repost this task |
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
| `worker.open.notQuoted` | Worker (profile set up), task OPEN, no live quote from them (a withdrawn quote reads the same: they can quote again). | Open | Open for quotes / Open for quotes - {count} so far | Send your price and availability to win this job. | budget, preferredTime, location, categories, postedBy, description, photos | - | Send quote |
| `worker.open.quoted` | Worker, task OPEN, their quote is PENDING. | Open | Quote sent | The customer has your quote. We will notify you of any response. | myQuote, preferredTime, location, categories, postedBy, description, photos | - | Edit quote |
| `worker.open.declined` | Worker, task OPEN, their quote was DECLINED (or REJECTED): they can send a new one. | Open | Quote declined | The customer went with another option. You can send a new quote. | budget, preferredTime, location, categories, postedBy, description, photos | - | Send quote |
| `worker.awarded.declined` | Worker, task AWARDED to someone else, their quote was DECLINED (or REJECTED). | Awarded | Quote declined | The customer went with another option. Browse other tasks nearby. | preferredTime, location, categories, postedBy, description, photos | - | Browse other tasks |
| `worker.notSelected` | Worker, task AWARDED to someone else, their quote is NOT_SELECTED. | Awarded | You weren't selected | The customer chose another worker. Browse other tasks nearby. | location, categories, postedBy, description, photos | - | Browse other tasks |
| `customer.open` | Signed in without a worker profile, task OPEN. | Open | You can earn {amount} (an hour / a day; no budget: Open for quotes) | Become a worker to quote on this task. | payment, preferredTime, location, categories, postedBy, description, photos | - | Become a worker |
| `guest.open` | Signed out, task OPEN. | Open | You can earn {amount} (an hour / a day; no budget: Open for quotes) | Sign in as a worker to send a quote. | payment, preferredTime, location, categories, postedBy, description, photos | - | Sign in to quote |
| `visitor.awarded` | Anyone not on the booking (guest, customer, worker without a quote) on an AWARDED task. | Awarded | Worker booked | This task has been awarded to a worker. | location, categories, postedBy, description, photos | - | none |
| `visitor.cancelled` | Anyone except the owner on a CANCELLED task. | Cancelled | Task cancelled | This task is no longer active. | location, categories, postedBy, description, photos | - | none |

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
- Only the owner learns who sent a quote (BE-105). Anyone else, guests
  included, gets the other PENDING quotes with no `workerUserId` or
  `worker` while the task is OPEN, plus their own quote at any status; once
  it isn't OPEN, only their own. The Quotes section lists the others as
  "Worker" with the price, times, message and when it was sent (FE-370);
  the viewer's own quote stays in the summary.
- API contract: an AWARDED task returns the order for its poster and booked
  worker. Without it the owner falls back to `visitor.awarded`.
