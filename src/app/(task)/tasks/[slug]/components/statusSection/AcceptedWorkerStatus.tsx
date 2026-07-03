'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { orderSnapshotDatetime } from '@/utils/orderHelpers'
import {
  countdownToExactSchedule,
  formatTaskScheduleLabel,
} from '@/utils/taskJobSchedule'
import { Button, Card, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

/**
 * The worker's "Your job" booking card for an active booking: where to be +
 * contact. The complete-with-code flow lives in the quote section
 * (`WorkerOrderVerificationPanel`), not here.
 */
export function AcceptedWorkerStatus() {
  const { task, myOrder, permissions } = useTaskDetail()
  if (!task || !myOrder || !permissions.showWorkerJobBanner) return null

  const snapshot = myOrder.snapshot
  const address =
    snapshot.location?.address?.trim() ||
    snapshot.location?.name?.trim() ||
    'Address shared by customer'
  const datetime = orderSnapshotDatetime(myOrder)
  const scheduleLabel = formatTaskScheduleLabel(datetime)
  const countdown = countdownToExactSchedule(datetime)
  const lat = snapshot.location?.lat
  const lng = snapshot.location?.lng
  const hasCoords =
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    typeof lng === 'number' &&
    Number.isFinite(lng)

  // Poster phone/email now come via `task.poster` (User). The API returns real
  // values only to the accepted worker/assignee - exactly this banner's audience
  // (gated by permissions.showWorkerJobBanner above); other viewers get redacted
  // nulls.
  const poster = task.poster
  const tel = poster?.profile?.contactNumber?.trim() || null
  const mailto = poster?.email?.trim() || null

  return (
    <Card layout="default" maxW="full" w="full" px={{ base: 4, md: 5 }} py={4}>
      <Stack gap={3}>
        <Stack gap={1}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="status.success.fg"
            letterSpacing="0.04em"
          >
            YOUR JOB
          </Text>
          <Text
            fontWeight={700}
            fontSize={{ base: 'lg', md: 'xl' }}
            color="text.default"
          >
            You are booked for this job
          </Text>
          {countdown ? (
            <Text fontSize="sm" color="status.success.fg" fontWeight={600}>
              {countdown}
            </Text>
          ) : (
            <Text fontSize="sm" color="text.muted">
              Agree timing with the customer if the schedule is flexible.
            </Text>
          )}
        </Stack>

        <Stack gap={1}>
          <Text fontSize="xs" fontWeight={700} color="text.muted">
            Be on site
          </Text>
          <Text fontSize="sm" fontWeight={600}>
            {address}
          </Text>
          {scheduleLabel ? (
            <Text fontSize="sm" color="text.muted">
              {scheduleLabel}
            </Text>
          ) : null}
        </Stack>

        <HStack gap={2} flexWrap="wrap">
          {tel ? (
            <Link
              href={`tel:${tel.replace(/\s/g, '')}`}
              _hover={{ textDecoration: 'none' }}
            >
              <Button size="sm" variant="primary">
                Contact customer
              </Button>
            </Link>
          ) : mailto ? (
            <Link href={`mailto:${mailto}`} _hover={{ textDecoration: 'none' }}>
              <Button size="sm" variant="primary">
                Email customer
              </Button>
            </Link>
          ) : (
            <Link href="/account" _hover={{ textDecoration: 'none' }}>
              <Button size="sm" variant="secondary">
                Add contact in Account
              </Button>
            </Link>
          )}
          {hasCoords ? (
            <Link
              href={mapsDirectionsUrl(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ textDecoration: 'none' }}
            >
              <Button size="sm" variant="secondary">
                Open in Maps
              </Button>
            </Link>
          ) : null}
        </HStack>

        <Text fontSize="xs" color="text.muted">
          Payment is arranged directly with the customer outside Slashie.
        </Text>
      </Stack>
    </Card>
  )
}
