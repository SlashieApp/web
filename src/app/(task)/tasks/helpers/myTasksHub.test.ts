import { describe, expect, it } from 'vitest'

import {
  type MyTaskOrderSource,
  type MyTaskSource,
  buildMyTasksHub,
} from './myTasksHub'

const NOW = new Date(2026, 8, 23, 15, 0, 0)
const ME = 'me'

function task(
  partial: Partial<MyTaskSource> &
    Pick<MyTaskSource, 'id' | 'title' | 'status'>,
): MyTaskSource {
  return {
    description: '',
    categories: ['HANDYMAN'],
    ...partial,
  }
}

function order(
  partial: Partial<MyTaskOrderSource> &
    Pick<MyTaskOrderSource, 'taskId' | 'status'>,
): MyTaskOrderSource {
  return {
    customerUserId: 'customer',
    workerUserId: 'worker',
    ...partial,
  }
}

describe('buildMyTasksHub', () => {
  it('groups hosted open tasks and pending quotes into Open, with both role tags', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      orders: [],
      posted: [
        task({
          id: 'hosted-open',
          title: 'Hosted open',
          status: 'OPEN',
          datetime: { type: 'FLEXIBLE' },
        }),
        task({
          id: 'dual',
          title: 'Dual role',
          status: 'OPEN',
          quotes: [
            {
              id: 'q-me',
              workerUserId: ME,
              status: 'PENDING',
            },
          ],
        }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'quoted',
            title: 'Quoted pending',
            status: 'OPEN',
            datetime: { type: 'EXACT', date: '2026-09-24', time: '09:00' },
          }),
          quote: { id: 'q1', workerUserId: ME, status: 'PENDING' },
        },
        {
          task: task({
            id: 'dual',
            title: 'Dual role',
            status: 'OPEN',
          }),
          quote: { id: 'q-me', workerUserId: ME, status: 'PENDING' },
        },
      ],
    })

    const open = sections.find((section) => section.id === 'open')
    expect(open?.rows.map((row) => row.id)).toEqual([
      'quoted',
      'dual',
      'hosted-open',
    ])
    expect(open?.rows.find((row) => row.id === 'hosted-open')?.roles).toEqual([
      'hosted',
    ])
    expect(open?.rows.find((row) => row.id === 'quoted')?.roles).toEqual([
      'quoted',
    ])
    expect(open?.rows.find((row) => row.id === 'dual')?.roles).toEqual([
      'hosted',
      'quoted',
    ])
  })

  it('sorts a section overdue, then soonest upcoming, then flexible, then completed', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      orders: [
        order({
          taskId: 'done-old',
          status: 'COMPLETED',
          customerUserId: ME,
          closedAt: '2026-09-01T12:00:00',
        }),
        order({
          taskId: 'done-new',
          status: 'CANCELLED',
          customerUserId: ME,
          closedAt: '2026-09-20T12:00:00',
        }),
      ],
      posted: [
        task({
          id: 'overdue',
          title: 'Overdue',
          status: 'OPEN',
          datetime: { type: 'EXACT', date: '2026-09-20', time: '09:00' },
        }),
        task({
          id: 'later',
          title: 'Later',
          status: 'OPEN',
          datetime: { type: 'EXACT', date: '2026-10-01', time: '09:00' },
        }),
        task({
          id: 'soon',
          title: 'Soon',
          status: 'OPEN',
          datetime: { type: 'EXACT', date: '2026-09-24', time: '09:00' },
        }),
        task({
          id: 'today',
          title: 'Today',
          status: 'OPEN',
          datetime: { type: 'EXACT', date: '2026-09-23', time: '18:00' },
        }),
        task({
          id: 'flex',
          title: 'Flex',
          status: 'OPEN',
          datetime: { type: 'FLEXIBLE' },
        }),
        task({
          id: 'before',
          title: 'Before past',
          status: 'OPEN',
          datetime: { type: 'BEFORE', date: '2026-09-18' },
        }),
        task({
          id: 'done-old',
          title: 'Done old',
          status: 'AWARDED',
        }),
        task({
          id: 'done-new',
          title: 'Done new',
          status: 'AWARDED',
        }),
      ],
      sentQuotes: [],
    })

    expect(sections.map((section) => section.id)).toEqual(['open', 'completed'])
    expect(sections[0]?.rows.map((row) => row.id)).toEqual([
      'before',
      'overdue',
      'today',
      'soon',
      'later',
      'flex',
    ])
    expect(sections[0]?.rows.map((row) => row.timing.kind)).toEqual([
      'overdue',
      'overdue',
      'today',
      'tomorrow',
      'scheduled',
      'flexible',
    ])
    expect(sections[1]?.rows.map((row) => row.id)).toEqual([
      'done-new',
      'done-old',
    ])
  })

  it('puts booked work ahead of ended quotes and keeps a single accepted worker', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      orders: [
        order({
          taskId: 'active',
          status: 'ACTIVE',
          workerUserId: ME,
          customerUserId: 'host',
        }),
      ],
      posted: [
        task({
          id: 'awarded',
          title: 'Awarded',
          status: 'AWARDED',
          quotes: [
            {
              id: 'w1',
              workerUserId: 'worker-a',
              status: 'ACCEPTED',
              worker: { profile: { name: 'Alex' } },
            },
            {
              id: 'w2',
              workerUserId: 'worker-b',
              status: 'ACCEPTED',
              worker: { profile: { name: 'Blair' } },
            },
          ],
        }),
        task({
          id: 'cancelled',
          title: 'Cancelled',
          status: 'CANCELLED',
        }),
        task({
          id: 'draft',
          title: 'Draft',
          status: 'DRAFT',
          datetime: { type: 'FLEXIBLE' },
        }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'active',
            title: 'My booking',
            status: 'AWARDED',
          }),
          quote: { id: 'mine', workerUserId: ME, status: 'ACCEPTED' },
        },
        {
          task: task({
            id: 'lost',
            title: 'Lost bid',
            status: 'AWARDED',
          }),
          quote: { id: 'lost', workerUserId: ME, status: 'DECLINED' },
        },
        {
          task: task({
            id: 'beaten',
            title: 'Someone else got it',
            status: 'AWARDED',
          }),
          quote: { id: 'beaten', workerUserId: ME, status: 'NOT_SELECTED' },
        },
      ],
    })

    const booked = sections.find((section) => section.id === 'booked')
    const completed = sections.find((section) => section.id === 'completed')
    const open = sections.find((section) => section.id === 'open')

    expect(open?.rows.map((row) => row.id)).toEqual(['draft'])
    expect(booked?.rows.map((row) => row.id)).toEqual(['awarded', 'active'])
    expect(booked?.rows.find((row) => row.id === 'active')?.roles).toEqual([
      'quoted',
    ])
    expect(
      booked?.rows.find((row) => row.id === 'awarded')?.acceptedWorkerName,
    ).toBe('Alex')
    expect(completed?.rows.map((row) => row.id)).toEqual([
      'cancelled',
      'lost',
      'beaten',
    ])
    expect(
      completed?.rows.filter((row) => row.notSelected).map((row) => row.id),
    ).toEqual(['beaten'])
    expect(sections.map((section) => section.id)).toEqual([
      'booked',
      'open',
      'completed',
    ])
  })

  it('files cancelled bookings as Completed, keeps CONFLICT booked, and dates booked rows from the booking', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      orders: [
        order({
          taskId: 'cancelled-booking',
          status: 'CANCELLED',
          customerUserId: ME,
          closedAt: '2026-09-21T12:00:00',
        }),
        order({
          taskId: 'conflict',
          status: 'CONFLICT',
          customerUserId: ME,
        }),
        order({
          taskId: 'booked',
          status: 'ACTIVE',
          customerUserId: ME,
          bookedStart: new Date('2026-09-23T18:00:00').toISOString(),
        }),
      ],
      posted: [
        task({
          id: 'cancelled-booking',
          title: 'Cancelled',
          status: 'AWARDED',
        }),
        task({ id: 'conflict', title: 'Conflict', status: 'AWARDED' }),
        task({
          id: 'booked',
          title: 'Booked',
          status: 'AWARDED',
          datetime: { type: 'FLEXIBLE' },
        }),
      ],
      sentQuotes: [],
    })

    const ids = (id: string) =>
      sections.find((section) => section.id === id)?.rows.map((row) => row.id)
    expect(ids('completed')).toEqual(['cancelled-booking'])
    expect(ids('booked')).toEqual(['booked'])
    // A CONFLICT booking still counts as booked, and it waits on you.
    const conflict = sections
      .find((section) => section.id === 'needsYou')
      ?.rows.find((row) => row.id === 'conflict')
    expect(conflict?.section).toBe('booked')
    expect(conflict?.ask).toBe('conflict')
    expect(
      sections
        .find((section) => section.id === 'booked')
        ?.rows.find((row) => row.id === 'booked')?.timing.kind,
    ).toBe('today')
  })

  it('files a COMPLETED order under Completed and leaves legacy CLOSED booked', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      orders: [
        order({
          taskId: 'done',
          status: 'COMPLETED',
          customerUserId: ME,
          closedAt: '2026-09-20T12:00:00',
        }),
        order({
          taskId: 'legacy',
          status: 'CLOSED',
          customerUserId: ME,
          closedAt: '2026-09-19T12:00:00',
        }),
      ],
      posted: [
        task({
          id: 'done',
          title: 'Done order',
          status: 'AWARDED',
        }),
        task({
          id: 'legacy',
          title: 'Legacy closed',
          status: 'AWARDED',
        }),
      ],
      sentQuotes: [],
    })

    expect(
      sections
        .find((section) => section.id === 'completed')
        ?.rows.map((row) => row.id),
    ).toEqual(['done'])
    expect(
      sections
        .find((section) => section.id === 'booked')
        ?.rows.map((row) => row.id),
    ).toEqual(['legacy'])
  })

  it('files what waits on you under Needs you, using task detail views', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({
          id: 'compare',
          title: 'Quotes to compare',
          status: 'OPEN',
          quotes: [
            { id: 'q1', workerUserId: 'w1', status: 'PENDING' },
            { id: 'q2', workerUserId: 'w2', status: 'PENDING' },
            { id: 'q3', workerUserId: 'w3', status: 'DECLINED' },
          ],
        }),
        task({ id: 'calm', title: 'No quotes yet', status: 'OPEN' }),
        task({
          id: 'moving',
          title: 'Asked to move',
          status: 'AWARDED',
          quotes: [
            {
              id: 'qa',
              workerUserId: 'worker',
              status: 'ACCEPTED',
              worker: { profile: { name: 'Alex Kim' } },
            },
          ],
        }),
      ],
      sentQuotes: [
        {
          task: task({
            id: 'started',
            title: 'Job time has started',
            status: 'AWARDED',
            poster: { id: 'customer', profile: { name: 'Priya Shah' } },
          }),
          quote: { id: 'mine', workerUserId: ME, status: 'ACCEPTED' },
        },
      ],
      orders: [
        order({
          taskId: 'moving',
          status: 'ACTIVE',
          customerUserId: ME,
          bookedStart: '2026-09-30T10:00:00.000Z',
          pendingRequest: { kind: 'RESCHEDULE', requestedByUserId: 'worker' },
        }),
        order({
          taskId: 'started',
          status: 'ACTIVE',
          workerUserId: ME,
          bookedStart: '2026-09-23T09:00:00.000Z',
        }),
      ],
    })

    const needsYou = sections.find((section) => section.id === 'needsYou')
    expect(
      needsYou?.rows.map((row) => [row.id, row.ask, row.counterpartyName]),
    ).toEqual([
      ['started', 'markDone', 'Priya Shah'],
      ['moving', 'answerReschedule', 'Alex Kim'],
      ['compare', 'compareQuotes', null],
    ])
    expect(
      needsYou?.rows.find((row) => row.id === 'compare')?.liveQuoteCount,
    ).toBe(2)
    // Rows keep their status and leave their old group.
    expect(needsYou?.rows.map((row) => row.section)).toEqual([
      'booked',
      'booked',
      'open',
    ])
    expect(
      sections
        .find((section) => section.id === 'open')
        ?.rows.map((row) => row.id),
    ).toEqual(['calm'])
    expect(sections.find((section) => section.id === 'booked')).toBeUndefined()
  })

  it('shows the agreed price on booked work instead of the budget', () => {
    const sections = buildMyTasksHub({
      now: NOW,
      userId: ME,
      posted: [
        task({
          id: 'booked',
          title: 'Booked',
          status: 'AWARDED',
          budget: { amount: 80 },
        }),
      ],
      sentQuotes: [],
      orders: [
        order({
          taskId: 'booked',
          status: 'ACTIVE',
          customerUserId: ME,
          bookedStart: '2026-09-30T10:00:00.000Z',
          agreedPrice: { amount: 95 },
        }),
      ],
    })
    expect(sections[0]?.rows[0]?.priceLabel).toBe('£95')
  })
})
