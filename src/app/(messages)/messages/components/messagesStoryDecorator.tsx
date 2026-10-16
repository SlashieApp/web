'use client'

import type { ApolloClient } from '@apollo/client/core'
import { Box } from '@chakra-ui/react'
import type {
  MessageThreadQuery,
  MessageThreadQueryVariables,
  TaskCoreQuery,
  TaskQuery,
  ThreadFieldsFragment,
  ThreadItemFieldsFragment,
} from '@codegen/schema'
import type { Decorator } from '@storybook/nextjs-vite'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe, storyWorkerMe } from '@/app/(auth)/helpers/authStoryFixtures'
import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import TaskCore from '@/app/(task)/tasks/[slug]/graphql/TaskCore.gql'
import {
  STORY_OWNER_ID,
  STORY_WORKER_ID,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import type { TaskDetailRecord } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import { taskQueryVariables } from '@/app/(task)/tasks/[slug]/helpers/taskQueryVariables'

import {
  MessagesContext,
  type MessagesContextValue,
  THREAD_PAGE_SIZE,
} from '../context/MessagesProvider'
import MessageThread from '../graphql/MessageThread.gql'
import { type MessagesViewer, messagesValue } from './messagesStoryFixtures'

export type MessagesStoryConfig = {
  /** Signed in as the task owner (Alex) or the booked worker (Jordan). */
  viewer?: MessagesViewer
  /** Inbox state for the messages context. */
  inbox?: Partial<MessagesContextValue>
  /** The open thread and its items (newest first, as the API returns them). */
  thread?: ThreadFieldsFragment
  items?: readonly ThreadItemFieldsFragment[]
  /**
   * What the open thread's request does: `loaded` reads the seeded thread,
   * `loading` never settles, `failed` errors, `forbidden` is the API's answer
   * for a conversation you're not in.
   */
  threadRequest?: 'loaded' | 'loading' | 'failed' | 'forbidden'
  /** The thread's task, loaded behind the header menu. */
  task?: TaskDetailRecord
  /** Fixed frame height for thread and screen stories. */
  height?: string
  maxW?: string
}

const TYPENAME_BY_FIELD: Record<string, string> = {
  thread: 'Thread',
  threads: 'Thread',
  lastItem: 'ThreadItem',
  threadItems: 'ThreadItem',
  task: 'Task',
  otherParty: 'ThreadParty',
  author: 'ThreadParty',
  quote: 'Quote',
  quotes: 'Quote',
  orders: 'Order',
  poster: 'User',
  actor: 'User',
  profile: 'Profile',
}

/**
 * Adds `__typename` the way the API would, so fragments and the cache can
 * match. Names that only label nested plain objects are not important; the
 * entities (`Thread`, `ThreadItem`, `Task`, `Quote`, `Order`) are.
 */
function addTypenames<T>(value: T, field = '', parentType = ''): T {
  if (Array.isArray(value)) {
    return value.map((item) => addTypenames(item, field, parentType)) as T
  }
  if (!value || typeof value !== 'object' || field === 'data') return value
  const typename =
    field === 'worker'
      ? parentType === 'User'
        ? 'Worker'
        : 'User'
      : (TYPENAME_BY_FIELD[field] ??
        field.charAt(0).toUpperCase() + field.slice(1))
  const entries = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      addTypenames(child, key, typename),
    ]),
  )
  // The root is a query result, not an entity.
  return (field ? { __typename: typename, ...entries } : entries) as T
}

/**
 * The task detail fixtures link remote photos, and the `Task` (viewer) query
 * needs `contactNumber`, which they omit. Stories load no remote images and
 * the header only needs the task's permissions, so photos are dropped.
 */
function forCache(task: TaskDetailRecord) {
  const profile = <P extends object | null | undefined>(p: P) =>
    p ? { contactNumber: null, ...p, avatarUrl: null } : p
  return {
    ...task,
    images: [],
    poster: task.poster && {
      ...task.poster,
      profile: profile(task.poster.profile),
    },
    timeline: task.timeline.map((event) => ({
      ...event,
      actor: {
        ...event.actor,
        profile: { ...event.actor.profile, avatarUrl: null },
      },
    })),
    quotes: task.quotes.map((quote) => ({
      ...quote,
      worker: quote.worker && {
        ...quote.worker,
        profile: profile(quote.worker.profile),
      },
    })),
  }
}

function seed(client: ApolloClient, config: MessagesStoryConfig) {
  const { thread, items = [], task, threadRequest = 'loaded' } = config
  if (thread && threadRequest === 'loaded') {
    client.writeQuery<MessageThreadQuery, MessageThreadQueryVariables>({
      query: MessageThread,
      variables: { threadId: thread.id, first: THREAD_PAGE_SIZE },
      data: addTypenames({ thread, threadItems: [...items] }),
    })
  }
  if (task) {
    client.writeQuery<TaskCoreQuery>({
      query: TaskCore,
      variables: taskQueryVariables(task.id),
      data: addTypenames({ task: forCache(task) }),
    })
    client.writeQuery<TaskQuery>({
      query: Task,
      variables: taskQueryVariables(task.id),
      data: addTypenames({ task: forCache(task) }) as TaskQuery,
    })
  }
}

const owner = storyMe({
  id: STORY_OWNER_ID,
  email: 'alex@example.com',
  profile: { name: 'Alex Chen' },
})
const bookedWorker = storyWorkerMe({
  id: STORY_WORKER_ID,
  email: 'jordan@example.com',
  profile: { name: 'Jordan Lee' },
})

/**
 * Story-only Messages: the real messages context with fixture threads, a
 * story-only Apollo client seeded with the open thread (and its task, for the
 * header menu), and the signed-in viewer. Nothing reaches the network.
 */
export function messagesStory<TArgs>(
  config: MessagesStoryConfig = {},
): Decorator<TArgs>[] {
  const { viewer = 'owner', inbox, height, maxW, threadRequest } = config
  const frame: Decorator<TArgs> = (Story) => (
    <MessagesContext.Provider value={messagesValue(inbox)}>
      <Box
        display="flex"
        flexDirection="column"
        w="full"
        maxW={maxW}
        h={height}
        minH={0}
        bg="bg.surface"
      >
        <Story />
      </Box>
    </MessagesContext.Provider>
  )
  return [
    frame,
    withSession({
      me: viewer === 'owner' ? owner : bookedWorker,
      seed: (client) => seed(client, config),
      responses:
        threadRequest === 'failed'
          ? { MessageThread: { kind: 'networkError' } }
          : threadRequest === 'forbidden'
            ? {
                MessageThread: {
                  kind: 'graphqlError',
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'FORBIDDEN',
                },
              }
            : undefined,
    }),
  ]
}
