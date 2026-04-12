'use client'

import { Grid, HStack, Link, SimpleGrid, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useDashboardData } from '@/app/dashboard/context'
import { formatPounds } from '@/utils/dashboardHelpers'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <GlassCard p={5}>
      <Stack gap={2}>
        <Text
          fontSize="10px"
          fontWeight={800}
          letterSpacing="0.08em"
          color="muted"
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Heading size="lg">{value}</Heading>
        <Text fontSize="sm" color="muted">
          {helper}
        </Text>
      </Stack>
    </GlassCard>
  )
}

export default function DashboardOverviewPage() {
  const {
    tasksLoading,
    tasksErrorMessage,
    displayName,
    workerEnabled,
    workerProfileComplete,
    workerProfile,
    myQuotes,
    quotesInProgress,
    awardedQuotes,
    totalEarningsPence,
  } = useDashboardData()

  return (
    <Stack gap={8}>
      <Grid templateColumns={{ base: '1fr', xl: '1.5fr 1fr' }} gap={6}>
        <GlassCard
          p={{ base: 6, md: 7 }}
          bg="linear-gradient(160deg, #f7f9ff 0%, #ffffff 100%)"
        >
          <Stack gap={5}>
            <Badge alignSelf="flex-start">Worker overview</Badge>
            <Stack gap={2}>
              <Heading size="xl">Welcome back, {displayName}.</Heading>
              <Text color="muted" maxW="3xl">
                Your dashboard is for running a tasking business: browse open
                work on the home page, send quotes, and track payouts here. Jobs
                you post as a customer live under Requests on the main site.
              </Text>
            </Stack>
            <HStack gap={3} flexWrap="wrap">
              <Button as={NextLink} href="/">
                Browse open tasks
              </Button>
              <Button
                as={NextLink}
                href={
                  workerEnabled
                    ? '/dashboard/quotes'
                    : '/dashboard/worker/register'
                }
                variant="outline"
              >
                {workerEnabled ? 'My quotes' : 'Worker setup'}
              </Button>
              <Button as={NextLink} href="/requests" variant="subtle">
                My posted tasks (customer)
              </Button>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Badge bg="surfaceContainerHigh" color="fg">
                {workerProfile.serviceArea?.trim() || 'Set service area'}
              </Badge>
              <Badge bg="primary.50" color="primary.700">
                {workerProfileComplete
                  ? 'Quoting enabled'
                  : workerEnabled
                    ? 'Finish worker profile'
                    : 'Complete worker setup'}
              </Badge>
            </HStack>
          </Stack>
        </GlassCard>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 1 }} gap={4}>
          <MetricCard
            label="Quotes sent"
            value={String(myQuotes.length)}
            helper="Quotes you have submitted on open tasks."
          />
          <MetricCard
            label="In progress"
            value={String(quotesInProgress.length)}
            helper="Quotes on tasks that are still open."
          />
          <MetricCard
            label="Awarded"
            value={String(awardedQuotes.length)}
            helper="Quotes that appear accepted from current task data."
          />
          <MetricCard
            label="Earnings (tracked)"
            value={workerEnabled ? formatPounds(totalEarningsPence) : 'Locked'}
            helper={
              workerEnabled
                ? 'From awarded quotes in your workspace.'
                : 'Finish worker setup to unlock earnings tools.'
            }
          />
        </SimpleGrid>
      </Grid>

      {tasksLoading ? <Text color="muted">Loading task data…</Text> : null}
      {tasksErrorMessage ? (
        <Text color="red.400" fontSize="sm">
          {tasksErrorMessage}
        </Text>
      ) : null}

      {!workerEnabled ? (
        <GlassCard
          p={6}
          bg="primary.50"
          borderWidth="1px"
          borderColor="primary.100"
        >
          <Stack gap={3}>
            <Heading size="md">Finish worker setup</Heading>
            <Text color="muted" fontSize="sm">
              You can browse tasks without it, but you need a worker profile
              before sending quotes.
            </Text>
            <Button
              as={NextLink}
              href="/dashboard/worker/register"
              alignSelf="flex-start"
            >
              Become a worker
            </Button>
          </Stack>
        </GlassCard>
      ) : null}

      <GlassCard p={6}>
        <Stack gap={2}>
          <Heading size="sm">Customer tools</Heading>
          <Text fontSize="sm" color="muted">
            Quotes on your own tasks, request tracking, and your customer
            profile are on the main site:{' '}
            <Link
              as={NextLink}
              href="/quotes"
              color="primary.600"
              fontWeight={700}
              _hover={{ color: 'primary.700' }}
            >
              Quotes
            </Link>
            ,{' '}
            <Link
              as={NextLink}
              href="/requests"
              color="primary.600"
              fontWeight={700}
              _hover={{ color: 'primary.700' }}
            >
              Requests
            </Link>
            ,{' '}
            <Link
              as={NextLink}
              href="/profile"
              color="primary.600"
              fontWeight={700}
              _hover={{ color: 'primary.700' }}
            >
              Profile
            </Link>
            .
          </Text>
        </Stack>
      </GlassCard>
    </Stack>
  )
}
