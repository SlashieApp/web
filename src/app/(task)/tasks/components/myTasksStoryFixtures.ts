import type { MyTaskHubRow, MyTaskHubSection } from '../helpers/myTasksHub'

const PHOTO =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop'

function row(
  base: Pick<MyTaskHubRow, 'id' | 'title' | 'section'> & Partial<MyTaskHubRow>,
): MyTaskHubRow {
  return {
    description: '',
    location: 'Islington',
    priceLabel: '£80',
    categories: ['Handyman'],
    ownerName: 'Sam Carter',
    roles: ['hosted'],
    timing: { kind: 'flexible' },
    quoteCount: 0,
    acceptedWorkerName: null,
    notSelected: false,
    ...base,
  }
}

/** One of each kind of My Tasks row. */
export const storyRows = {
  bookedToday: row({
    id: 'booked-today',
    title: 'Mount a 55-inch TV',
    section: 'booked',
    timing: { kind: 'today', time: '14:00' },
    acceptedWorkerName: 'Alex Kim',
    categories: ['Tech setup', 'Handyman'],
    priceLabel: '£120',
    location: 'Southwark',
    thumbnailSrc: PHOTO,
  }),
  bookedOverdue: row({
    id: 'booked-overdue',
    title: 'Paint a bedroom wall',
    section: 'booked',
    roles: ['quoted'],
    timing: { kind: 'overdue' },
    ownerName: 'Priya Shah',
    categories: ['Painting'],
    priceLabel: '£150',
    location: 'Hackney',
  }),
  openHosted: row({
    id: 'open-hosted',
    title: 'Fix a leaking kitchen tap',
    section: 'open',
    timing: { kind: 'before', date: '20 Oct' },
    quoteCount: 3,
    categories: ['Plumbing', 'Handyman', 'Repairs', 'Kitchen', 'Same day'],
  }),
  openQuoted: row({
    id: 'open-quoted',
    title: 'Assemble a standing desk',
    section: 'open',
    roles: ['quoted'],
    ownerName: 'Jordan Lee',
    categories: ['Assembly'],
    priceLabel: '£60',
    location: 'Camden',
  }),
  notSelected: row({
    id: 'not-selected',
    title: 'Clear a small garden',
    section: 'completed',
    roles: ['quoted'],
    notSelected: true,
    ownerName: 'Mia Wong',
    categories: ['Gardening'],
    priceLabel: '£90',
  }),
  quotedDone: row({
    id: 'quoted-done',
    title: 'Deep-clean a studio flat',
    section: 'completed',
    roles: ['quoted'],
    ownerName: 'Chris Patel',
    categories: ['Cleaning'],
    priceLabel: '£110',
  }),
  hostedDone: (n: number) =>
    row({
      id: `hosted-done-${n}`,
      title: ['Move two boxes', 'Hang three shelves', 'Fix a door hinge'][
        n % 3
      ] as string,
      section: 'completed',
      acceptedWorkerName: 'Alex Kim',
      categories: ['Moving'],
    }),
}

/** Posts tasks, no worker profile. */
export const customerSections: MyTaskHubSection[] = [
  { id: 'booked', rows: [storyRows.bookedToday] },
  { id: 'open', rows: [storyRows.openHosted] },
  { id: 'completed', rows: [storyRows.hostedDone(0)] },
]

/** Quotes on other people's tasks only. */
export const workerSections: MyTaskHubSection[] = [
  { id: 'booked', rows: [storyRows.bookedOverdue] },
  { id: 'open', rows: [storyRows.openQuoted] },
  { id: 'completed', rows: [storyRows.notSelected, storyRows.quotedDone] },
]

/** Posts and quotes; five completed rows, so Completed starts collapsed. */
export const dualRoleSections: MyTaskHubSection[] = [
  { id: 'booked', rows: [storyRows.bookedToday, storyRows.bookedOverdue] },
  { id: 'open', rows: [storyRows.openHosted, storyRows.openQuoted] },
  {
    id: 'completed',
    rows: [
      storyRows.hostedDone(0),
      storyRows.hostedDone(1),
      storyRows.notSelected,
      storyRows.hostedDone(2),
      storyRows.quotedDone,
    ],
  },
]
