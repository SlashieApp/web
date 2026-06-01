'use client'

import { useQuery } from '@apollo/client/react'
import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { OrderDetailQuery } from '@codegen/schema'
import { OrderStatus } from '@codegen/schema'
import NextLink from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { OrderJobInvoice } from '@/app/(dashboard)/components/orders/OrderJobInvoice'
import OrderDetail from '@/app/(dashboard)/graphql/OrderDetail.gql'
import { ScheduleChip } from '@/ui/ScheduleChip'
import { formatDate } from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import {
  type OrderItem,
  formatOrderAgreedPrice,
  orderLocationLabel,
  orderPartyRole,
  orderSnapshotDatetime,
  orderStatusChipLabel,
  orderTaskHref,
  orderTimelineSteps,
  scheduleChipForOrder,
  workerQuoteForOrder,
} from '@/utils/orderHelpers'
import { formatTaskScheduleLabel } from '@/utils/taskJobSchedule'
import { Avatar, Badge, Button, SectionCard } from '@ui'

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId?.trim() ?? ''
  const me = useUserStore((s) => s.me)

  const { data, loading, error, refetch } = useQuery<OrderDetailQuery>(
    OrderDetail,
    {
      variables: { id: orderId },
      skip: !orderId,
      fetchPolicy: 'cache-and-network',
    },
  )

  type OrderDetailRecord = NonNullable<OrderDetailQuery['order']>
  const order = data?.order as OrderDetailRecord | null | undefined
  const orderForHelpers = order as OrderItem | null | undefined
  const role =
    orderForHelpers && me ? orderPartyRole(orderForHelpers, me.id) : null

  const workerQuote = useMemo(() => {
    if (!order?.task?.quotes) return null
    return workerQuoteForOrder(order.task.quotes, order.quoteId)
  }, [order])

  const workerName = workerQuote?.worker?.profile?.name?.trim() || 'Worker'
  const timeline = orderForHelpers ? orderTimelineSteps(orderForHelpers) : []
  const schedule = orderForHelpers
    ? formatTaskScheduleLabel(orderSnapshotDatetime(orderForHelpers))
    : null

  if (!orderId) {
    return <Text color="formLabelMuted">Missing order id.</Text>
  }

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Stack gap={1}>
            <Link
              as={NextLink}
              href="/jobs"
              fontSize="sm"
              fontWeight={600}
              color="primary.700"
            >
              ← Jobs
            </Link>
            <Heading size="xl">Order details</Heading>
          </Stack>
          <Button size="sm" variant="ghost" onClick={() => void refetch()}>
            Refresh
          </Button>
        </HStack>
      </Stack>

      {error ? (
        <Text color="red.500" fontSize="sm">
          {getFriendlyErrorMessage(error, 'Could not load this order.')}
        </Text>
      ) : null}

      {loading && !order ? (
        <Text color="formLabelMuted">Loading order…</Text>
      ) : null}

      {!loading && !order ? (
        <SectionCard p={6}>
          <Text color="formLabelMuted" fontSize="sm">
            Order not found or you do not have access.
          </Text>
        </SectionCard>
      ) : null}

      {order && orderForHelpers ? (
        <Stack gap={4}>
          <SectionCard p={5}>
            <Stack gap={4}>
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <Heading size="md">{order.snapshot.title}</Heading>
                <HStack gap={2}>
                  <ScheduleChip chip={scheduleChipForOrder(orderForHelpers)} />
                  <Badge bg="badgeBg" color="cardFg">
                    {role === 'customer' ? 'Customer' : 'Worker'} ·{' '}
                    {orderStatusChipLabel(order.status)}
                  </Badge>
                </HStack>
              </HStack>

              <Stack gap={1} fontSize="sm" color="formLabelMuted">
                <Text>
                  Agreed {formatOrderAgreedPrice(orderForHelpers)} ·{' '}
                  {orderLocationLabel(orderForHelpers)}
                </Text>
                {schedule ? <Text>Schedule: {schedule}</Text> : null}
                <Text>
                  Created {formatDate(order.createdAt)}
                  {order.closedAt
                    ? ` · Closed ${formatDate(order.closedAt)}`
                    : ''}
                </Text>
              </Stack>

              <HStack gap={3} flexWrap="wrap">
                <Link
                  as={NextLink}
                  href={orderTaskHref(orderForHelpers)}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button size="sm">Open task</Button>
                </Link>
              </HStack>
            </Stack>
          </SectionCard>

          <SectionCard p={5} eyebrow="Worker" heading={workerName} bodyGap={3}>
            <Avatar
              name={workerName}
              src={workerQuote?.worker?.profile?.avatarUrl ?? undefined}
              label={workerName}
            />
          </SectionCard>

          <SectionCard
            p={5}
            eyebrow="Progress"
            heading="Status timeline"
            bodyGap={3}
          >
            <Stack gap={0}>
              {timeline.map((step, index) => (
                <HStack
                  key={step.key}
                  align="flex-start"
                  gap={3}
                  py={2}
                  borderBottomWidth={
                    index < timeline.length - 1 ? '1px' : undefined
                  }
                  borderColor="cardBorder"
                >
                  <Box
                    w={2}
                    h={2}
                    mt={2}
                    borderRadius="full"
                    bg={
                      step.done
                        ? 'primary.600'
                        : step.current
                          ? 'primary.300'
                          : 'neutral.300'
                    }
                    flexShrink={0}
                  />
                  <Stack gap={0} flex={1}>
                    <Text
                      fontSize="sm"
                      fontWeight={step.current ? 700 : 600}
                      color={
                        step.done || step.current ? 'cardFg' : 'formLabelMuted'
                      }
                    >
                      {step.label}
                    </Text>
                    {step.at ? (
                      <Text fontSize="xs" color="formLabelMuted">
                        {formatDate(step.at)}
                      </Text>
                    ) : null}
                  </Stack>
                </HStack>
              ))}
            </Stack>
          </SectionCard>

          {role === 'customer' &&
          order.status === OrderStatus.Active &&
          order.completionVerificationCode ? (
            <SectionCard
              p={5}
              eyebrow="Close job"
              heading="Completion code"
              bodyGap={2}
            >
              <Text
                fontFamily="mono"
                fontSize="2xl"
                fontWeight={800}
                letterSpacing="0.2em"
              >
                {order.completionVerificationCode}
              </Text>
              <Text fontSize="sm" color="formLabelMuted">
                Share with your worker when the job is done and you have paid
                them directly.
              </Text>
            </SectionCard>
          ) : null}

          {role === 'customer' && order.status === OrderStatus.Closed ? (
            <SectionCard p={5} eyebrow="Records" heading="Invoice" bodyGap={3}>
              <OrderJobInvoice
                order={orderForHelpers}
                workerName={workerName}
              />
            </SectionCard>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  )
}
