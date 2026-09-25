'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { C2CReview } from '@/content/reviews/reviewModel'
import { reviewCanEdit } from '@/content/reviews/reviewModel'
import { Button, Card, Link, RatingStars } from '@ui'

export type OrderReviewsCopy = {
  heading: string
  yours: string
  theirs: string
  edit: string
  locked: string
  waiting: string
  empty: string
}

export type OrderReviewsCardProps = {
  copy: OrderReviewsCopy
  viewerReview: C2CReview | null
  counterpartyReview: C2CReview | null
  viewerHasSubmitted: boolean
  editHref?: string
  report?: ReactNode
}

function ReviewBlock({
  label,
  review,
  action,
}: {
  label: string
  review: C2CReview
  action?: ReactNode
}) {
  const comment = review.comment?.trim()
  return (
    <Stack gap={2}>
      <HStack justify="space-between" gap={3} align="center">
        <Text fontSize="sm" fontWeight={700} color="text.default">
          {label}
        </Text>
        <RatingStars value={review.stars} label={label} size="sm" />
      </HStack>
      {comment ? (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {comment}
        </Text>
      ) : null}
      {action}
    </Stack>
  )
}

/** Completed-order reviews. The other party's text is shown only when the API returns it. */
export function OrderReviewsCard({
  copy,
  viewerReview,
  counterpartyReview,
  viewerHasSubmitted,
  editHref,
  report,
}: OrderReviewsCardProps) {
  const canEdit = viewerReview ? reviewCanEdit(viewerReview) : false
  return (
    <Card layout="section" heading={copy.heading}>
      <Stack gap={4}>
        {viewerReview ? (
          <ReviewBlock
            label={copy.yours}
            review={viewerReview}
            action={
              canEdit && editHref ? (
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  alignSelf="flex-start"
                >
                  <Link href={editHref} _hover={{ textDecoration: 'none' }}>
                    {copy.edit}
                  </Link>
                </Button>
              ) : (
                <Text fontSize="xs" color="text.muted">
                  {copy.locked}
                </Text>
              )
            }
          />
        ) : (
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {copy.empty}
          </Text>
        )}
        {counterpartyReview ? (
          <ReviewBlock
            label={copy.theirs}
            review={counterpartyReview}
            action={report}
          />
        ) : viewerHasSubmitted ? (
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {copy.waiting}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}
