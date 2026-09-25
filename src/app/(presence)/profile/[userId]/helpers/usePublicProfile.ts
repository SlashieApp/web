'use client'

import { useQuery } from '@apollo/client/react'
import type {
  PublicProfileQuery,
  PublicProfileQueryVariables,
  ReviewableCompletedOrdersQuery,
} from '@codegen/schema'

import PublicProfile from '../graphql/PublicProfile.gql'
import ReviewableCompletedOrders from '../graphql/ReviewableCompletedOrders.gql'

export function usePublicProfile(userId: string, excludeTaskId: string | null) {
  const exclude = excludeTaskId?.trim() || null
  const { data, loading, error, refetch } = useQuery<
    PublicProfileQuery,
    PublicProfileQueryVariables
  >(PublicProfile, {
    variables: { userId, excludeTaskId: exclude },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  return {
    profile: data?.publicProfile ?? null,
    pending: Boolean(userId) && loading && data == null,
    missing:
      Boolean(userId) &&
      !loading &&
      !error &&
      data != null &&
      !data.publicProfile,
    error: Boolean(error) && !data?.publicProfile,
    refetch,
  }
}

export function useReviewableOrders(enabled: boolean) {
  const { data, loading } = useQuery<ReviewableCompletedOrdersQuery>(
    ReviewableCompletedOrders,
    {
      skip: !enabled,
      fetchPolicy: 'cache-and-network',
    },
  )
  return {
    orders: data?.me.orders ?? [],
    loading: enabled && loading && !data,
  }
}
