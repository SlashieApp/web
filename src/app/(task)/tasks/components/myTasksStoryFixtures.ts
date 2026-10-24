import type { MyTaskHubRow, MyTaskHubSection } from '../helpers/myTasksHub'

const PHOTO =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop'

/** A local date and time in 2026, as the hub's ISO instants. */
function at(month: number, day: number, hour = 0, minute = 0): string {
  return new Date(2026, month - 1, day, hour, minute).toISOString()
}

function row(
  base: Pick<MyTaskHubRow, 'id' | 'title' | 'section'> & Partial<MyTaskHubRow>,
): MyTaskHubRow {
  return {
    location: 'Islington',
    priceLabel: '£80',
    categories: ['Handyman'],
    roles: ['hosted'],
    when: null,
    liveQuoteCount: 0,
    outcome: null,
    endedAt: null,
    action: null,
    orderId: null,
    suspended: false,
    ...base,
  }
}

/** One of each kind of My Tasks row, posted (Hosted) and quoted. */
export const storyRows = {
  /** Your booked job from yesterday, not marked yet: Overdue, Mark done. */
  upcomingOverdue: row({
    id: 'upcoming-overdue',
    title: 'Replace a light fitting',
    section: 'upcoming',
    when: { day: 'overdue', at: at(10, 21, 9, 0), time: true },
    priceLabel: '£150',
    categories: ['Electrical'],
    action: 'markDone',
    orderId: 'order-overdue',
  }),
  /** A job you won today; the customer marked it Done: Confirm done. */
  upcomingToday: row({
    id: 'upcoming-today',
    title: 'Deep-clean an oven',
    section: 'upcoming',
    roles: ['quoted'],
    when: { day: 'today', at: at(10, 22, 9, 0), time: true },
    location: 'Hackney',
    priceLabel: '£65',
    categories: ['Cleaning'],
    action: 'confirmDone',
    orderId: 'order-today',
  }),
  /** A job you won; the customer asked to move it. */
  upcomingReschedule: row({
    id: 'upcoming-reschedule',
    title: 'Hang a mirror in the hall',
    section: 'upcoming',
    roles: ['quoted'],
    when: { day: 'tomorrow', at: at(10, 23, 10, 0), time: true },
    location: 'Hackney',
    priceLabel: '£120',
    action: 'answerReschedule',
    orderId: 'order-reschedule',
  }),
  /** Your booked job later this week: nothing to do, so the ⋮ menu. */
  upcomingWeekday: row({
    id: 'upcoming-weekday',
    title: 'Mount a 55-inch TV',
    section: 'upcoming',
    when: { day: 'weekday', at: at(10, 28, 16, 25), time: true },
    location: 'Southwark',
    priceLabel: '£120',
    categories: ['Tech setup'],
    thumbnailSrc: PHOTO,
    orderId: 'order-weekday',
  }),
  /** A job you won, more than a week out. */
  upcomingDate: row({
    id: 'upcoming-date',
    title: 'Paint a bedroom wall',
    section: 'upcoming',
    roles: ['quoted'],
    when: { day: 'date', at: at(11, 3, 9, 30), time: true },
    location: 'Camden',
    priceLabel: '£150',
    categories: ['Painting'],
    orderId: 'order-date',
  }),
  /** Your open task with quotes in: Compare quotes. */
  openCompare: row({
    id: 'open-compare',
    title: 'Fix a leaking kitchen tap',
    section: 'open',
    liveQuoteCount: 3,
    categories: ['Plumbing', 'Kitchen'],
    thumbnailSrc: PHOTO,
    action: 'compareQuotes',
  }),
  /** Your open task, no quotes yet, no photo (the category icon). */
  openNoQuotes: row({
    id: 'open-no-quotes',
    title: 'Clear out a garage',
    section: 'open',
    priceLabel: '£60',
    categories: ['Moving'],
  }),
  /** A quote you sent, waiting for an answer. */
  openQuoteSent: row({
    id: 'open-quote-sent',
    title: 'Assemble a standing desk',
    section: 'open',
    roles: ['quoted'],
    location: 'Camden',
    priceLabel: '£75',
    categories: ['Assembly'],
  }),
  /** Completed and not reviewed yet: Review. */
  pastReview: row({
    id: 'past-review',
    title: 'Deep-clean a studio flat',
    section: 'past',
    outcome: 'completed',
    endedAt: at(10, 20, 17, 0),
    priceLabel: '£95',
    categories: ['Cleaning'],
    action: 'review',
    orderId: 'order-review',
  }),
  /** Completed and already reviewed: the ⋮ menu. */
  pastCompleted: row({
    id: 'past-completed',
    title: 'Hang three shelves',
    section: 'past',
    roles: ['quoted'],
    outcome: 'completed',
    endedAt: at(9, 28, 12, 0),
    priceLabel: '£70',
    orderId: 'order-completed',
  }),
  pastCancelled: row({
    id: 'past-cancelled',
    title: 'Move two boxes',
    section: 'past',
    outcome: 'cancelled',
    endedAt: at(10, 12, 9, 0),
    priceLabel: '£40',
    categories: ['Moving'],
    orderId: 'order-cancelled',
  }),
  pastFailed: row({
    id: 'past-failed',
    title: 'Fix a door hinge',
    section: 'past',
    roles: ['quoted'],
    outcome: 'failed',
    endedAt: at(10, 2, 15, 0),
    priceLabel: '£50',
    orderId: 'order-failed',
  }),
  /** A quote that is over (someone else got the job, say): no end date in the hub's data. */
  pastClosed: row({
    id: 'past-closed',
    title: 'Clear a small garden',
    section: 'past',
    roles: ['quoted'],
    outcome: 'closed',
    priceLabel: '£90',
    categories: ['Gardening'],
  }),
}

/** Posts and quotes in every section; five Past tasks, so Past starts collapsed. */
export const allSections: MyTaskHubSection[] = [
  {
    id: 'upcoming',
    rows: [
      storyRows.upcomingOverdue,
      storyRows.upcomingToday,
      storyRows.upcomingReschedule,
      storyRows.upcomingWeekday,
      storyRows.upcomingDate,
    ],
  },
  {
    id: 'open',
    rows: [
      storyRows.openCompare,
      storyRows.openNoQuotes,
      storyRows.openQuoteSent,
    ],
  },
  {
    id: 'past',
    rows: [
      storyRows.pastReview,
      storyRows.pastCancelled,
      storyRows.pastFailed,
      storyRows.pastCompleted,
      storyRows.pastClosed,
    ],
  },
]

/** A new poster with one open task: Upcoming and Past are empty. */
export const emptySections: MyTaskHubSection[] = [
  { id: 'upcoming', rows: [] },
  { id: 'open', rows: [storyRows.openCompare] },
  { id: 'past', rows: [] },
]
