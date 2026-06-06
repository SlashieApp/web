'use client'

import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import MyQuotes from '@/app/(dashboard)/quotes/graphql/MyQuotes.gql'
import { quotePriceFromCache } from '@/app/(dashboard)/quotes/helpers/quotePriceFromCache'
import type { MyQuotesQueryData } from '@/graphql/tasks-query.types'
import type { MyQuoteItem } from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import type { TaskListVariables } from '@/utils/taskListQuery'

/** Worker inbox: tasks where the caller has submitted at least one quote. */
export function useMyQuotes(variables?: TaskListVariables) {
  const me = useUserStore((s) => s.me)
  const { data, loading, error, refetch } = useQuery<
    MyQuotesQueryData,
    TaskListVariables
  >(MyQuotes, {
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !me,
  })

  const sentQuotes = useMemo((): MyQuoteItem[] => {
    if (!me) return []

    // Server applies the chosen `sort` on tasks; preserve that order here.
    return (data?.myQuotes ?? []).flatMap((task) =>
      (task.quotes ?? [])
        .filter((quote) => quote.workerUserId === me.id)
        .map((quote) => {
          const cachedPrice = quotePriceFromCache(quote.id)
          const resolvedPrice = quote.price ?? cachedPrice
          return {
            task,
            quote: resolvedPrice ? { ...quote, price: resolvedPrice } : quote,
          }
        }),
    )
  }, [data?.myQuotes, me])

  return {
    me,
    loading,
    errorMessage: error
      ? getFriendlyErrorMessage(error, 'Could not load your quotes.')
      : null,
    refetch,
    sentQuotes,
  }
}
