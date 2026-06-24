'use client'

import { Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { formatDate, formatPounds } from '@/utils/dashboardHelpers'
import {
  formatOrderAgreedPrice,
  orderStatusChipLabel,
  orderTaskHref,
} from '@/utils/orderHelpers'
import { Badge, Card, Link } from '@ui'

import { useAccountOrders } from '../helpers/useAccountOrders'

/**
 * Reference-only earnings log. Slashie does not handle payouts; this page only
 * tallies order amounts for your records.
 */
export default function EarningsPage() {
  const {
    loading,
    errorMessage,
    pendingEarningsPence,
    completedEarningsPence,
    pendingWorkerOrders,
    closedWorkerOrders,
  } = useAccountOrders()

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading size="xl">Earnings</Heading>
        <Text color="text.muted">
          Worker earnings from your orders. Reference only — Slashie does not
          handle payments between customers and workers.
        </Text>
      </Stack>

      {errorMessage ? (
        <Text color="status.danger.fg" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4}>
        <Card layout="section" p={5}>
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="text.muted"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              Pending
            </Text>
            <Heading size="lg">
              {loading ? '…' : formatPounds(pendingEarningsPence)}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              Sum of agreed prices on orders still in progress (ACTIVE).
            </Text>
          </Stack>
        </Card>
        <Card layout="section" p={5}>
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="text.muted"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              Completed
            </Text>
            <Heading size="lg">
              {loading ? '…' : formatPounds(completedEarningsPence)}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              Sum of agreed prices on closed orders (CLOSED).
            </Text>
          </Stack>
        </Card>
      </Grid>

      <Stack gap={3}>
        <Heading size="md">Pending orders</Heading>
        {pendingWorkerOrders.length === 0 ? (
          <Card layout="section" p={6}>
            <Text color="text.muted" fontSize="sm">
              No pending worker earnings. Accepted quotes create an order
              immediately — agreed value shows here until the order is closed.
            </Text>
          </Card>
        ) : (
          <Stack gap={3}>
            {pendingWorkerOrders.map((order) => (
              <Card layout="section" key={order.id} p={5}>
                <HStack
                  justify="space-between"
                  align="flex-start"
                  flexWrap="wrap"
                  gap={4}
                >
                  <Stack gap={1} maxW="3xl">
                    <Heading size="sm">{order.snapshot.title}</Heading>
                    <Text fontSize="sm" color="text.muted">
                      {orderStatusChipLabel(order.status)}
                    </Text>
                  </Stack>
                  <HStack gap={3}>
                    <Badge variant="success">Worker</Badge>
                    <Text fontWeight={800}>
                      {formatOrderAgreedPrice(order)}
                    </Text>
                    <Link
                      href={orderTaskHref(order)}
                      fontSize="sm"
                      fontWeight={600}
                      color="text.link"
                    >
                      Open
                    </Link>
                  </HStack>
                </HStack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <Stack gap={3}>
        <Heading size="md">Closed orders</Heading>
        {closedWorkerOrders.length === 0 ? (
          <Card layout="section" p={6}>
            <Text color="text.muted" fontSize="sm">
              Closed orders will appear here after you and the customer finish
              the job on Slashie.
            </Text>
          </Card>
        ) : (
          <Stack gap={3}>
            {closedWorkerOrders.map((order) => (
              <Link
                key={order.id}
                href={orderTaskHref(order)}
                _hover={{ textDecoration: 'none' }}
              >
                <Card layout="section" p={5}>
                  <HStack
                    justify="space-between"
                    align="flex-start"
                    flexWrap="wrap"
                    gap={4}
                  >
                    <Stack gap={1} maxW="3xl">
                      <Heading size="sm">{order.snapshot.title}</Heading>
                      <Text fontSize="sm" color="text.muted">
                        Closed{' '}
                        {order.closedAt ? formatDate(order.closedAt) : '—'}
                      </Text>
                    </Stack>
                    <HStack gap={3}>
                      <Badge variant="info">Closed</Badge>
                      <Text fontWeight={800}>
                        {formatOrderAgreedPrice(order)}
                      </Text>
                      <Text fontSize="sm" fontWeight={600} color="text.link">
                        Open task →
                      </Text>
                    </HStack>
                  </HStack>
                </Card>
              </Link>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
