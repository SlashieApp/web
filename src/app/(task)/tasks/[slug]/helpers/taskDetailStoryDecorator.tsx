'use client'

import { ApolloProvider } from '@apollo/client/react'
import { Box } from '@chakra-ui/react'
import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useEffect } from 'react'

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { NEVER } from 'rxjs'

import { useUserStore } from '@/app/(auth)/store/user'
import Me from '@/graphql/Me.gql'
import { clearAuthToken, setAuthToken } from '@/utils/auth'

import { TaskDetailProvider } from '../context/TaskDetailProvider'
import Task from '../graphql/Task.gql'
import {
  STORY_TASK_ID,
  type TaskDetailStoryConfig,
  defaultTaskDetailStoryConfig,
  storyMe,
} from './taskDetailStoryFixtures'

/**
 * Story-only Apollo client: all data comes from the seeded cache and network
 * requests never resolve. Using the real app client would hit the live API,
 * whose UNAUTHENTICATED response for the fake story token makes the error
 * link clear the auth cookie — collapsing every authed story to the
 * visitor state.
 */
const apolloClient = new ApolloClient({
  link: new ApolloLink(() => NEVER),
  cache: new InMemoryCache(),
})

function TaskDetailStorySeed({
  config,
  children,
}: {
  config: TaskDetailStoryConfig
  children: ReactNode
}) {
  const { viewer, task, order } = config
  const taskId = task?.id ?? STORY_TASK_ID

  useEffect(() => {
    // Client Task.gql slice — seed the cache so the provider resolves from fixtures.
    if (task) {
      apolloClient.writeQuery({
        query: Task,
        variables: { id: taskId },
        data: {
          task: {
            __typename: 'Task',
            id: task.id,
            status: task.status,
            location: task.location
              ? { __typename: 'TaskLocation', ...task.location }
              : null,
            poster: task.poster
              ? {
                  __typename: 'User',
                  ...task.poster,
                  profile: {
                    __typename: 'Profile',
                    contactNumber: null,
                    ...task.poster.profile,
                  },
                }
              : null,
            timeline: (task.timeline ?? []).map((e) => ({
              __typename: 'TaskTimelineEvent',
              ...e,
              actor: {
                __typename: 'User',
                ...e.actor,
                profile: { __typename: 'Profile', ...e.actor.profile },
              },
            })),
            orders: (order ? [order] : (task.orders ?? [])).map((o) => ({
              __typename: 'Order',
              ...o,
              agreedPrice: o.agreedPrice
                ? { __typename: 'OrderAgreedPrice', ...o.agreedPrice }
                : o.agreedPrice,
              snapshot: o.snapshot
                ? {
                    __typename: 'OrderSnapshot',
                    ...o.snapshot,
                    location: o.snapshot.location
                      ? { __typename: 'TaskLocation', ...o.snapshot.location }
                      : o.snapshot.location,
                    datetime: o.snapshot.datetime
                      ? { __typename: 'TaskDatetime', ...o.snapshot.datetime }
                      : null,
                  }
                : o.snapshot,
            })),
            quotes: task.quotes.map((q) => ({
              __typename: 'Quote',
              estimatedDuration: null,
              ...q,
              price: q.price ? { __typename: 'Price', ...q.price } : null,
              worker: q.worker
                ? {
                    __typename: 'User',
                    ...q.worker,
                    profile: { __typename: 'Profile', ...q.worker.profile },
                    worker: q.worker.worker
                      ? { __typename: 'Worker', ...q.worker.worker }
                      : null,
                  }
                : q.worker,
            })),
          },
        },
      })
    }

    if (viewer === 'visitor') {
      clearAuthToken()
      useUserStore.getState().setMe(null)
      useUserStore.getState().setUser(null)
      return
    }

    setAuthToken('storybook-task-detail-token')
    const me = storyMe(
      viewer === 'customer' ? 'owner' : viewer === 'owner' ? 'owner' : 'worker',
    )
    useUserStore.getState().setMe(me)
    useUserStore.getState().setUser({ id: me.id, email: me.email })
    // The real getUser() hits the live API, fails on the fake story token,
    // and clears the auth cookie — stub it to keep the seeded session.
    useUserStore.setState({
      getUser: async () => useUserStore.getState().user,
    })
    apolloClient.writeQuery({ query: Me, data: { me } })

    return () => {
      clearAuthToken()
      useUserStore.getState().setMe(null)
      useUserStore.getState().setUser(null)
    }
  }, [viewer, task, order, taskId])

  return (
    <TaskDetailProvider taskId={taskId} initialTask={task ?? null}>
      {children}
    </TaskDetailProvider>
  )
}

export function withTaskDetailStory(
  configOverrides: Partial<TaskDetailStoryConfig> = {},
  options?: { maxWidth?: string },
): Decorator {
  const config = defaultTaskDetailStoryConfig(configOverrides)

  return (Story) => (
    <ApolloProvider client={apolloClient}>
      <TaskDetailStorySeed config={config}>
        <Box maxW={options?.maxWidth ?? '520px'} w="full">
          <Story />
        </Box>
      </TaskDetailStorySeed>
    </ApolloProvider>
  )
}
