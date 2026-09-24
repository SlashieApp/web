'use client'

import { useQuery } from '@apollo/client/react'
import { gql } from 'graphql-tag'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'

import type {
  CustomerAchievementsInput,
  QuoteAllowanceInput,
  WorkerAchievementsInput,
} from './taskAchievements'

/**
 * BE-62 shape. Kept as a string (not a `.gql` document) so codegen does not
 * validate it against the current schema. The deployed `User` type does not
 * have `taskAchievements` yet — requesting it returns HTTP 400, and the Apollo
 * error link treats that as a network failure that can leave `/tasks`.
 * Flip {@link TASK_ACHIEVEMENTS_QUERY_ENABLED} once the field is live.
 */
export const TASK_ACHIEVEMENTS_QUERY_ENABLED = false

const MY_TASK_ACHIEVEMENTS = gql`
  query MyTaskAchievements {
    me {
      taskAchievements {
        worker {
          hasActivity
          completedJobsCount
          categoryMix {
            category
            count
            percent
          }
          mostWorkedLocation
          quotesThisMonth
          quotesFreeCap
          quotesUnlimited
          streakWeeks
          agreedTotalsOnCompletedJobs {
            amount
            currency
          }
        }
        customer {
          hasActivity
          hostedCompletedCount
          categoryMix {
            category
            count
            percent
          }
          mostUsedLocation
          quotesReceived
          agreedTotalsOnCompletedJobs {
            amount
            currency
          }
        }
      }
    }
  }
`

type TaskAchievementsQuery = {
  me: {
    taskAchievements: {
      worker: WorkerAchievementsInput | null
      customer: CustomerAchievementsInput | null
    } | null
  } | null
}

export function useMyTaskAchievements() {
  const me = useUserStore((state) => state.me)
  const { data, loading, error } = useQuery<TaskAchievementsQuery>(
    MY_TASK_ACHIEVEMENTS,
    {
      skip: !me || !TASK_ACHIEVEMENTS_QUERY_ENABLED,
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
    loading: TASK_ACHIEVEMENTS_QUERY_ENABLED && loading && !stats,
    unavailable: TASK_ACHIEVEMENTS_QUERY_ENABLED && Boolean(error) && !stats,
    worker: stats?.worker ?? null,
    customer: stats?.customer ?? null,
    quoteAllowance,
    hasWorkerProfile: Boolean(me?.worker),
  }
}
