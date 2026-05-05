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

import { DashboardMetricCard } from '@/app/dashboard/components/DashboardMetricCard'
import { useDashboardData } from '@/app/dashboard/context'
import { formatPounds } from '@/utils/dashboardHelpers'
import { Badge, Button, SectionCard } from '@ui'

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
        <SectionCard
          p={{ base: 6, md: 7 }}
          bg="linear-gradient(160deg, #F7F9F8 0%, #D9F4E5 100%)"
          boxShadow="card"
        >
          <Stack gap={5}>
            <Badge alignSelf="flex-start">Worker overview</Badge>
            <Stack gap={2}>
              <Heading size="xl" color="secondary.900">
                Welcome back, {displayName}.
              </Heading>
              <Text color="formLabelMuted" maxW="3xl">
                Your dashboard is for running your worker business: browse open
                tasks on the home page, send quotes, and track quote activity.
                Tasks you post as a customer live under Requests.
              </Text>
            </Stack>
            <HStack gap={3} flexWrap="wrap">
              <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
                <Button>Browse open tasks</Button>
              </Link>
              <Link
                as={NextLink}
                href={
                  workerEnabled
                    ? '/dashboard/quotes'
                    : '/dashboard/worker/register'
                }
                _hover={{ textDecoration: 'none' }}
              >
                <Button variant="secondary">
                  {workerEnabled ? 'My quotes' : 'Worker setup'}
                </Button>
              </Link>
              <Link
                as={NextLink}
                href="/requests"
                _hover={{ textDecoration: 'none' }}
              >
                <Button variant="ghost">Customer requests</Button>
              </Link>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Badge bg="badgeBg" color="cardFg">
                {workerProfile.serviceArea?.trim() || 'Set service area'}
              </Badge>
              <Badge bg="green.100" color="secondary.600">
                {workerProfileComplete
                  ? 'Quoting enabled'
                  : workerEnabled
                    ? 'Finish worker profile'
                    : 'Complete worker setup'}
              </Badge>
            </HStack>
          </Stack>
        </SectionCard>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 1 }} gap={4}>
          <DashboardMetricCard
            label="Quotes sent"
            value={String(myQuotes.length)}
            helper="Quotes you have submitted on open tasks."
          />
          <DashboardMetricCard
            label="In progress"
            value={String(quotesInProgress.length)}
            helper="Quotes on tasks that are still open."
          />
          <DashboardMetricCard
            label="Awarded"
            value={String(awardedQuotes.length)}
            helper="Quotes that appear accepted from current task data."
          />
          <DashboardMetricCard
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

      {tasksLoading ? (
        <Text color="formLabelMuted">Loading task data…</Text>
      ) : null}
      {tasksErrorMessage ? (
        <Text color="red.400" fontSize="sm">
          {tasksErrorMessage}
        </Text>
      ) : null}

      {!workerEnabled ? (
        <SectionCard p={6} bg="green.100">
          <Stack gap={3}>
            <Heading size="md" color="secondary.900">
              Finish worker setup
            </Heading>
            <Text color="formLabelMuted" fontSize="sm">
              You can browse tasks without it, but you need a worker profile
              before sending quotes.
            </Text>
            <Link
              as={NextLink}
              href="/dashboard/worker/register"
              _hover={{ textDecoration: 'none' }}
            >
              <Button alignSelf="flex-start">Become a worker</Button>
            </Link>
          </Stack>
        </SectionCard>
      ) : null}

      <SectionCard p={6}>
        <Stack gap={2}>
          <Heading size="sm" color="secondary.900">
            Customer tools
          </Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Request tracking and your customer profile are on the main site:{' '}
            <Link
              as={NextLink}
              href="/requests"
              color="secondary.600"
              fontWeight={700}
              _hover={{ color: 'secondary.700' }}
            >
              Requests
            </Link>
            ,{' '}
            <Link
              as={NextLink}
              href="/profile"
              color="secondary.600"
              fontWeight={700}
              _hover={{ color: 'secondary.700' }}
            >
              Profile
            </Link>
            .
          </Text>
        </Stack>
      </SectionCard>
    </Stack>
  )
}
