'use client'

import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import NextLink from 'next/link'

import { orderSnapshotDatetime } from '@/utils/orderHelpers'
import {
  countdownToExactSchedule,
  formatTaskScheduleLabel,
} from '@/utils/taskJobSchedule'
import { Button } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'

function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

export function AcceptedWorkerBanner() {
  const { task, myOrder, isOrderWorker } = useTaskDetail()
  if (!task || !isOrderWorker || !myOrder) return null
  if (
    myOrder.status === OrderStatus.Closed ||
    myOrder.status === OrderStatus.Cancelled
  ) {
    return null
  }

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

  const contact = task.posterContact
  const tel =
    contact?.phone?.trim() ||
    (contact?.method === 'PHONE' ? contact?.phone?.trim() : null)
  const mailto = contact?.email?.trim()

  return (
    <Box
      position="sticky"
      top={{ base: 0, md: 12 }}
      zIndex={15}
      w="full"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="primary.200"
      bg="primary.50"
      px={{ base: 4, md: 5 }}
      py={4}
      boxShadow="sm"
    >
      <Stack gap={3}>
        <Stack gap={1}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="primary.800"
            letterSpacing="0.04em"
          >
            YOUR JOB
          </Text>
          <Text
            fontWeight={800}
            fontSize={{ base: 'md', md: 'lg' }}
            color="cardFg"
          >
            You are booked for this job
          </Text>
          {countdown ? (
            <Text fontSize="sm" color="primary.800" fontWeight={600}>
              {countdown}
            </Text>
          ) : (
            <Text fontSize="sm" color="formLabelMuted">
              Agree timing with the customer if the schedule is flexible.
            </Text>
          )}
        </Stack>

        <Stack gap={1}>
          <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
            Be on site
          </Text>
          <Text fontSize="sm" fontWeight={600}>
            {address}
          </Text>
          {scheduleLabel ? (
            <Text fontSize="sm" color="formLabelMuted">
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
            <Link
              as={NextLink}
              href="/account"
              _hover={{ textDecoration: 'none' }}
            >
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

        <Text fontSize="xs" color="formLabelMuted">
          Payment is arranged directly with the customer outside Slashie.
        </Text>
      </Stack>
    </Box>
  )
}
