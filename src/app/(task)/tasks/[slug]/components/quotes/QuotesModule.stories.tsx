import { QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_CLOSED_STATUS,
  STORY_WORKER_ID,
  storyPublicQuote,
  storyTaskDetail,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { QuotesModule } from './QuotesModule'

/**
 * The task-detail Quotes module's states (approved contact sheet v2).
 * C1–C4 = customer/owner states, W1–W8 = visitor/worker states, less W7
 * (declined), which went with the Decline action (BE-113). State derives from
 * `getTaskDetailPermissions` + quote data seeded by the story decorator.
 * Anyone but the owner sees the other live quotes without who sent them
 * (FE-370).
 */
const meta = {
  title: 'Task detail/Quotes/QuotesModule',
  component: QuotesModule,
  tags: ['autodocs'],
} satisfies Meta<typeof QuotesModule>

export default meta
type Story = StoryObj<typeof meta>

const SIDEBAR = { maxWidth: '380px' }
const QUOTE_LIST = { maxWidth: '960px' }

const competitorA = storyTaskQuote({
  id: 'quote-a',
  workerUserId: 'worker-user-a',
  price: { amount: 95, currency: 'GBP' as never },
  message: 'I can assemble your wardrobe carefully and quickly.',
})

const competitorB = storyTaskQuote({
  id: 'quote-b',
  workerUserId: 'worker-user-b',
  price: { amount: 85, currency: 'GBP' as never },
  message: 'Happy to help with your build.',
  worker: {
    id: 'worker-user-b',
    profile: { name: 'Maria L.', avatarUrl: null },
    worker: { id: 'worker-profile-b', isVerified: false },
  } as never,
})

const competitorC = storyTaskQuote({
  id: 'quote-c',
  workerUserId: 'worker-user-c',
  price: { amount: 110, currency: 'GBP' as never },
  message: 'Experienced flat-pack specialist.',
  worker: {
    id: 'worker-user-c',
    profile: { name: 'Sam K.', avatarUrl: null },
    worker: { id: 'worker-profile-c', isVerified: true },
  } as never,
})

const myPendingQuote = storyTaskQuote({
  id: 'quote-mine',
  workerUserId: STORY_WORKER_ID,
  price: { amount: 90, currency: 'GBP' as never },
  message: 'I can assemble your wardrobe with care and attention.',
  status: QuoteStatus.Pending,
})

/** competitorA and B as anyone but the owner gets them: no worker (BE-105). */
const publicA = storyPublicQuote({
  id: 'quote-a',
  price: competitorA.price,
  message: competitorA.message,
})
const publicB = storyPublicQuote({
  id: 'quote-b',
  price: competitorB.price,
  message: competitorB.message,
})

/**
 * The other quotes, read-only and anonymous: "Worker" with a placeholder,
 * the price, times and message, and no name, photo or profile link.
 */
async function expectAnonymousRows(
  canvasElement: HTMLElement,
  prices: string[],
) {
  const canvas = within(canvasElement)
  await canvas.findByText('Quotes')
  await waitFor(() =>
    expect(canvas.getAllByText('Worker')).toHaveLength(prices.length),
  )
  for (const price of prices) await canvas.findByText(price)
  // The proposed times and when it was sent, on each row.
  await expect(canvas.getAllByText(/ Jun, \d{2}:\d{2}.* ago$/)).toHaveLength(
    prices.length,
  )
  expect(canvas.queryByRole('link')).toBeNull()
  expect(canvas.queryByRole('img')).toBeNull()
  expect(canvas.queryByText(/Jordan Lee|Maria L\.|Sam K\./)).toBeNull()
  expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
}

// ------------------------------------------------------------- customer

/** C1 · owner, no quotes: the section is hidden (renders nothing). */
export const C1CustomerEmpty: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'owner', task: storyTaskDetail({ quotes: [] }) },
      SIDEBAR,
    ),
  ],
}

/** C2 · owner, quotes: sort + list + Accept per pending card, with who sent each. */
export const C2CustomerList: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [competitorA, competitorB, competitorC],
        }),
      },
      QUOTE_LIST,
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Maria L.' })
    await canvas.findByRole('link', { name: 'Sam K.' })
    await expect(
      canvas.getAllByRole('button', { name: 'Accept' }),
    ).toHaveLength(3)
    // Accept is the owner's only answer to a quote.
    expect(canvas.queryByRole('button', { name: 'Decline' })).toBeNull()
  },
}

/**
 * C2 · owner, one quote closed (the booking ended early and the task is open
 * again): a neutral "Closed", no Accept for it, and the pending ones keep
 * theirs.
 */
export const C2CustomerClosedQuote: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [
            { ...competitorB, status: STORY_CLOSED_STATUS },
            competitorA,
          ],
        }),
      },
      QUOTE_LIST,
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Closed')
    await expect(
      canvas.getAllByRole('button', { name: 'Accept' }),
    ).toHaveLength(1)
    expect(canvas.queryByText('CLOSED')).toBeNull()
  },
}

/**
 * C2 · owner, one quote from a suspended worker (BE-108): "Account
 * suspended", Accept off, and never Best match though it is the cheapest.
 * The other quotes stay as they were.
 */
export const C2CustomerSuspendedWorkerQuote: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [
            { ...competitorB, workerSuspended: true },
            competitorA,
            competitorC,
          ],
        }),
      },
      QUOTE_LIST,
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Account suspended')
    const accepts = canvas.getAllByRole('button', { name: 'Accept' })
    // Cheapest first: the suspended worker's £85 quote leads the list.
    await expect(accepts[0]).toBeDisabled()
    await expect(accepts[1]).toBeEnabled()
    await expect(canvas.queryByText('Best match')).toBeNull()
  },
}

/** Owner of a suspended task (BE-108): the quotes read-only, no Accept. */
export const C2CustomerTaskSuspended: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [competitorA, competitorB],
          suspension: { bySlashie: true, posterSuspended: false },
        }),
      },
      QUOTE_LIST,
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Maria L.' })
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** C3 · owner, partial cap: slots strip + mixed accepted/pending cards. */
export const C3CustomerSlotsFilled: Story = {
  render: () => <QuotesModule slotsCap={3} />,
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [
            { ...competitorA, status: QuoteStatus.Accepted },
            { ...competitorC, status: QuoteStatus.Accepted },
            competitorB,
          ],
        }),
      },
      QUOTE_LIST,
    ),
  ],
}

/**
 * C4 · owner, awarded: the booked quote says Accepted, and the others stay
 * PENDING (BE-113) with nothing to accept: only an open task can take a quote.
 */
export const C4CustomerAwarded: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          status: TaskStatus.Awarded,
          quotes: [
            { ...competitorA, status: QuoteStatus.Accepted },
            competitorB,
            competitorC,
          ],
        }),
      },
      SIDEBAR,
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Accepted')
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

// -------------------------------------------------------- visitor/worker

/** W1 · visitor, no quotes yet: nothing to list, so no section. */
export const W1Visitor: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'visitor', task: storyTaskDetail({ quotes: [] }) },
      SIDEBAR,
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Quotes')).toBeNull(),
    )
  },
}

/** W1 · visitor, task open with quotes: every live quote, without who sent it. */
export const W1VisitorSeesQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'visitor',
        task: storyTaskDetail({ quotes: [publicA, publicB] }),
      },
      QUOTE_LIST,
    ),
  ],
  play: ({ canvasElement }) =>
    expectAnonymousRows(canvasElement, ['£95', '£85']),
}

/** W2 · signed in, no worker profile: the live quotes, without who sent them. */
export const W2NoWorkerProfile: Story = {
  decorators: [
    withTaskDetailStory(
      {
        // storyMe('owner') identity, but the task belongs to someone else:
        // an authenticated customer without a worker profile.
        viewer: 'customer',
        task: storyTaskDetail({
          poster: {
            id: 'someone-else',
            email: 'other@example.com',
            profile: { name: 'Sam Poster', avatarUrl: null },
          } as never,
          quotes: [publicA, publicB],
        }),
      },
      SIDEBAR,
    ),
  ],
  play: ({ canvasElement }) =>
    expectAnonymousRows(canvasElement, ['£95', '£85']),
}

/** W3 · worker, no quotes yet: empty + Send a quote. */
export const W3WorkerEmpty: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'worker', task: storyTaskDetail({ quotes: [] }) },
      SIDEBAR,
    ),
  ],
}

/** W4 · worker, competitors exist: their quotes read-only, without who sent them. */
export const W4WorkerCompeting: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({ quotes: [publicA, publicB] }),
      },
      QUOTE_LIST,
    ),
  ],
  play: ({ canvasElement }) =>
    expectAnonymousRows(canvasElement, ['£95', '£85']),
}

/** W4 · even if a payload ever carried who sent them, the rows stay anonymous. */
export const W4NamesNeverShown: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({ quotes: [competitorB, competitorC] }),
      },
      QUOTE_LIST,
    ),
  ],
  play: ({ canvasElement }) =>
    expectAnonymousRows(canvasElement, ['£85', '£110']),
}

/** W5 · worker, own quote pending: the others listed; theirs is in the summary, not here. */
export const W5WorkerQuotePending: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          quotes: [myPendingQuote, publicA, publicB],
        }),
      },
      QUOTE_LIST,
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectAnonymousRows(canvasElement, ['£95', '£85'])
    expect(within(canvasElement).queryByText('£90')).toBeNull()
  },
}

/** W6 · worker, quote accepted: agreement lives on Booking, not this tab. */
export const W6WorkerAccepted: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          status: TaskStatus.Awarded,
          quotes: [{ ...myPendingQuote, status: QuoteStatus.Accepted }],
        }),
      },
      SIDEBAR,
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Quotes')).toBeNull(),
    )
  },
}

/**
 * W4 · worker whose quote is closed (the booking ended early and the task is
 * open again): the other live quotes, not theirs, and no status text.
 */
export const W4WorkerQuoteClosed: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          quotes: [{ ...myPendingQuote, status: STORY_CLOSED_STATUS }, publicA],
        }),
      },
      SIDEBAR,
    ),
  ],
  play: async ({ canvasElement }) => {
    await expectAnonymousRows(canvasElement, ['£95'])
    expect(within(canvasElement).queryByText('Closed')).toBeNull()
    expect(within(canvasElement).queryByText('CLOSED')).toBeNull()
  },
}

/**
 * W8 · someone else was booked: the worker's quote stays PENDING (BE-113) and
 * the API sends only their own, so the section goes, with no empty heading or
 * count.
 */
export const W8WorkerTaskFull: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'worker',
        task: storyTaskDetail({
          status: TaskStatus.Awarded,
          quotes: [myPendingQuote],
        }),
      },
      SIDEBAR,
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Quotes')).toBeNull(),
    )
    expect(within(canvasElement).queryByText('0')).toBeNull()
  },
}

/** Signed out, task no longer open: no quotes come back, so no section. */
export const VisitorTaskBooked: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'visitor',
        task: storyTaskDetail({ status: TaskStatus.Awarded, quotes: [] }),
      },
      SIDEBAR,
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).queryByText('Quotes')).toBeNull(),
    )
  },
}

// ------------------------------------------------------------ accept flow

/** The accept confirmation portals to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** C2 · owner presses Accept: pick one of the worker's times, then confirm. */
export const C2AcceptPickATime: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [competitorA, competitorB, competitorC],
        }),
      },
      QUOTE_LIST,
    ),
  ],
  play: async ({ canvasElement }) => {
    const [accept] = await within(canvasElement).findAllByRole('button', {
      name: 'Accept',
    })
    await userEvent.click(accept)
    const dialog = page(canvasElement)
    await dialog.findByText('Pick a time')
    await dialog.findByText('The time you pick becomes the booking.')
  },
}

/** C2 · every time the worker offered has passed: the dialog says to ask again. */
export const C2AcceptNoFutureTimes: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          quotes: [
            {
              ...competitorA,
              proposedSlots: [
                {
                  id: 'slot-past',
                  start: '2020-01-01T09:00:00.000Z',
                  end: null,
                },
              ],
            },
          ],
        }),
      },
      QUOTE_LIST,
    ),
  ],
  play: async ({ canvasElement }) => {
    const accept = await within(canvasElement).findByRole('button', {
      name: 'Accept',
    })
    await userEvent.click(accept)
    await page(canvasElement).findByText(
      "All of this worker's times have passed. Ask them to send a new quote.",
    )
  },
}
