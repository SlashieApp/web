import { ApolloProvider } from '@apollo/client/react'
import { OrderPartyRole, OrderStatus } from '@codegen/schema'
import type { Decorator } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { createStoryApolloClient } from '@/app/(stepflow)/stepflowStoryHelpers'
import {
  TaskDetailContext,
  type TaskDetailContextValue,
} from '@/app/(task)/tasks/[slug]/context/TaskDetailContext'
import { getTaskDetailPermissions } from '@/app/(task)/tasks/[slug]/helpers/getTaskDetailPermissions'
import {
  type TaskDetailStoryViewer,
  storyMe,
  storyTaskDetail,
  storyTaskOrder,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

export type ReviewStoryConfig = {
  viewer?: TaskDetailStoryViewer
  /** Status of the viewer's order; `null` for no order at all. */
  orderStatus?: OrderStatus | null
  /** The task is still loading for the viewer. */
  pending?: boolean
  orderReview?: Partial<TaskDetailContextValue['orderReview']>
  /** Make sending fail with this message instead of hanging. */
  failSubmitWith?: string
  /**
   * Frozen by a suspension (BE-108): the task is suspended, or the other
   * person on the booking is.
   */
  suspended?: 'task' | 'counterparty'
}

const HOUR_MS = 60 * 60 * 1000

/** A review the viewer already left, `hoursAgo` hours back (editable for 48). */
export function storyViewerReview(
  hoursAgo: number,
  overrides: { stars?: number; comment?: string } = {},
) {
  return {
    id: 'review-story-1',
    stars: 4,
    comment: 'Clear about the time and left the place tidy.',
    createdAt: new Date(Date.now() - hoursAgo * HOUR_MS).toISOString(),
    ...overrides,
  }
}

/**
 * The slice of the task-detail context the review screen reads. The real
 * provider also queries the review state, which a story cannot answer, so
 * the context is built statically; anything else it is asked for is
 * `undefined` and would show up as a failing story.
 */
function reviewStoryContext({
  viewer = 'customer',
  orderStatus = OrderStatus.Completed,
  pending = false,
  orderReview = {},
  suspended,
}: ReviewStoryConfig): TaskDetailContextValue {
  const task = storyTaskDetail({
    suspension:
      suspended === 'task' ? { bySlashie: true, posterSuspended: false } : null,
  })
  const me = viewer === 'visitor' ? null : storyMe(viewer)
  const myOrder = orderStatus
    ? storyTaskOrder({
        status: orderStatus,
        counterpartySuspension:
          suspended === 'counterparty'
            ? {
                role: OrderPartyRole.Worker,
                name: 'Jordan Lee',
                canReopen: false,
              }
            : null,
      })
    : null
  const isAuthenticated = viewer !== 'visitor'
  return {
    taskId: task.id,
    task,
    me,
    myOrder,
    pending,
    isAuthenticated,
    statusReady: true,
    permissions: getTaskDetailPermissions({
      task,
      myOrder,
      me,
      myQuote: null,
      isAuthenticated,
    }),
    orderReview: {
      canSubmit: true,
      viewerReview: null,
      counterpartyReview: null,
      unavailable: false,
      loading: false,
      refetch: async () => {},
      ...orderReview,
    },
  } as unknown as TaskDetailContextValue
}

/** Static task-detail context plus a story-only Apollo client for the review mutations. */
export function withReviewStory(config: ReviewStoryConfig = {}): Decorator {
  const client = createStoryApolloClient({ failWith: config.failSubmitWith })
  const value = reviewStoryContext(config)
  return (Story) => (
    <ApolloProvider client={client}>
      <TaskDetailContext.Provider value={value}>
        <Story />
      </TaskDetailContext.Provider>
    </ApolloProvider>
  )
}

/** Generous, so a loaded CI machine does not flake the play functions. */
const WAIT = { timeout: 3000 }

/** Picks a star rating, then presses Continue and waits for the next heading. */
export async function rateAndContinue(
  canvasElement: HTMLElement,
  stars: number,
  nextHeading: RegExp,
) {
  const canvas = within(canvasElement)
  await userEvent.click(
    await canvas.findByRole('radio', { name: `${stars} out of 5 stars` }, WAIT),
  )
  await userEvent.click(canvas.getByRole('button', { name: /^continue/i }))
  await expect(
    await canvas.findByRole('heading', { name: nextHeading }, WAIT),
  ).toBeVisible()
}

/** Walks a new review to its last step, with an optional comment. */
export async function reachSubmitStep(
  canvasElement: HTMLElement,
  comment = 'Clear about the time and left the place tidy.',
) {
  const canvas = within(canvasElement)
  await rateAndContinue(canvasElement, 5, /add a comment/i)
  if (comment) {
    await userEvent.type(
      await canvas.findByRole('textbox', undefined, WAIT),
      comment,
    )
  }
  await userEvent.click(canvas.getByRole('button', { name: /^continue/i }))
  await expect(
    await canvas.findByRole('heading', { name: /send your review/i }, WAIT),
  ).toBeVisible()
}
