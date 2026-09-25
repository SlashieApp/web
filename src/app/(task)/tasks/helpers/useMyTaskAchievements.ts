'use client'

import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import type { MyTaskAchievementsQuery } from '@codegen/schema'

import MyTaskAchievements from '../graphql/MyTaskAchievements.gql'
import type { QuoteAllowanceInput } from './taskAchievements'

/**
 * `me.taskAchievements` and `me.hubTaskCategories` for the My Tasks hub.
 * Categories stay unfiltered on the server so the menu does not shrink while
 * search, owner, or section filters change.
 */
export function useMyTaskAchievements() {
  const me = useUserStore((state) => state.me)
  const { data, loading, error, refetch } = useQuery<MyTaskAchievementsQuery>(
    MyTaskAchievements,
    {
      skip: !me,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
  )

  const quoteAllowance = useMemo<QuoteAllowanceInput>(() => {
    const membership = me?.worker?.membership
    if (!membership) {
      return { used: null, cap: null, unlimited: false }
    }
    return {
      used: membership.quotesUsedThisMonth,
      cap: membership.freeQuotesPerMonth,
      unlimited: membership.hasUnlimitedQuotes,
    }
  }, [me])

  const stats = data?.me?.taskAchievements

  return {
    loading: Boolean(me) && loading && !stats,
    unavailable: Boolean(error) && !stats,
    worker: stats?.worker ?? null,
    customer: stats?.customer ?? null,
    hubTaskCategories: data?.me?.hubTaskCategories ?? [],
    quoteAllowance,
    hasWorkerProfile: Boolean(me?.worker),
    refetch,
  }
}
