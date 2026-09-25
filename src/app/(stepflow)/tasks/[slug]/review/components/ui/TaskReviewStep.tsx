'use client'

import { Stack, Text } from '@chakra-ui/react'

import { REVIEW_COMMENT_MAX } from '@/content/reviews/reviewModel'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { StarRatingInput } from '@/ui/FeedbackDialog/StarRatingInput'
import reviewBag from '@/ui/ReviewForm/i11n.json'
import { FormField, RatingStars, Textarea } from '@ui'

import type { ReviewStepId } from '../../helpers/reviewSteps.config'

export type TaskReviewStepProps = {
  step: ReviewStepId
  stars: number
  comment: string
  onStarsChange: (stars: number) => void
  onCommentChange: (comment: string) => void
  starsError?: string | null
  commentError?: string | null
  locked?: boolean
}

/** Stars, optional comment, and a read-back before submit. */
export function TaskReviewStep({
  step,
  stars,
  comment,
  onStarsChange,
  onCommentChange,
  starsError,
  commentError,
  locked = false,
}: TaskReviewStepProps) {
  const form = useI11n(reviewBag)

  if (step === 'stars') {
    return (
      <FormField
        label={form.starsLabel}
        helperText={form.starsHint}
        errorText={starsError ?? undefined}
      >
        <StarRatingInput
          value={stars || undefined}
          onChange={onStarsChange}
          disabled={locked}
        />
      </FormField>
    )
  }

  if (step === 'comment') {
    return (
      <FormField
        label={form.commentLabel}
        helperText={formatMessage('{count}/{max}', {
          count: comment.length,
          max: REVIEW_COMMENT_MAX,
        })}
        errorText={commentError ?? undefined}
      >
        <Textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder={form.commentPlaceholder}
          rows={5}
          disabled={locked}
          maxLength={REVIEW_COMMENT_MAX}
        />
      </FormField>
    )
  }

  return (
    <Stack gap={3}>
      <RatingStars value={stars} label={form.starsLabel} size="sm" />
      {comment.trim() ? (
        <Text fontSize="sm" color="text.default" lineHeight="tall">
          {comment.trim()}
        </Text>
      ) : (
        <Text fontSize="sm" color="text.muted">
          {form.commentLabel}
        </Text>
      )}
      <Text fontSize="xs" color="text.muted" lineHeight="tall">
        {form.disclaimer}
      </Text>
    </Stack>
  )
}
