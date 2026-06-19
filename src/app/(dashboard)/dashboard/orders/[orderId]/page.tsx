'use client'

import { useQuery } from '@apollo/client/react'
import { Stack, Text } from '@chakra-ui/react'
import type { OrderDetailQuery } from '@codegen/schema'
import { useParams, useRouter } from 'next/navigation'
import { useRef } from 'react'

import OrderDetail from '@/app/(dashboard)/dashboard/orders/[orderId]/graphql/OrderDetail.gql'
import { EVENTS, capture, captureApiError } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { taskOrderSectionHref } from '@/utils/orderHelpers'
import { Card } from '@ui'

/** Legacy URL — redirects to `/tasks/:taskId#task-order`. */
export default function LegacyOrderDetailRedirect() {
  const router = useRouter()
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId?.trim() ?? ''
  const redirectedRef = useRef(false)

  const { data, loading, error } = useQuery<OrderDetailQuery>(OrderDetail, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: 'cache-and-network',
  })

  const taskId = data?.order?.taskId?.trim()
  if (taskId && !redirectedRef.current) {
    redirectedRef.current = true
    capture(EVENTS.order_view, { order_id: orderId, task_id: taskId })
    router.replace(taskOrderSectionHref(taskId))
  }

  if (!orderId) {
    return <Text color="formLabelMuted">Missing order id.</Text>
  }

  if (error) {
    captureApiError(error, {
      flow: 'order_detail',
      action: 'loadOrderDetail',
      source: 'graphql',
      url_or_operation: 'OrderDetail',
      route: `/dashboard/orders/${orderId}`,
      report_global: false,
    })
    return (
      <Text color="red.500" fontSize="sm">
        {getFriendlyErrorMessage(error, 'Could not load this order.')}
      </Text>
    )
  }

  if (!loading && !taskId) {
    return (
      <Card layout="section" p={6}>
        <Text color="formLabelMuted" fontSize="sm">
          Order not found or you do not have access.
        </Text>
      </Card>
    )
  }

  return (
    <Stack gap={4} py={6}>
      <Text color="formLabelMuted">Redirecting to order details…</Text>
    </Stack>
  )
}
