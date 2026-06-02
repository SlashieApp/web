'use client'

import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import MyQuotes from '@/app/(dashboard)/quotes/graphql/MyQuotes.gql'
import type { MyQuotesQueryData } from '@/graphql/tasks-query.types'
import { type MyQuoteItem, timeFromUnknown } from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

/** Worker inbox: tasks where the caller has submitted at least one quote. */
export function useMyQuotes() {
  const me = useUserStore((s) => s.me)
  const { data, loading, error, refetch } = useQuery<MyQuotesQueryData>(
    MyQuotes,
    {
      fetchPolicy: 'cache-and-network',
      skip: !me,
    },
  )

  const sentQuotes = useMemo((): MyQuoteItem[] => {
    if (!me) return []

    return (data?.myQuotes ?? [])
      .flatMap((task) =>
        (task.quotes ?? [])
          .filter((quote) => quote.workerUserId === me.id)
          .map((quote) => ({ task, quote })),
      )
      .sort(
        (a, b) =>
          timeFromUnknown(b.quote.createdAt) -
          timeFromUnknown(a.quote.createdAt),
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
