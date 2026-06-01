'use client'

import { HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { ScheduleChip } from '@/ui/ScheduleChip'
import {
  type OrderItem,
  formatOrderAgreedPrice,
  isOrderClosed,
  orderLocationLabel,
  orderPartyRole,
  orderStatusChipLabel,
  orderTaskHref,
  scheduleChipForOrder,
  sortOrdersBySchedule,
} from '@/utils/orderHelpers'
import { Badge, Button, SectionCard } from '@ui'

import { useAccountOrders } from '../helpers/useAccountOrders'

function OrderJobCardWithRole({
  order,
  userId,
}: {
  order: OrderItem
  userId: string
}) {
  const role = orderPartyRole(order, userId)
  const chip = scheduleChipForOrder(order)
  const roleLabel = role === 'customer' ? 'Customer' : 'Worker'

  return (
    <SectionCard p={5}>
      <Stack gap={3}>
        <HStack
          justify="space-between"
          align="flex-start"
          flexWrap="wrap"
          gap={2}
        >
          <Heading size="sm">{order.snapshot.title}</Heading>
          <HStack gap={2}>
            <ScheduleChip chip={chip} />
            <Badge
              bg={role === 'worker' ? 'primary.100' : 'badgeBg'}
              color={role === 'worker' ? 'primary.800' : 'cardFg'}
            >
              {roleLabel} · {orderStatusChipLabel(order.status)}
            </Badge>
          </HStack>
        </HStack>
        <Text fontSize="sm" color="formLabelMuted">
          {orderLocationLabel(order)} · agreed {formatOrderAgreedPrice(order)}
        </Text>
        <Text fontSize="sm" color="formLabelMuted">
          {role === 'customer'
            ? 'Confirm completion when you are satisfied with the work.'
            : 'Coordinate on site and close out the job when finished.'}
        </Text>
        <HStack gap={3}>
          <Link
            as={NextLink}
            href={orderTaskHref(order)}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm">Open job</Button>
          </Link>
        </HStack>
      </Stack>
    </SectionCard>
  )
}

export default function JobsPage() {
  const { loading, errorMessage, customerOrders, workerOrders, refetch, me } =
    useAccountOrders()

  const sortedCustomer = sortOrdersBySchedule(
    customerOrders.filter((o) => !isOrderClosed(o.status)),
  )
  const sortedWorker = sortOrdersBySchedule(
    workerOrders.filter((o) => !isOrderClosed(o.status)),
  )
  const total = sortedCustomer.length + sortedWorker.length

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Stack gap={1}>
            <Heading size="xl">Jobs</Heading>
            <Text color="formLabelMuted">
              Active orders from accepted quotes — your bookings on either side
              of the job.
            </Text>
          </Stack>
          <Button size="sm" variant="ghost" onClick={() => void refetch()}>
            Refresh
          </Button>
        </HStack>
      </Stack>

      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {loading && total === 0 ? (
        <Text color="formLabelMuted">Loading jobs…</Text>
      ) : total === 0 ? (
        <SectionCard p={6}>
          <Stack gap={3}>
            <Heading size="sm">No active jobs</Heading>
            <Text color="formLabelMuted" fontSize="sm">
              When a quote is accepted, your order appears here with the agreed
              price and schedule.
            </Text>
          </Stack>
        </SectionCard>
      ) : (
        <Stack gap={6}>
          {sortedCustomer.length > 0 && me ? (
            <Stack gap={3}>
              <Heading size="md">Jobs you booked</Heading>
              <Stack gap={4}>
                {sortedCustomer.map((order) => (
                  <OrderJobCardWithRole
                    key={order.id}
                    order={order}
                    userId={me.id}
                  />
                ))}
              </Stack>
            </Stack>
          ) : null}
          {sortedWorker.length > 0 && me ? (
            <Stack gap={3}>
              <Heading size="md">Jobs where you’re the worker</Heading>
              <Stack gap={4}>
                {sortedWorker.map((order) => (
                  <OrderJobCardWithRole
                    key={order.id}
                    order={order}
                    userId={me.id}
                  />
                ))}
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      )}
    </Stack>
  )
}
