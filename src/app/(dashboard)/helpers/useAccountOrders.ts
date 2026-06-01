'use client'

import { useQuery } from '@apollo/client/react'
import type { MyOrdersQuery, WorkerPendingEarningsQuery } from '@codegen/schema'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import MyOrders from '@/app/(dashboard)/graphql/MyOrders.gql'
import WorkerPendingEarnings from '@/app/(dashboard)/graphql/WorkerPendingEarnings.gql'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import {
  type OrderItem,
  activeOrdersForUser,
  customerOrders,
  isOrderClosed,
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

  const { data: pendingData, refetch: refetchPending } =
    useQuery<WorkerPendingEarningsQuery>(WorkerPendingEarnings, {
      skip: !me,
      fetchPolicy: 'cache-and-network',
    })

  const orders = data?.myOrders ?? []

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
    const closedWorker = asWorker.filter((o) => isOrderClosed(o.status))
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
    const apiAmount = pendingData?.workerPendingEarnings?.amount
    if (typeof apiAmount === 'number' && Number.isFinite(apiAmount)) {
      return Math.round(apiAmount * 100)
    }
    return sumOrderAgreedPricePence(grouped.pendingWorkerOrders)
  }, [grouped.pendingWorkerOrders, pendingData?.workerPendingEarnings?.amount])

  const completedEarningsPence = useMemo(
    () => sumOrderAgreedPricePence(grouped.closedWorkerOrders),
    [grouped.closedWorkerOrders],
  )

  const refetchAll = async () => {
    await Promise.all([refetch(), refetchPending()])
  }

  return {
    me,
    loading,
    errorMessage: error
      ? getFriendlyErrorMessage(error, 'Could not load your jobs.')
      : null,
    refetch: refetchAll,
    orders,
    ...grouped,
    pendingEarningsPence,
    completedEarningsPence,
    openOrdersCount: grouped.activeOrders.length,
    closedOrdersCount: grouped.closedOrders.length,
  }
}
