'use client'

import { useQuery } from '@apollo/client/react'
import type { MyOrdersQuery } from '@codegen/schema'

import { useUserStore } from '@/app/(auth)/store/user'
import MyOrders from '@/app/(dashboard)/graphql/MyOrders.gql'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

/** The signed-in user's orders (as customer and as worker), for My tasks. */
export function useAccountOrders() {
  const me = useUserStore((s) => s.me)
  const { data, loading, error, refetch } = useQuery<MyOrdersQuery>(MyOrders, {
    skip: !me,
    fetchPolicy: 'cache-and-network',
  })

  return {
    me,
    loading,
    errorMessage: error
      ? getFriendlyErrorMessage(error, 'Could not load your jobs.')
      : null,
    refetch,
    orders: data?.me?.orders ?? [],
  }
}
