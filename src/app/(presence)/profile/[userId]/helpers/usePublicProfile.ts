'use client'

import { useQuery } from '@apollo/client/react'
import type {
  PublicProfileQuery,
  PublicProfileQueryVariables,
} from '@codegen/schema'

import PublicProfile from '../graphql/PublicProfile.gql'

export function usePublicProfile(userId: string, excludeTaskId: string | null) {
  const { data, loading, error, refetch } = useQuery<
    PublicProfileQuery,
    PublicProfileQueryVariables
  >(PublicProfile, {
    variables: { userId, excludeTaskId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  return {
    profile: data?.publicProfile ?? null,
    pending: Boolean(userId) && loading && data == null,
    error: Boolean(error) && !data?.publicProfile,
    refetch,
  }
}
