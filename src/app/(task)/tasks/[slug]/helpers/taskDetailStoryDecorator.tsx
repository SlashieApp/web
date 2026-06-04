'use client'

import { ApolloProvider } from '@apollo/client/react'
import { Box } from '@chakra-ui/react'
import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useEffect } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import Me from '@/graphql/Me.gql'
import { apolloClient } from '@/utils/apolloClient'
import { clearAuthToken, setAuthToken } from '@/utils/auth'

import { TaskDetailProvider } from '../context/TaskDetailProvider'
import {
  STORY_TASK_ID,
  type TaskDetailStoryConfig,
  defaultTaskDetailStoryConfig,
  storyMe,
} from './taskDetailStoryFixtures'

function TaskDetailStorySeed({
  config,
  children,
}: {
  config: TaskDetailStoryConfig
  children: ReactNode
}) {
  const { viewer, task, order } = config

  useEffect(() => {
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
    apolloClient.writeQuery({ query: Me, data: { me } })

    return () => {
      clearAuthToken()
      useUserStore.getState().setMe(null)
      useUserStore.getState().setUser(null)
    }
  }, [viewer])

  return (
    <TaskDetailProvider
      taskId={task?.id ?? STORY_TASK_ID}
      initialTask={task ?? null}
      initialOrder={order ?? null}
    >
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
