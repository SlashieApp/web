'use client'

import { useQuery } from '@apollo/client/react'
import { useCallback } from 'react'

import type { C2CReview } from '@/content/reviews/reviewModel'
import { isGraphQLSchemaMismatch } from '@/utils/graphqlSchemaMismatch'

import OrderPartyReviews from '../graphql/OrderPartyReviews.graphql'
import OrderViewerReviewFlag from '../graphql/OrderViewerReviewFlag.graphql'

type ReviewFlagQuery = {
  order?: { id: string; viewerHasSubmittedReview?: boolean | null } | null
}

type PartyReviewsQuery = {
  order?: {
    id: string
    viewerReview?: C2CReview | null
    counterpartyReview?: C2CReview | null
  } | null
}

function asReview(value: C2CReview | null | undefined): C2CReview | null {
  if (!value?.id || typeof value.rating !== 'number') return null
  return value
}

export function useOrderReviewState(orderId: string | null, enabled: boolean) {
  const skip = !enabled || !orderId
  const flag = useQuery<ReviewFlagQuery>(OrderViewerReviewFlag, {
    variables: { id: orderId ?? '' },
    skip,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })
  const parties = useQuery<PartyReviewsQuery>(OrderPartyReviews, {
    variables: { id: orderId ?? '' },
    skip,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const refetch = useCallback(async () => {
    if (skip) return
    await Promise.all([flag.refetch(), parties.refetch()])
  }, [flag, parties, skip])

  const flagMismatch = isGraphQLSchemaMismatch(flag.error)
  const viewerHasSubmittedReview =
    flag.data?.order?.viewerHasSubmittedReview === true

  return {
    viewerHasSubmittedReview,
    viewerReview: asReview(parties.data?.order?.viewerReview),
    counterpartyReview: asReview(parties.data?.order?.counterpartyReview),
    unavailable: flagMismatch,
    loading: !skip && flag.loading && !flag.data,
    refetch,
  }
}
