'use client'

import { HStack, type StackProps, Text } from '@chakra-ui/react'

/**
 * SDL Rating. Compact, read-only star + score used on task/profile cards.
 *
 * SDL notes:
 * - The star uses `status.warning.solid` (amber), the SDL role for the legacy
 *   `mustard.400` fill. It is `aria-hidden` because the meaning is carried by
 *   the visible score label (status is never communicated by color/icon alone).
 * - The score uses `text.muted`, the SDL role for the legacy `cardMutedFg`.
 * - Read-only display element, so there is no focus ring / touch target.
 *
 * Public API: `value` is preserved. `size` and `label` are additive and
 * optional, so existing call sites (`<Rating value="4.9" />`) are unchanged.
 */
export type UiRatingSize = 'sm' | 'md'

export type RatingProps = Omit<StackProps, 'children'> & {
  /** The score to display (e.g. "4.9", or "—" when there are no reviews). */
  value: string
  /** Visual density. Defaults to `md`. */
  size?: UiRatingSize
  /**
   * Accessible label describing the score (e.g. "Worker rating").
   * Rendered as the group's `aria-label` so screen readers announce context.
   */
  label?: string
}

const ratingSizes: Record<
  UiRatingSize,
  { star: string; score: string; gap: number }
> = {
  sm: { star: 'xs', score: 'xs', gap: 1 },
  md: { star: 'xs', score: 'sm', gap: 1 },
}

export type RatingStarsProps = Omit<StackProps, 'children'> & {
  /** Filled stars, 0–5 (fractions round to nearest whole star). */
  value: number
  /** Accessible label context (e.g. "Job rating"). */
  label?: string
  size?: UiRatingSize
}

/**
 * Five-star display row (completed-job rows, review lists). Filled stars use
 * the brand action colour per the profile v2 mockup; empty stars are muted.
 */
export function RatingStars({
  value,
  label,
  size = 'md',
  ...rest
}: RatingStarsProps) {
  const filled = Math.min(5, Math.max(0, Math.round(value)))
  const { star } = ratingSizes[size]

  return (
    <HStack
      gap={0.5}
      flexShrink={0}
      role="img"
      aria-label={`${label ?? 'Rating'}: ${filled} out of 5 stars`}
      {...rest}
    >
      {[1, 2, 3, 4, 5].map((position) => (
        <Text
          key={position}
          as="span"
          color={position <= filled ? 'action.primary' : 'border.strong'}
          fontSize={star}
          lineHeight="1"
          aria-hidden
        >
          ★
        </Text>
      ))}
    </HStack>
  )
}

export function Rating({ value, size = 'md', label, ...rest }: RatingProps) {
  const { star, score, gap } = ratingSizes[size]

  return (
    <HStack
      gap={gap}
      flexShrink={0}
      role="img"
      aria-label={label ? `${label}: ${value}` : `Rating: ${value}`}
      {...rest}
    >
      <Text
        as="span"
        color="status.warning.solid"
        fontSize={star}
        lineHeight="1"
        aria-hidden
      >
        ★
      </Text>
      <Text
        as="span"
        fontSize={score}
        fontWeight={600}
        color="text.muted"
        lineHeight="1"
      >
        {value}
      </Text>
    </HStack>
  )
}
