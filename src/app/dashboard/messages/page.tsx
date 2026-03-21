'use client'

import { HStack, Stack } from '@chakra-ui/react'

import { useDashboardData } from '@/features/dashboard/DashboardDataContext'
import { formatDate } from '@/features/dashboard/dashboardHelpers'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'

export default function DashboardMessagesPage() {
  const { search, messages, markAllMessagesRead } = useDashboardData()

  const filteredMessages = messages.filter((message) => {
    const q = search.trim().toLowerCase()
    if (!q) return true

    return (
      message.counterpart.toLowerCase().includes(q) ||
      message.taskTitle.toLowerCase().includes(q) ||
      message.preview.toLowerCase().includes(q)
    )
  })

  const unreadCount = filteredMessages.filter(
    (message) => message.unread,
  ).length

  return (
    <Stack gap={8}>
      <HStack justify="space-between" gap={4} flexWrap="wrap">
        <Stack gap={1} maxW="3xl">
          <Heading size="xl">Messages</Heading>
          <Text color="muted">
            Keep up with job updates, worker onboarding notes, and scheduling
            conversations from one place.
          </Text>
        </Stack>
        <Button
          variant="subtle"
          onClick={() => markAllMessagesRead()}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </HStack>

      <HStack gap={3} flexWrap="wrap">
        <Badge bg="primary.50" color="primary.700">
          {filteredMessages.length} conversations
        </Badge>
        <Badge bg="surfaceContainerHigh" color="fg">
          {unreadCount} unread
        </Badge>
      </HStack>

      {filteredMessages.length === 0 ? (
        <GlassCard p={6}>
          <Text color="muted">
            No messages match your current search. Clear the search box to view
            all recent dashboard communication.
          </Text>
        </GlassCard>
      ) : (
        <Stack gap={4}>
          {filteredMessages.map((message) => (
            <GlassCard key={message.id} p={5}>
              <Stack gap={3}>
                <HStack
                  justify="space-between"
                  align="flex-start"
                  gap={3}
                  flexWrap="wrap"
                >
                  <Stack gap={1}>
                    <HStack gap={2} flexWrap="wrap">
                      <Heading size="sm">{message.counterpart}</Heading>
                      {message.unread ? (
                        <Badge bg="primary.50" color="primary.700">
                          New
                        </Badge>
                      ) : null}
                    </HStack>
                    <Text fontSize="sm" color="muted">
                      {message.taskTitle}
                    </Text>
                  </Stack>
                  <Text fontSize="sm" color="muted">
                    {formatDate(message.updatedAt)}
                  </Text>
                </HStack>
                <Text fontSize="sm">{message.preview}</Text>
              </Stack>
            </GlassCard>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
