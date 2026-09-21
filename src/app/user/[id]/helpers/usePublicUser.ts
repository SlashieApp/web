'use client'

import { useQuery } from '@apollo/client/react'
import type { PublicUserQuery } from '@codegen/schema'

import PublicUser from '../graphql/PublicUser.gql'
import type { PublicUserRecord } from './publicUserHelpers'

export type PublicUserState = {
  user: PublicUserRecord | null
  pending: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Anonymous-safe `user(id)` peek. A null user is not an error: the API
 * returns null for missing, disabled, and private profiles.
 */
export function usePublicUser(
  userId: string,
  excludeTaskId: string | null,
): PublicUserState {
  const id = userId.trim()
  const exclude = excludeTaskId?.trim() || null
  const { data, loading, error, refetch } = useQuery<PublicUserQuery>(
    PublicUser,
    {
      variables: { id, excludeTaskId: exclude },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    },
  )

  const user = data?.user ?? null
  const failed = Boolean(error) && user == null
  const notFound =
    !failed && (!id || (!loading && data !== undefined && user == null))
  const pending = Boolean(id) && user == null && !failed && !notFound

  return {
    user,
    pending,
    error: failed
      ? error instanceof Error
        ? error
        : new Error('Failed to load profile')
      : null,
    refetch: () => {
      void refetch()
    },
  }
}
