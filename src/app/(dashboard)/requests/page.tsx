'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

import { Button, SectionCard } from '@ui'

import {
  customerOrderForTask,
  isPostedTaskArchived,
} from '../helpers/postedTaskCustomer'
import { useAccountOrders } from '../helpers/useAccountOrders'
import { useMyRequests } from '../helpers/useMyRequests'
import { PostedTaskCard } from './components/PostedTaskCard'

type RequestsTab = 'active' | 'completed'

export default function MyRequestsPage() {
  const {
    me,
    loading: tasksLoading,
    errorMessage: tasksError,
    postedTasks,
  } = useMyRequests()
  const {
    orders,
    loading: ordersLoading,
    errorMessage: ordersError,
  } = useAccountOrders()

  const [tab, setTab] = useState<RequestsTab>('active')

  const meId = me?.id

  const tasksWithOrders = useMemo(() => {
    if (!meId) return []
    return postedTasks.map((task) => ({
      task,
      customerOrder: customerOrderForTask(orders, task.id, meId),
    }))
  }, [postedTasks, orders, meId])

  const { activeTasks, completedTasks } = useMemo(() => {
    const active: typeof tasksWithOrders = []
    const completed: typeof tasksWithOrders = []
    for (const row of tasksWithOrders) {
      if (isPostedTaskArchived(row.task, row.customerOrder)) {
        completed.push(row)
      } else {
        active.push(row)
      }
    }
    return { activeTasks: active, completedTasks: completed }
  }, [tasksWithOrders])

  const visibleTasks = tab === 'completed' ? completedTasks : activeTasks

  const loading = tasksLoading || ordersLoading
  const errorMessage = tasksError ?? ordersError

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Stack gap={1}>
          <Heading size="xl">My Requests</Heading>
          <Text color="formLabelMuted">
            Tasks you posted as a customer — track quotes, bookings, and
            completion in one place.
          </Text>
        </Stack>

        <HStack gap={2} flexWrap="wrap">
          <Button
            size="sm"
            variant={tab === 'active' ? 'primary' : 'ghost'}
            onClick={() => setTab('active')}
          >
            In progress ({activeTasks.length})
          </Button>
          <Button
            size="sm"
            variant={tab === 'completed' ? 'primary' : 'ghost'}
            onClick={() => setTab('completed')}
          >
            Completed ({completedTasks.length})
          </Button>
        </HStack>
      </Stack>

      {loading ? <Text color="formLabelMuted">Loading your tasks…</Text> : null}
      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {!loading && visibleTasks.length === 0 ? (
        <SectionCard p={6}>
          <Stack gap={2}>
            <Heading size="sm">
              {tab === 'completed'
                ? 'No completed requests yet'
                : 'No tasks in progress'}
            </Heading>
            <Text color="formLabelMuted" fontSize="sm">
              {tab === 'completed'
                ? 'Finished and closed tasks appear here.'
                : 'When you post a task, it will show up here while quotes and bookings are active.'}
            </Text>
          </Stack>
        </SectionCard>
      ) : null}

      {visibleTasks.length > 0 ? (
        <Stack gap={3}>
          {visibleTasks.map(({ task, customerOrder }) => (
            <PostedTaskCard
              key={task.id}
              task={task}
              customerOrder={customerOrder}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
