import { Stack } from '@chakra-ui/react'
import {
  Currency,
  OrderStatus,
  QuoteStatus,
  TaskBudgetType,
  TaskDateTimeType,
  TaskPaymentMethod,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentType } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { Card } from '@ui'

import { withTaskDetailStory } from '../../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../../helpers/taskDetailStoryExtras'
import {
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../../helpers/taskDetailStoryFixtures'
import {
  BookedTimeFact,
  BudgetFact,
  CategoriesFact,
  DescriptionFact,
  LocationFact,
  MyQuoteFact,
  PaymentFact,
  PhotosFact,
  PostedByFact,
  PreferredTimeFact,
} from './TaskFacts'

/** Hairline between facts, as in the Task summary. */
const FACT_DIVIDERS = {
  '& > * + *': { borderTopWidth: '1px', borderTopColor: 'border.default' },
} as const

function FactsCard({ facts }: { facts: ComponentType[] }) {
  return (
    <Card layout="section" framed maxW="560px">
      <Stack gap={0} css={FACT_DIVIDERS}>
        {facts.map((Fact) => (
          <Fact key={Fact.name} />
        ))}
      </Stack>
    </Card>
  )
}

/**
 * The summary's fact rows, one situation each. The Task summary stories show
 * them in the 43 views; these cover the variations inside a fact (budget
 * kinds, quote against budget, schedule chips, address privacy, long text).
 */
const meta = {
  title: 'Task detail/Summary/TaskFacts',
  component: BudgetFact,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BudgetFact>

export default meta
type Story = StoryObj<typeof meta>

/** One fact row on a task as a given viewer sees it. */
function fact(
  Fact: ComponentType,
  config: Partial<TaskDetailStoryConfig>,
): Story {
  return {
    render: () => <FactsCard facts={[Fact]} />,
    decorators: [withTaskDetailStory(config, { maxWidth: '640px' })],
  }
}

const swatch = (color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${color}"/></svg>`,
  )}`
const PHOTOS = ['#7aa17a', '#a17a7a', '#7a8fa1', '#a19a7a'].map(swatch)

const pad = (n: number) => String(n).padStart(2, '0')

/** Local date and time `hours` from now, as the task stores them. */
function inHours(hours: number) {
  const d = new Date(Date.now() + hours * 3_600_000)
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

const fixedBudget = {
  amount: 120,
  currency: Currency.Gbp,
  type: TaskBudgetType.OneOff,
  paymentMethod: TaskPaymentMethod.Cash,
}

/** The summary headline and facts follow the task; these tasks are all open. */
const visitor = { viewer: 'visitor' } as const

// ---------------------------------------------------------------- budget

/** Fixed price paid in cash: the figure, "Fixed price" and "Cash". */
export const BudgetFixed: Story = fact(BudgetFact, {
  ...visitor,
  task: storyTaskDetail({ budget: fixedBudget }),
})

/** An hourly rate. */
export const BudgetHourly: Story = fact(BudgetFact, {
  ...visitor,
  task: storyTaskDetail({
    budget: {
      amount: 18,
      currency: Currency.Gbp,
      type: TaskBudgetType.PerHour,
      paymentMethod: TaskPaymentMethod.BankTransfer,
    },
  }),
})

/** A day rate. */
export const BudgetDaily: Story = fact(BudgetFact, {
  ...visitor,
  task: storyTaskDetail({
    budget: {
      amount: 140,
      currency: Currency.Gbp,
      type: TaskBudgetType.PerDay,
      paymentMethod: TaskPaymentMethod.Cash,
    },
  }),
})

/** No budget on the task: "Open", with no kind or payment badges. */
export const BudgetOpen: Story = fact(BudgetFact, {
  ...visitor,
  task: storyTaskDetail({ budget: null }),
})

/** Opened from a search card: the card's price shows while the task loads. */
export const BudgetFromSearchCard: Story = {
  render: () => <FactsCard facts={[BudgetFact]} />,
  decorators: [withTaskDetailPending('listingSeed')],
}

/** Task still loading with no card: a skeleton figure. */
export const BudgetLoading: Story = {
  render: () => <FactsCard facts={[BudgetFact]} />,
  decorators: [withTaskDetailPending('loading')],
}

// --------------------------------------------------------------- payment

/** Payment method on its own (the headline already has the amount). */
export const PaymentCash: Story = fact(PaymentFact, {
  ...visitor,
  task: storyTaskDetail({ budget: fixedBudget }),
})

/** Bank transfer. */
export const PaymentBankTransfer: Story = fact(PaymentFact, {
  ...visitor,
  task: storyTaskDetail({
    budget: { ...fixedBudget, paymentMethod: TaskPaymentMethod.BankTransfer },
  }),
})

/** No budget, so no payment method: the row is left out. */
export const PaymentNone: Story = {
  render: () => <FactsCard facts={[PaymentFact]} />,
  decorators: [
    withTaskDetailStory({
      ...visitor,
      task: storyTaskDetail({ budget: null }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Payment')).toBeNull(),
    )
  },
}

// -------------------------------------------------------------- my quote

/** A worker's pending quote, with the budget beside it. */
function quoteStory(amount: number | null, extra = {}): Story {
  return fact(MyQuoteFact, {
    viewer: 'worker',
    task: storyTaskDetail({
      budget: amount === null ? null : fixedBudget,
      quotes: [
        storyTaskQuote({
          price: { amount: amount ?? 90, currency: Currency.Gbp },
          ...extra,
        }),
      ],
    }),
  })
}

/** Quote below the budget: "£35 under budget" in green. */
export const QuoteUnderBudget: Story = {
  ...quoteStory(85),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('£35 under budget')
  },
}

/** Quote above the budget: "£30 over budget" in amber. */
export const QuoteOverBudget: Story = {
  ...quoteStory(150),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('£30 over budget')
  },
}

/** Quote equal to the budget. */
export const QuoteMatchesBudget: Story = {
  ...quoteStory(120),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Matches the budget')
  },
}

/** The task has no budget: the quote shows with no comparison. */
export const QuoteNoBudget: Story = quoteStory(null)

/** A time the worker offered has passed: it is marked "Passed". */
export const QuoteWithPassedTime: Story = {
  ...quoteStory(85, {
    proposedSlots: [
      { id: 'slot-past', start: '2020-06-10T09:00:00.000Z', end: null },
      { id: 'slot-next', start: '2030-06-11T14:00:00.000Z', end: null },
    ],
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(/Passed/)
  },
}

// ------------------------------------------------------------- preferred

/** No set day: "Flexible". */
export const PreferredFlexible: Story = fact(PreferredTimeFact, {
  ...visitor,
  task: storyTaskDetail({
    datetime: { type: TaskDateTimeType.Flexible, date: null, time: null },
  }),
})

/** A day far ahead: the date and time, no countdown. */
export const PreferredLater: Story = fact(PreferredTimeFact, {
  ...visitor,
  task: storyTaskDetail({
    datetime: {
      type: TaskDateTimeType.Exact,
      date: '2030-06-10',
      time: '14:00',
    },
  }),
})

/** Within a day: a warning chip and a "Starts in" countdown. */
export const PreferredSoon: Story = {
  ...fact(PreferredTimeFact, {
    ...visitor,
    task: storyTaskDetail({
      datetime: { type: TaskDateTimeType.Exact, ...inHours(3) },
    }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(/Starts in/)
  },
}

/** "By" a date, with no exact start. */
export const PreferredBefore: Story = fact(PreferredTimeFact, {
  ...visitor,
  task: storyTaskDetail({
    datetime: {
      type: TaskDateTimeType.Before,
      date: '2030-06-21',
      time: null,
    },
  }),
})

/** Task still loading: a skeleton in place of the chip. */
export const PreferredLoading: Story = {
  render: () => <FactsCard facts={[PreferredTimeFact]} />,
  decorators: [withTaskDetailPending('loading')],
}

// ---------------------------------------------------------------- booked

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

/** The booked slot a few hours away: date, time and a "Starts in" countdown. */
export const BookedSoon: Story = {
  ...fact(BookedTimeFact, {
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Active,
      bookedStart: new Date(Date.now() + 5 * 3_600_000).toISOString(),
      bookedEnd: new Date(Date.now() + 7 * 3_600_000).toISOString(),
    }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(/Starts in/)
  },
}

/** The booked slot weeks away: the label alone. */
export const BookedLater: Story = fact(BookedTimeFact, {
  viewer: 'worker',
  task: bookedTask,
  order: storyTaskOrder({
    bookedStart: '2030-06-10T09:00:00.000Z',
    bookedEnd: '2030-06-10T11:00:00.000Z',
  }),
})

/** The booked time has started: the label with no countdown. */
export const BookedStarted: Story = fact(BookedTimeFact, {
  viewer: 'worker',
  task: bookedTask,
  order: storyTaskOrder(),
})

// -------------------------------------------------------------- location

/**
 * A visitor sees "Near" the town and nothing else: no info icon, no popover.
 * The map says it is approximate (the pill and the circle).
 */
export const LocationApproximate: Story = {
  ...fact(LocationFact, { ...visitor }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Near Westminster')
    // The row has no button, no hint text and no popover to open.
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(canvas.queryByText(/About this location/)).toBeNull()
    await expect(canvas.queryByText(/Approximate area/)).toBeNull()
  },
}

/** The same row in Traditional Chinese, from the `/zh-hk` prefix. */
export const LocationApproximateZhHk: Story = {
  ...fact(LocationFact, { ...visitor }),
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks/task-1' } } },
  decorators: [
    withTaskDetailStory(visitor, { maxWidth: '640px' }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Westminster附近')
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** A worker whose quote is still pending sees the town too, never the address. */
export const LocationPendingQuote: Story = {
  ...fact(LocationFact, { viewer: 'worker' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Near Westminster')
    await expect(canvas.queryByText(/12 Example Street/)).toBeNull()
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** The owner sees the full address and what workers see until they accept. */
export const LocationExactOwner: Story = {
  ...fact(LocationFact, { viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('12 Example Street, London SW1A 1AA')
    await canvas.findByText(/Until you accept a quote/)
  },
}

/** The booked worker sees the address and an Open in Maps link. */
export const LocationExactBookedWorker: Story = {
  ...fact(LocationFact, {
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder(),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Open in Maps' })
  },
}

/** Opened from a search card: the card's place shows while the task loads. */
export const LocationFromSearchCard: Story = {
  render: () => <FactsCard facts={[LocationFact]} />,
  decorators: [withTaskDetailPending('listingSeed')],
}

/** Task still loading with no card: a skeleton line. */
export const LocationLoading: Story = {
  render: () => <FactsCard facts={[LocationFact]} />,
  decorators: [withTaskDetailPending('loading')],
}

// ------------------------------------------------------------ categories

/** Several categories: the first in brand colour, the rest neutral. */
export const CategoriesSeveral: Story = fact(CategoriesFact, {
  ...visitor,
  task: storyTaskDetail({
    categories: ['HANDYMAN', 'TECH_SETUP', 'Gardening', 'Dog walking'],
  }),
})

/** One category. */
export const CategoriesOne: Story = fact(CategoriesFact, {
  ...visitor,
  task: storyTaskDetail({ categories: ['CLEANING'] }),
})

/** No categories from the API: guessed from the title, and not a link. */
export const CategoryGuessedFromTitle: Story = fact(CategoriesFact, {
  ...visitor,
  task: storyTaskDetail({
    title: 'Clean the flat before moving out',
    categories: [],
  }),
})

// ---------------------------------------------------------------- poster

/** Posted by someone else: their avatar and name link to their profile. */
export const PostedByVisitor: Story = {
  ...fact(PostedByFact, { ...visitor }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', {
      name: "View Alex Chen's profile",
    })
  },
}

/** The poster has no public name: "Task owner". */
export const PostedByNoName: Story = fact(PostedByFact, {
  ...visitor,
  task: storyTaskDetail({
    poster: {
      id: 'owner-detail-1',
      email: null,
      profile: { name: null, avatarUrl: null, contactNumber: null },
    } as never,
  }),
})

// ----------------------------------------------------------- description

const LONG_DESCRIPTION = [
  'We have recently moved into a Victorian terrace and need a handful of shelves put up across three rooms.',
  'The living room wall is plasterboard over brick, the hallway is solid brick and the study has a stud wall, so each needs different fixings.',
  'I will provide the shelves, brackets and a drill if you do not have a masonry bit, but please bring a spirit level, a stud finder and a cable detector.',
  'Two of the shelves are quite heavy (they will hold books), so I would like to be sure they are anchored properly rather than just screwed in.',
  'There is parking outside after 6pm, and the front door sticks, so give it a firm push.',
  'Happy to talk through the layout on a quick call before you quote.',
].join('\n\n')

/** A short description shows in full. */
export const DescriptionShort: Story = fact(DescriptionFact, { ...visitor })

/** A long description is cut after six lines, with Show more. */
export const DescriptionLong: Story = {
  ...fact(DescriptionFact, {
    ...visitor,
    task: storyTaskDetail({ description: LONG_DESCRIPTION }),
  }),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Show more' })
  },
}

/** Show more opens the whole text and offers Show less. */
export const DescriptionExpanded: Story = {
  ...DescriptionLong,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Show more' }),
    )
    await canvas.findByRole('button', { name: 'Show less' })
  },
}

/** No description: the row is left out. */
export const DescriptionMissing: Story = {
  render: () => <FactsCard facts={[DescriptionFact]} />,
  decorators: [
    withTaskDetailStory({
      ...visitor,
      task: storyTaskDetail({ description: '' }),
    }),
  ],
}

/** Opened from a search card: the card's description shows while loading. */
export const DescriptionFromSearchCard: Story = {
  render: () => <FactsCard facts={[DescriptionFact]} />,
  decorators: [withTaskDetailPending('listingSeed')],
}

/** Task still loading with no card: two skeleton lines. */
export const DescriptionLoading: Story = {
  render: () => <FactsCard facts={[DescriptionFact]} />,
  decorators: [withTaskDetailPending('loading')],
}

// ---------------------------------------------------------------- photos

/** Four photos as square thumbnails. */
export const PhotosFour: Story = fact(PhotosFact, {
  ...visitor,
  task: storyTaskDetail({ images: PHOTOS }),
})

/** Tapping a thumbnail opens that photo full screen, with the others a swipe away. */
export const PhotosPreviewOpen: Story = {
  ...PhotosFour,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: 'Mount bookshelf on living room wall photo 2',
      }),
    )
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Photo preview' },
    )
    await within(dialog).findByText('2 of 4')
  },
}

/** One photo. */
export const PhotosOne: Story = fact(PhotosFact, {
  ...visitor,
  task: storyTaskDetail({ images: PHOTOS.slice(0, 1) }),
})

/** No photos: the row is left out. */
export const PhotosNone: Story = fact(PhotosFact, {
  ...visitor,
  task: storyTaskDetail({ images: [] }),
})

/** Opened from a search card: the card's photo shows while loading. */
export const PhotosFromSearchCard: Story = {
  render: () => <FactsCard facts={[PhotosFact]} />,
  decorators: [withTaskDetailPending('listingSeed')],
}
