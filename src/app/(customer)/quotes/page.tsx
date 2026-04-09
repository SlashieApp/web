'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import {
  formatDate,
  formatPounds,
  getCategoryVisual,
} from '@/utils/dashboardHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'
import { useCustomerAccount } from '../context/CustomerAccountContext'

export default function CustomerQuotesPage() {
  const { incomingQuotes, tasksLoading, tasksErrorMessage } =
    useCustomerAccount()

  return (
    <Stack gap={8}>
      <Stack gap={2} maxW="3xl">
        <Heading size="xl">Quotes on your tasks</Heading>
        <Text color="muted">
          Offers workers have sent on work you posted. Open the task to compare,
          message, or accept a quote.
        </Text>
      </Stack>

      {tasksLoading ? <Text color="muted">Loading quotes…</Text> : null}
      {tasksErrorMessage ? (
        <Text color="red.400" fontSize="sm">
          {tasksErrorMessage}
        </Text>
      ) : null}

      {!tasksLoading && incomingQuotes.length === 0 ? (
        <GlassCard p={6}>
          <Stack gap={3}>
            <Heading size="md">No quotes yet</Heading>
            <Text color="muted">
              When workers submit prices on your requests, they will appear here
              and on the task page.
            </Text>
            <Button as={NextLink} href="/tasks/create" alignSelf="flex-start">
              Post a task
            </Button>
          </Stack>
        </GlassCard>
      ) : null}

      {!tasksLoading && incomingQuotes.length > 0 ? (
        <Stack gap={4}>
          {incomingQuotes.map(({ task, offer }) => {
            const visual = getCategoryVisual(task.category)
            return (
              <GlassCard key={offer.id} p={5}>
                <HStack align="flex-start" gap={4} flexWrap="wrap">
                  <Box
                    w={14}
                    h={14}
                    borderRadius="lg"
                    bg={visual.bg}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xl"
                    flexShrink={0}
                  >
                    {visual.glyph}
                  </Box>
                  <Stack gap={2} flex="1" minW="200px">
                    <Heading size="sm">{task.title}</Heading>
                    <Text fontSize="sm" color="muted">
                      {taskPublicLocationLabel(task) || 'Location TBC'}
                    </Text>
                    <HStack gap={2} flexWrap="wrap">
                      <Badge bg="primary.50" color="primary.700">
                        {formatPounds(offer.pricePence)}
                      </Badge>
                      <Text fontSize="xs" color="muted">
                        {formatDate(offer.createdAt)}
                      </Text>
                    </HStack>
                    {offer.message ? (
                      <Text fontSize="sm">{offer.message}</Text>
                    ) : null}
                  </Stack>
                  <Button as={NextLink} href={`/task/${task.id}`} size="sm">
                    View task
                  </Button>
                </HStack>
              </GlassCard>
            )
          })}
        </Stack>
      ) : null}
    </Stack>
  )
}
