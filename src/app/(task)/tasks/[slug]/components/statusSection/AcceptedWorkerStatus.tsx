'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Stack, Text } from '@chakra-ui/react'
import bag from '../../i11n.json'

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
  const t = useI11n(bag)
  const b = t.booking

  if (!task || !myOrder || !permissions.showWorkerJobBanner) return null

  const snapshot = myOrder.snapshot
  const address =
    snapshot.location?.address?.trim() ||
    snapshot.location?.name?.trim() ||
    b.addressFallback
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
            {b.workerEyebrow}
          </Text>
          <Text
            fontWeight={700}
            fontSize={{ base: 'lg', md: 'xl' }}
            color="text.default"
          >
            {b.workerTitle}
          </Text>
          {countdown ? (
            <Text fontSize="sm" color="status.success.fg" fontWeight={600}>
              {countdown}
            </Text>
          ) : (
            <Text fontSize="sm" color="text.muted">
              {b.flexibleSchedule}
            </Text>
          )}
        </Stack>

        <Stack gap={1}>
          <Text fontSize="xs" fontWeight={700} color="text.muted">
            {b.beOnSite}
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
                {b.contactCustomer}
              </Button>
            </Link>
          ) : mailto ? (
            <Link href={`mailto:${mailto}`} _hover={{ textDecoration: 'none' }}>
              <Button size="sm" variant="primary">
                {b.emailCustomer}
              </Button>
            </Link>
          ) : (
            <Link href={'/account'} _hover={{ textDecoration: 'none' }}>
              <Button size="sm" variant="secondary">
                {b.addContact}
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
                {b.openMaps}
              </Button>
            </Link>
          ) : null}
        </HStack>

        <Text fontSize="xs" color="text.muted">
          {b.paymentNote}
        </Text>
      </Stack>
    </Card>
  )
}
