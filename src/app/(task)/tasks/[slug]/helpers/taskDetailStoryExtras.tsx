'use client'

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider, useApolloClient } from '@apollo/client/react'
import { Observable } from '@apollo/client/utilities'
import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useEffect, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { setTaskHandoff } from '@/app/(task)/helpers/taskCardHandoff'

import { TaskDetailProvider } from '../context/TaskDetailProvider'
import OrderReviewState from '../graphql/OrderReviewState.gql'
import TaskCore from '../graphql/TaskCore.gql'
import { STORY_TASK_ID, storyTaskDetail } from './taskDetailStoryFixtures'
import type { TaskDetailRecord } from './taskDetailUtils'

/**
 * Extra story-only seams for task detail, next to `withTaskDetailStory`:
 * the states the page is in before the task arrives, and cache seeds for
 * data the main decorator leaves out. Nothing here reaches the network.
 */

// Same guard as `withTaskDetailStory`: the real `getUser()` would query the
// live API whenever a sibling story's auth cookie is around.
useUserStore.setState({ getUser: async () => useUserStore.getState().user })

/** A request that never answers: the story stays in that state. */
function pending() {
  return new Observable<ApolloLink.Result>(() => {})
}

/** A listing card with no task behind it (what a stale click would leave). */
const NO_HANDOFF: TaskCardTask = {
  id: '__no-handoff__',
  title: '',
  description: '',
  location: '',
  priceLabel: '',
}

/** The card a visitor tapped on /search before the task page opened. */
export const storyListingSeed: TaskCardTask = {
  id: STORY_TASK_ID,
  title: 'Mount bookshelf on living room wall',
  description:
    'Need a worker to mount one IKEA bookshelf safely. Wall is plasterboard; fixings supplied.',
  location: 'Westminster',
  priceLabel: '£120',
  categories: ['Handyman'],
  distanceLabel: '1.2 miles',
  timingLabel: 'Flexible',
  thumbnailSrc:
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
}

/**
 * How the public task (TaskCore) settles before a real page has data:
 * - `loading`: the request is in flight (skeleton page).
 * - `error`: the request fails (error card with Try again).
 * - `listingSeed`: in flight, but the listing card seeds title, price,
 *   place and photo, as when a task opens from /search.
 * - `viewerLoading`: the public task is in, but the viewer's slice (Task:
 *   quotes, Activity, bookings) is still in flight.
 */
export type TaskDetailPendingMode =
  | 'loading'
  | 'error'
  | 'listingSeed'
  | 'viewerLoading'

function TaskDetailPendingRoot({
  mode,
  children,
}: {
  mode: TaskDetailPendingMode
  children: ReactNode
}) {
  const [client] = useState(() => {
    // A signed-out visitor, whatever an earlier story left in the store. The
    // auth cookie is shared with other test iframes, so it is left alone.
    useUserStore.getState().setMe(null)
    useUserStore.getState().setUser(null)
    setTaskHandoff(mode === 'listingSeed' ? storyListingSeed : NO_HANDOFF)
    const apollo = new ApolloClient({
      link: new ApolloLink((operation) =>
        mode === 'error' && operation.operationName === 'TaskCore'
          ? new Observable<ApolloLink.Result>((subscriber) => {
              subscriber.error(new Error('Failed to fetch'))
            })
          : pending(),
      ),
      cache: new InMemoryCache(),
    })
    if (mode === 'viewerLoading') {
      apollo.writeQuery({
        query: TaskCore,
        variables: { id: STORY_TASK_ID },
        data: taskCoreData(storyTaskDetail()),
      })
    }
    return apollo
  })

  // Drop the card so a later story does not paint it.
  useEffect(() => () => setTaskHandoff(NO_HANDOFF), [])

  return (
    <ApolloProvider client={client}>
      <TaskDetailProvider taskId={STORY_TASK_ID} captureView={false}>
        {children}
      </TaskDetailProvider>
    </ApolloProvider>
  )
}

/**
 * The task page before its public task has loaded. Supplies the provider
 * itself (without an SSR task), so use it instead of `withTaskDetailStory`.
 */
export function withTaskDetailPending(mode: TaskDetailPendingMode): Decorator {
  return (Story) => (
    <TaskDetailPendingRoot mode={mode}>
      <Story />
    </TaskDetailPendingRoot>
  )
}

/** TaskCore cache shape for a fixture task. */
function taskCoreData(task: TaskDetailRecord) {
  return {
    task: {
      __typename: 'Task' as const,
      id: task.id,
      title: task.title,
      description: task.description,
      categories: task.categories,
      views: task.views,
      budget: task.budget ? { __typename: 'TaskBudget', ...task.budget } : null,
      datetime: task.datetime
        ? { __typename: 'TaskDateTime', ...task.datetime }
        : null,
      images: task.images,
      status: task.status,
      location: {
        __typename: 'TaskLocation',
        lat: task.location?.lat ?? null,
        lng: task.location?.lng ?? null,
        name: task.location?.name ?? null,
      },
      poster: task.poster
        ? {
            __typename: 'User',
            id: task.poster.id,
            profile: {
              __typename: 'Profile',
              name: task.poster.profile?.name ?? null,
              avatarUrl: task.poster.profile?.avatarUrl ?? null,
            },
          }
        : null,
    },
  }
}

function TaskCoreSeed({
  task,
  children,
}: {
  task: TaskDetailRecord
  children: ReactNode
}) {
  const client = useApolloClient()
  useState(() => {
    client.writeQuery({
      query: TaskCore,
      variables: { id: task.id },
      data: taskCoreData(task),
    })
  })
  return children
}

/**
 * Seeds the public task into the story client, for components that mount
 * their own `TaskDetailProvider` (`TaskDetailScreen`). List it before
 * `withTaskDetailStory` so it sits inside that decorator's Apollo provider.
 */
export function withTaskCoreSeed(task: TaskDetailRecord): Decorator {
  return (Story) => (
    <TaskCoreSeed task={task}>
      <Story />
    </TaskCoreSeed>
  )
}

type StoryReview = {
  id: string
  stars: number
  comment?: string | null
  createdAt: string
}

export type OrderReviewSeed = {
  orderId: string
  canSubmit?: boolean
  viewerHasSubmittedReview?: boolean
  viewerReview?: StoryReview | null
  counterpartReview?: StoryReview | null
}

function reviewData(review: StoryReview | null | undefined) {
  return review ? { __typename: 'Review', comment: null, ...review } : null
}

function OrderReviewSeedRoot({
  seed,
  children,
}: {
  seed: OrderReviewSeed
  children: ReactNode
}) {
  const client = useApolloClient()
  useState(() => {
    client.writeQuery({
      query: OrderReviewState,
      variables: { id: seed.orderId },
      data: {
        order: {
          __typename: 'Order',
          id: seed.orderId,
          reviewState: {
            __typename: 'OrderReviewState',
            canSubmit: seed.canSubmit ?? false,
            viewerHasSubmittedReview: seed.viewerHasSubmittedReview ?? false,
            viewerReview: reviewData(seed.viewerReview),
            counterpartReview: reviewData(seed.counterpartReview),
          },
        },
      },
    })
  })

  // The decorator's client lives for the whole test page: take the seed back
  // so the next story with the same order starts without reviews.
  useEffect(
    () => () => {
      client.cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'order',
        args: { id: seed.orderId },
      })
      client.cache.gc()
    },
    [client, seed.orderId],
  )

  return children
}

/**
 * Seeds the order's review state (yours, theirs, whether you can still
 * review). List it before `withTaskDetailStory`.
 */
export function withOrderReviewSeed(seed: OrderReviewSeed): Decorator {
  return (Story) => (
    <OrderReviewSeedRoot seed={seed}>
      <Story />
    </OrderReviewSeedRoot>
  )
}
