'use client'

import { useQuery } from '@apollo/client/react'
import type { MyOrdersQuery } from '@codegen/schema'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import MyOrders from '@/app/(dashboard)/earnings/graphql/MyOrders.gql'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import {
  type OrderItem,
  activeOrdersForUser,
  customerOrders,
  isOrderClosed,
  isOrderCompletedEarnings,
  isOrderPendingEarnings,
  sumOrderAgreedPricePence,
  workerOrders,
} from '@/utils/orderHelpers'

export function useAccountOrders() {
  const me = useUserStore((s) => s.me)
  const { data, loading, error, refetch } = useQuery<MyOrdersQuery>(MyOrders, {
    skip: !me,
    fetchPolicy: 'cache-and-network',
  })

  const orders = data?.me?.orders ?? []
  const pendingEarnings = data?.me?.worker?.earnings?.pending

  const grouped = useMemo(() => {
    if (!me) {
      return {
        customerOrders: [] as OrderItem[],
        workerOrders: [] as OrderItem[],
        activeOrders: [] as OrderItem[],
        closedOrders: [] as OrderItem[],
        closedWorkerOrders: [] as OrderItem[],
        pendingWorkerOrders: [] as OrderItem[],
      }
    }

    const asCustomer = customerOrders(orders, me.id)
    const asWorker = workerOrders(orders, me.id)
    const active = activeOrdersForUser(orders, me.id)
    const closed = orders.filter(
      (o) =>
        isOrderClosed(o.status) &&
        (o.customerUserId === me.id || o.workerUserId === me.id),
    )
    const closedWorker = asWorker.filter((o) =>
      isOrderCompletedEarnings(o.status),
    )
    const pendingWorker = asWorker.filter((o) =>
      isOrderPendingEarnings(o.status),
    )

    return {
      customerOrders: asCustomer,
      workerOrders: asWorker,
      activeOrders: active,
      closedOrders: closed,
      closedWorkerOrders: closedWorker,
      pendingWorkerOrders: pendingWorker,
    }
  }, [me, orders])

  const pendingEarningsPence = useMemo(() => {
    const apiAmount = pendingEarnings?.amount
    if (typeof apiAmount === 'number' && Number.isFinite(apiAmount)) {
      return Math.round(apiAmount * 100)
    }
    return sumOrderAgreedPricePence(grouped.pendingWorkerOrders)
  }, [grouped.pendingWorkerOrders, pendingEarnings?.amount])

  const completedEarningsPence = useMemo(
    () => sumOrderAgreedPricePence(grouped.closedWorkerOrders),
    [grouped.closedWorkerOrders],
  )

  return {
    me,
    loading,
    errorMessage: error
      ? getFriendlyErrorMessage(error, 'Could not load your jobs.')
      : null,
    refetch,
    orders,
    ...grouped,
    pendingEarningsPence,
    completedEarningsPence,
    openOrdersCount: grouped.activeOrders.length,
    closedOrdersCount: grouped.closedOrders.length,
  }
}
