'use client'

import { useQuery } from '@apollo/client/react'
import { useCallback } from 'react'

import type { C2CReview } from '@/content/reviews/reviewModel'
import { isGraphQLSchemaMismatch } from '@/utils/graphqlSchemaMismatch'

import OrderReviewState from '../graphql/OrderReviewState.gql'

type ReviewNode = {
  id: string
  stars: number
  comment?: string | null
  createdAt?: string | null
}

type OrderReviewStateQuery = {
  order?: {
    id: string
    reviewState?: {
      canSubmit?: boolean | null
      viewerHasSubmittedReview?: boolean | null
      viewerReview?: ReviewNode | null
      counterpartReview?: ReviewNode | null
    } | null
  } | null
}

function asReview(value: ReviewNode | null | undefined): C2CReview | null {
  if (!value?.id || typeof value.stars !== 'number') return null
  return {
    id: value.id,
    stars: value.stars,
    comment: value.comment,
    createdAt: value.createdAt,
  }
}

export function useOrderReviewState(orderId: string | null, enabled: boolean) {
  const skip = !enabled || !orderId
  const query = useQuery<OrderReviewStateQuery>(OrderReviewState, {
    variables: { id: orderId ?? '' },
    skip,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const refetch = useCallback(async () => {
    if (skip) return
    await query.refetch()
  }, [query, skip])

  const state = query.data?.order?.reviewState

  return {
    canSubmit: state?.canSubmit === true,
    viewerHasSubmittedReview: state?.viewerHasSubmittedReview === true,
    viewerReview: asReview(state?.viewerReview),
    counterpartyReview: asReview(state?.counterpartReview),
    unavailable: isGraphQLSchemaMismatch(query.error),
    loading: !skip && query.loading && !query.data,
    refetch,
  }
}
