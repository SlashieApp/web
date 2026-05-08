'use client'

import {
  Box,
  Grid,
  HStack,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import { Badge, Button, SectionCard } from '@ui'

import { useUserStore } from '@/app/(auth)/store/user'
import { formatPounds, taskBudgetPence } from '@/utils/dashboardHelpers'

import { useAccountTasks } from '../helpers/useAccountTasks'

function StatTile({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <SectionCard p={5}>
      <Stack gap={1}>
        <Text
          fontSize="xs"
          fontWeight={700}
          letterSpacing="0.06em"
          color="formLabelMuted"
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Heading size="lg" color="cardFg">
          {value}
        </Heading>
        <Text fontSize="sm" color="formLabelMuted">
          {helper}
        </Text>
      </Stack>
    </SectionCard>
  )
}

export default function DashboardOverviewPage() {
  const me = useUserStore((s) => s.me)
  const {
    loading,
    errorMessage,
    activePostedTasks,
    sentQuotes,
    customerJobs,
    workerJobs,
    completedPostedTasks,
    awardedSentQuotes,
  } = useAccountTasks()

  const displayName =
    me?.profile?.name?.trim() ||
    `${me?.firstName ?? ''} ${me?.lastName ?? ''}`.trim() ||
    me?.email?.split('@')[0] ||
    'there'

  const totalEarningsPence = awardedSentQuotes.reduce(
    (sum, { quote }) => sum + (quote.price?.amount ?? 0) * 100,
    0,
  )
  const totalSpendPence = completedPostedTasks.reduce(
    (sum, task) => sum + taskBudgetPence(task),
    0,
  )
  const isWorker = Boolean(me?.worker?.id)

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading size="xl" color="cardFg">
          Welcome back, {displayName}.
        </Heading>
        <Text color="formLabelMuted" maxW="3xl">
          One workspace for everything you do on Slashie — posted requests,
          accepted jobs, earnings logs, and your worker profile.
        </Text>
      </Stack>

      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
        <StatTile
          label="Active requests"
          value={loading ? '…' : String(activePostedTasks.length)}
          helper="Tasks you posted that are still open or in progress."
        />
        <StatTile
          label="Quotes sent"
          value={loading ? '…' : String(sentQuotes.length)}
          helper="Outbound quotes on tasks posted by other people."
        />
        <StatTile
          label="Active jobs"
          value={
            loading ? '…' : String(customerJobs.length + workerJobs.length)
          }
          helper="Tasks with an accepted quote — yours or someone else’s."
        />
        <StatTile
          label="Earnings tracked"
          value={loading ? '…' : formatPounds(totalEarningsPence)}
          helper="Awarded quote value. Slashie does not handle payouts."
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', xl: '1.4fr 1fr' }} gap={6}>
        <SectionCard p={{ base: 5, md: 6 }}>
          <Stack gap={5}>
            <Stack gap={1}>
              <Heading size="md" color="cardFg">
                Quick links
              </Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Jump back into the most common flows.
              </Text>
            </Stack>
            <HStack gap={3} flexWrap="wrap">
              <Link
                as={NextLink}
                href="/tasks/create"
                _hover={{ textDecoration: 'none' }}
              >
                <Button>Post a task</Button>
              </Link>
              <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
                <Button variant="secondary">Browse open tasks</Button>
              </Link>
              <Link
                as={NextLink}
                href="/requests"
                _hover={{ textDecoration: 'none' }}
              >
                <Button variant="ghost">My requests</Button>
              </Link>
              <Link
                as={NextLink}
                href="/jobs"
                _hover={{ textDecoration: 'none' }}
              >
                <Button variant="ghost">Jobs</Button>
              </Link>
            </HStack>
          </Stack>
        </SectionCard>

        <SectionCard p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <HStack justify="space-between" align="flex-start">
              <Stack gap={1}>
                <Heading size="md" color="cardFg">
                  Worker status
                </Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  {isWorker
                    ? 'Your worker profile is live — keep it fresh.'
                    : 'Set up a worker profile when you’re ready to send quotes.'}
                </Text>
              </Stack>
              <Badge
                bg={isWorker ? 'primary.100' : 'badgeBg'}
                color={isWorker ? 'primary.800' : 'cardFg'}
              >
                {isWorker ? 'Active' : 'Not set up'}
              </Badge>
            </HStack>
            <Box>
              <Link
                as={NextLink}
                href="/profile"
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant={isWorker ? 'ghost' : 'primary'}>
                  {isWorker ? 'Manage worker profile' : 'Become a worker'}
                </Button>
              </Link>
            </Box>
            <Stack gap={1}>
              <Text fontSize="xs" color="formLabelMuted">
                Lifetime spend on completed posts
              </Text>
              <Text fontWeight={700}>{formatPounds(totalSpendPence)}</Text>
            </Stack>
          </Stack>
        </SectionCard>
      </Grid>
    </Stack>
  )
}
