import { describe, expect, it } from 'vitest'

import {
  type MyTaskHubSection,
  type MyTaskOrderSource,
  type MyTaskSource,
  buildMyTasksHub,
} from './myTasksHub'

/** Thursday 22 October 2026, 15:00 local time. */
const NOW = new Date(2026, 9, 22, 15, 0, 0)
const ME = 'me'

function local(month: number, day: number, hour = 0, minute = 0): string {
  return new Date(2026, month - 1, day, hour, minute).toISOString()
}

function task(
  partial: Partial<MyTaskSource> &
    Pick<MyTaskSource, 'id' | 'title' | 'status'>,
): MyTaskSource {
  return { categories: ['HANDYMAN'], ...partial }
}

function order(
  partial: Partial<MyTaskOrderSource> &
    Pick<MyTaskOrderSource, 'taskId' | 'status'>,
): MyTaskOrderSource {
  return {
    id: `order-${partial.taskId}`,
    customerUserId: 'customer',
    workerUserId: 'worker',
    bookedStart: null,
    ...partial,
  }
}

function idsIn(sections: MyTaskHubSection[], id: MyTaskHubSection['id']) {
  return sections.find((section) => section.id === id)?.rows.map((r) => r.id)
}

function rowFor(sections: MyTaskHubSection[], taskId: string) {
  return sections
    .flatMap((section) => section.rows)
    .find((r) => r.id === taskId)
}

/** A hosted, booked task with one order from the worker `w`. */
function hostedBooking(
  id: string,
  booking: Partial<MyTaskOrderSource>,
): { posted: MyTaskSource; order: MyTaskOrderSource } {
  return {
    posted: task({
      id,
      title: id,
      status: 'AWARDED',
      quotes: [{ id: `q-${id}`, workerUserId: 'w', status: 'ACCEPTED' }],
    }),
    order: order({
      taskId: id,
      status: 'ACTIVE',
      customerUserId: ME,
      workerUserId: 'w',
      bookedStart: local(10, 25, 10),
      ...booking,
    }),
  }
}

function hubOf(...bookings: ReturnType<typeof hostedBooking>[]) {
  return buildMyTasksHub({
    now: NOW,
    userId: ME,
    posted: bookings.map((b) => b.posted),
    sentQuotes: [],
    orders: bookings.map((b) => b.order),
  })
}

describe('buildMyTasksHub sections', () => {
  it('puts booked work in Upcoming, open tasks and pending quotes in Open, and ended work in Past', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({ id: 'hosted-open', title: 'Hosted open', status: 'OPEN' }),
        task({ id: 'draft', title: 'Draft', status: 'DRAFT' }),
        task({
          id: 'hosted-booked',
          title: 'Hosted booked',
          status: 'AWARDED',
        }),
        task({ id: 'hosted-done', title: 'Hosted done', status: 'AWARDED' }),
        task({ id: 'cancelled', title: 'Cancelled task', status: 'CANCELLED' }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'quoted-open',
            title: 'Quoted open',
            status: 'OPEN',
            datetime: { type: 'EXACT', date: '2026-10-25', time: '09:00' },
          }),
          quote: { id: 'q1', workerUserId: ME, status: 'PENDING' },
        },
        {
          task: task({ id: 'quoted-won', title: 'Won', status: 'AWARDED' }),
          quote: { id: 'q2', workerUserId: ME, status: 'ACCEPTED' },
        },
        {
          task: task({ id: 'conflict', title: 'Conflict', status: 'AWARDED' }),
          quote: { id: 'q3', workerUserId: ME, status: 'ACCEPTED' },
        },
        {
          task: task({ id: 'lost', title: 'Lost quote', status: 'AWARDED' }),
          quote: { id: 'q4', workerUserId: ME, status: 'NOT_SELECTED' },
        },
        {
          task: task({
            id: 'declined',
            title: 'Declined quote',
            status: 'OPEN',
          }),
          quote: { id: 'q5', workerUserId: ME, status: 'DECLINED' },
        },
      ],
      orders: [
        order({
          taskId: 'hosted-booked',
          status: 'ACTIVE',
          customerUserId: ME,
          bookedStart: local(10, 24, 10),
        }),
        order({
          taskId: 'hosted-done',
          status: 'COMPLETED',
          customerUserId: ME,
          closedAt: local(10, 20, 12),
        }),
        order({
          taskId: 'quoted-won',
          status: 'ACTIVE',
          workerUserId: ME,
          bookedStart: local(10, 23, 9),
        }),
        // A CONFLICT still needs both sides: it stays Upcoming.
        order({
          taskId: 'conflict',
          status: 'CONFLICT',
          workerUserId: ME,
          bookedStart: local(10, 21, 9),
        }),
      ],
    })

    expect(sections.map((section) => section.id)).toEqual([
      'upcoming',
      'open',
      'past',
    ])
    // Soonest first.
    expect(idsIn(sections, 'upcoming')).toEqual([
      'conflict',
      'quoted-won',
      'hosted-booked',
    ])
    // Soonest first; untimed last, by title.
    expect(idsIn(sections, 'open')).toEqual([
      'quoted-open',
      'draft',
      'hosted-open',
    ])
    // Newest first; rows without an end date last, by title.
    expect(idsIn(sections, 'past')).toEqual([
      'hosted-done',
      'cancelled',
      'declined',
      'lost',
    ])
  })

  it('returns the three sections, empty, before the user is known', () => {
    expect(
      buildMyTasksHub({ userId: null, posted: [], sentQuotes: [], orders: [] }),
    ).toEqual([
      { id: 'upcoming', rows: [] },
      { id: 'open', rows: [] },
      { id: 'past', rows: [] },
    ])
  })

  it('keeps one row per task, with both roles when you posted it and quoted on it', () => {
    const dual = task({
      id: 'dual',
      title: 'Dual',
      status: 'OPEN',
      quotes: [{ id: 'mine', workerUserId: ME, status: 'PENDING' }],
    })
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [dual],
      sentQuotes: [
        {
          task: dual,
          quote: { id: 'mine', workerUserId: ME, status: 'PENDING' },
        },
      ],
      orders: [],
    })
    const row = rowFor(sections, 'dual')
    expect(idsIn(sections, 'open')).toEqual(['dual'])
    expect(row?.roles).toEqual(['hosted', 'quoted'])
    // Your own quote is nothing to compare.
    expect(row?.liveQuoteCount).toBe(0)
    expect(row?.action).toBeNull()
  })
})

describe('buildMyTasksHub Upcoming day', () => {
  it('reads Overdue, Today, Tomorrow, a weekday this week, else the date; untimed jobs go last', () => {
    const untimed = task({
      id: 'untimed',
      title: 'Untimed',
      status: 'AWARDED',
      datetime: { type: 'FLEXIBLE' },
      quotes: [{ id: 'q', workerUserId: 'w', status: 'ACCEPTED' }],
    })
    const bookings = [
      hostedBooking('next-week', { bookedStart: local(10, 29, 9) }),
      hostedBooking('tuesday', { bookedStart: local(10, 27, 16, 25) }),
      hostedBooking('tomorrow', { bookedStart: local(10, 23, 8) }),
      hostedBooking('today', { bookedStart: local(10, 22, 18) }),
      hostedBooking('last-week', { bookedStart: local(10, 15, 9) }),
    ]
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [untimed, ...bookings.map((b) => b.posted)],
      sentQuotes: [],
      orders: bookings.map((b) => b.order),
    })

    const upcoming = sections.find((section) => section.id === 'upcoming')
    expect(upcoming?.rows.map((row) => [row.id, row.when])).toEqual([
      ['last-week', { day: 'overdue', at: local(10, 15, 9), time: true }],
      ['today', { day: 'today', at: local(10, 22, 18), time: true }],
      ['tomorrow', { day: 'tomorrow', at: local(10, 23, 8), time: true }],
      ['tuesday', { day: 'weekday', at: local(10, 27, 16, 25), time: true }],
      ['next-week', { day: 'date', at: local(10, 29, 9), time: true }],
      ['untimed', { day: 'flexible' }],
    ])
  })

  it("dates a booked job by the booking, not the poster's first preference", () => {
    const booking = hostedBooking('moved', { bookedStart: local(10, 23, 11) })
    booking.posted = {
      ...booking.posted,
      datetime: { type: 'EXACT', date: '2026-10-30', time: '09:00' },
    }
    expect(rowFor(hubOf(booking), 'moved')?.when).toEqual({
      day: 'tomorrow',
      at: local(10, 23, 11),
      time: true,
    })
  })

  it('reads a Before date without a booking as Before, or Overdue once it has passed', () => {
    const awarded = (id: string, date: string) =>
      task({
        id,
        title: id,
        status: 'AWARDED',
        datetime: { type: 'BEFORE', date },
        quotes: [{ id: `q-${id}`, workerUserId: 'w', status: 'ACCEPTED' }],
      })
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [awarded('soon', '2026-10-24'), awarded('late', '2026-10-20')],
      sentQuotes: [],
      orders: [],
    })
    expect(rowFor(sections, 'soon')?.when).toEqual({
      day: 'before',
      at: new Date(2026, 9, 24, 23, 59, 59).toISOString(),
      time: false,
    })
    expect(rowFor(sections, 'late')?.when).toMatchObject({ day: 'overdue' })
  })
})

describe('buildMyTasksHub buttons', () => {
  it.each([
    [
      'answerReschedule',
      { pendingRequest: { kind: 'RESCHEDULE', requestedByUserId: 'w' } },
    ],
    [
      'answerCancel',
      {
        status: 'CANCEL_REQUESTED',
        pendingRequest: { kind: 'CANCEL', requestedByUserId: 'w' },
      },
    ],
    ['markDone', { bookedStart: local(10, 22, 9) }],
    [
      'confirmDone',
      {
        bookedStart: local(10, 22, 9),
        counterpartyCloseAction: { kind: 'DONE' },
      },
    ],
    [
      'answerFailed',
      {
        bookedStart: local(10, 22, 9),
        counterpartyCloseAction: { kind: 'FAILED' },
      },
    ],
    [
      'conflict',
      {
        status: 'CONFLICT',
        myCloseAction: { kind: 'DONE' },
        counterpartyCloseAction: { kind: 'FAILED' },
      },
    ],
  ] as const)(
    'shows %s when task detail waits on you for it',
    (action, booking) => {
      const hub = hubOf(
        hostedBooking('job', booking as Partial<MyTaskOrderSource>),
      )
      expect(rowFor(hub, 'job')?.action).toBe(action)
    },
  )

  it.each([
    ['before the job time', {}],
    [
      'after you marked it Done',
      { bookedStart: local(10, 22, 9), myCloseAction: { kind: 'DONE' } },
    ],
    [
      'while your own reschedule waits',
      { pendingRequest: { kind: 'RESCHEDULE', requestedByUserId: ME } },
    ],
  ] as const)('shows the ⋮ menu (no button) %s', (_label, booking) => {
    const hub = hubOf(
      hostedBooking('job', booking as Partial<MyTaskOrderSource>),
    )
    expect(rowFor(hub, 'job')?.action).toBeNull()
  })

  it('asks you to compare live quotes on your open task, and not on a quote you sent', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({
          id: 'compare',
          title: 'Compare',
          status: 'OPEN',
          quotes: [
            { id: 'a', workerUserId: 'w1', status: 'PENDING' },
            { id: 'b', workerUserId: 'w2', status: 'PENDING' },
            { id: 'c', workerUserId: 'w3', status: 'DECLINED' },
          ],
        }),
        task({
          id: 'all-declined',
          title: 'All declined',
          status: 'OPEN',
          quotes: [{ id: 'd', workerUserId: 'w1', status: 'DECLINED' }],
        }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'sent',
            title: 'Sent',
            status: 'OPEN',
            quotes: [{ id: 'e', workerUserId: 'w4', status: 'PENDING' }],
          }),
          quote: { id: 'mine', workerUserId: ME, status: 'PENDING' },
        },
      ],
      orders: [],
    })
    expect(rowFor(sections, 'compare')).toMatchObject({
      action: 'compareQuotes',
      liveQuoteCount: 2,
    })
    expect(rowFor(sections, 'all-declined')?.action).toBeNull()
    expect(rowFor(sections, 'sent')).toMatchObject({
      action: null,
      liveQuoteCount: 0,
    })
  })

  it('offers Review on a completed job only while order.reviewState says you can review', () => {
    const done = (canSubmit: boolean | null) =>
      hostedBooking(`done-${canSubmit}`, {
        status: 'COMPLETED',
        closedAt: local(10, 20, 12),
        reviewState: canSubmit === null ? undefined : { canSubmit },
      })
    const cancelled = hostedBooking('cancelled', {
      status: 'CANCELLED',
      reviewState: { canSubmit: true },
    })
    const hub = hubOf(done(true), done(false), done(null), cancelled)

    expect(rowFor(hub, 'done-true')).toMatchObject({
      section: 'past',
      action: 'review',
      orderId: 'order-done-true',
    })
    expect(rowFor(hub, 'done-false')?.action).toBeNull()
    // No reviewState: no Review (nothing is guessed).
    expect(rowFor(hub, 'done-null')?.action).toBeNull()
    expect(rowFor(hub, 'cancelled')?.action).toBeNull()
  })
})

describe('buildMyTasksHub reopened and suspended tasks (BE-108)', () => {
  const pendingQuotes = [
    { id: 'q-a', workerUserId: 'w2', status: 'PENDING' },
    { id: 'q-b', workerUserId: 'w3', status: 'PENDING' },
    { id: 'q-w', workerUserId: 'w', status: 'DECLINED' },
  ]
  const oldBooking = order({
    id: 'order-old',
    taskId: 'reopened',
    status: 'CANCELLED',
    customerUserId: ME,
    workerUserId: 'w',
    bookedStart: local(10, 20, 10),
    closedAt: local(10, 21, 9),
    createdAt: local(10, 19, 9),
  })

  it('lists a reopened task under Open, not the cancelled booking it had', () => {
    const hub = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({
          id: 'reopened',
          title: 'Reopened',
          status: 'OPEN',
          quotes: pendingQuotes,
        }),
      ],
      sentQuotes: [],
      orders: [oldBooking],
    })
    expect(rowFor(hub, 'reopened')).toMatchObject({
      section: 'open',
      action: 'compareQuotes',
      liveQuoteCount: 2,
      outcome: null,
      orderId: null,
    })
  })

  it('reads a reopened task booked again by its new booking', () => {
    const hub = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({
          id: 'reopened',
          title: 'Reopened',
          status: 'AWARDED',
          quotes: [{ id: 'q-a', workerUserId: 'w2', status: 'ACCEPTED' }],
        }),
      ],
      sentQuotes: [],
      // The old one second, as `me.orders` may send it.
      orders: [
        order({
          id: 'order-new',
          taskId: 'reopened',
          status: 'ACTIVE',
          customerUserId: ME,
          workerUserId: 'w2',
          bookedStart: local(10, 22, 9),
          createdAt: local(10, 22, 8),
        }),
        oldBooking,
      ],
    })
    expect(rowFor(hub, 'reopened')).toMatchObject({
      section: 'upcoming',
      action: 'markDone',
      orderId: 'order-new',
    })
  })

  it('puts the worker whose booking a reopen cancelled under Past, as declined', () => {
    const hub = buildMyTasksHub({
      now: NOW,
      userId: 'w',
      posted: [],
      sentQuotes: [
        {
          task: task({
            id: 'reopened',
            title: 'Reopened',
            status: 'OPEN',
            poster: { id: ME },
          }),
          quote: { id: 'q-w', workerUserId: 'w', status: 'DECLINED' },
        },
      ],
      orders: [oldBooking],
    })
    expect(rowFor(hub, 'reopened')).toMatchObject({
      section: 'past',
      outcome: 'declined',
      orderId: null,
    })
  })

  it('keeps a suspended task in your list, with no button and no Edit task', () => {
    const suspension = { bySlashie: true, posterSuspended: false }
    const hub = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({
          id: 'suspended',
          title: 'Suspended',
          status: 'OPEN',
          quotes: pendingQuotes,
          suspension,
        }),
        task({
          id: 'live',
          title: 'Live',
          status: 'OPEN',
          quotes: pendingQuotes,
          suspension: null,
        }),
      ],
      sentQuotes: [],
      orders: [],
    })
    expect(rowFor(hub, 'suspended')).toMatchObject({
      section: 'open',
      action: null,
      liveQuoteCount: 2,
      suspended: true,
    })
    expect(rowFor(hub, 'live')).toMatchObject({
      action: 'compareQuotes',
      suspended: false,
    })
  })

  it('offers nothing on a booking whose other party is suspended', () => {
    const frozen = hostedBooking('frozen', {
      bookedStart: local(10, 22, 9),
      counterpartySuspension: { role: 'WORKER' },
    })
    const done = hostedBooking('done', {
      status: 'COMPLETED',
      closedAt: local(10, 20, 12),
      reviewState: { canSubmit: true },
      counterpartySuspension: { role: 'WORKER' },
    })
    const hub = hubOf(frozen, done)
    expect(rowFor(hub, 'frozen')).toMatchObject({
      section: 'upcoming',
      action: null,
      suspended: false,
    })
    expect(rowFor(hub, 'done')?.action).toBeNull()
  })
})

describe('buildMyTasksHub Past', () => {
  it('says how it ended and when, newest first', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({ id: 'completed', title: 'Completed', status: 'AWARDED' }),
        task({
          id: 'cancelled',
          title: 'Booking cancelled',
          status: 'AWARDED',
        }),
        task({ id: 'failed', title: 'Failed', status: 'AWARDED' }),
        task({
          id: 'task-cancelled',
          title: 'Task cancelled',
          status: 'CANCELLED',
        }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'not-selected',
            title: 'Not selected',
            status: 'AWARDED',
          }),
          quote: { id: 'q1', workerUserId: ME, status: 'NOT_SELECTED' },
        },
        {
          // Still PENDING, but another worker won.
          task: task({
            id: 'beaten',
            title: 'Beaten',
            status: 'AWARDED',
            quotes: [{ id: 'q9', workerUserId: 'w', status: 'ACCEPTED' }],
          }),
          quote: { id: 'q2', workerUserId: ME, status: 'PENDING' },
        },
        {
          task: task({ id: 'declined', title: 'Declined', status: 'AWARDED' }),
          quote: { id: 'q3', workerUserId: ME, status: 'DECLINED' },
        },
      ],
      orders: [
        order({
          taskId: 'completed',
          status: 'COMPLETED',
          customerUserId: ME,
          closedAt: local(10, 1, 12),
        }),
        order({
          taskId: 'cancelled',
          status: 'CANCELLED',
          customerUserId: ME,
          closedAt: local(10, 20, 12),
          myCloseAction: { kind: 'FAILED' },
        }),
        order({
          taskId: 'failed',
          status: 'CANCELLED',
          customerUserId: ME,
          closedAt: local(10, 10, 12),
          myCloseAction: { kind: 'FAILED' },
          counterpartyCloseAction: { kind: 'FAILED' },
        }),
      ],
    })

    const past = sections.find((section) => section.id === 'past')
    expect(past?.rows.map((row) => [row.id, row.outcome, row.endedAt])).toEqual(
      [
        ['cancelled', 'cancelled', local(10, 20, 12)],
        ['failed', 'failed', local(10, 10, 12)],
        ['completed', 'completed', local(10, 1, 12)],
        // No end date in the hub's data: last, by title.
        ['beaten', 'notSelected', null],
        ['declined', 'declined', null],
        ['not-selected', 'notSelected', null],
        ['task-cancelled', 'cancelled', null],
      ],
    )
    expect(past?.rows.every((row) => row.when === null)).toBe(true)
  })

  it('sorts Past without an end time by when you quoted, else when you posted it', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({ id: 'closed', title: 'Closed', status: 'AWARDED' }),
        task({
          id: 'posted',
          title: 'Posted',
          status: 'CANCELLED',
          createdAt: local(10, 1, 9),
        }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'quoted-late',
            title: 'Quoted late',
            status: 'AWARDED',
          }),
          quote: {
            id: 'q1',
            workerUserId: ME,
            status: 'NOT_SELECTED',
            createdAt: local(10, 21, 9),
          },
        },
        {
          task: task({
            id: 'quoted-early',
            title: 'Quoted early',
            status: 'AWARDED',
            createdAt: local(10, 30, 9),
          }),
          quote: {
            id: 'q2',
            workerUserId: ME,
            status: 'DECLINED',
            createdAt: local(9, 15, 9),
          },
        },
      ],
      orders: [
        order({
          taskId: 'closed',
          status: 'COMPLETED',
          customerUserId: ME,
          closedAt: local(10, 20, 12),
        }),
      ],
    })
    const past = sections.find((section) => section.id === 'past')
    // Your quote's time wins over the task's for a task you quoted.
    expect(past?.rows.map((row) => [row.id, row.endedAt])).toEqual([
      ['quoted-late', null],
      ['closed', local(10, 20, 12)],
      ['posted', null],
      ['quoted-early', null],
    ])
  })
})

describe('buildMyTasksHub prices', () => {
  it('shows the agreed price once booked, your quote on a quote you sent, else the budget', () => {
    const booked = hostedBooking('booked', { agreedPrice: { amount: 95 } })
    booked.posted = { ...booked.posted, budget: { amount: 80 } }
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        booked.posted,
        task({
          id: 'budget',
          title: 'Budget',
          status: 'OPEN',
          budget: { amount: 60 },
        }),
        task({ id: 'none', title: 'None', status: 'OPEN' }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'sent',
            title: 'Sent',
            status: 'OPEN',
            budget: { amount: 80 },
          }),
          quote: {
            id: 'mine',
            workerUserId: ME,
            status: 'PENDING',
            price: { amount: 75 },
          },
        },
      ],
      orders: [booked.order],
    })
    expect(rowFor(sections, 'booked')?.priceLabel).toBe('£95')
    expect(rowFor(sections, 'sent')?.priceLabel).toBe('£75')
    expect(rowFor(sections, 'budget')?.priceLabel).toBe('£60')
    expect(rowFor(sections, 'none')?.priceLabel).toBe('')
  })
})
