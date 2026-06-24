'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { Avatar } from '../Avatar/Avatar'
import { Badge, StatusPill, type TaskStatusValue } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Card, type CardProps } from '../Card/Card'
import { Rating } from '../Rating/Rating'

/**
 * SDL QuoteCard organism. A worker's quote on a task: avatar + name, rating,
 * a £ amount (green ink), a message snippet, accept/decline actions, and a
 * status pill.
 *
 * Composed ONLY from existing @ui atoms (Card, Avatar, Rating, Badge/StatusPill,
 * Button) and Chakra layout primitives + Text. References SDL semantic roles
 * only.
 *
 * SDL notes:
 * - The amount is a green accent — it uses `text.link` (green ink for text), the
 *   role for green amounts in feature copy. It is NOT a green fill, so the
 *   green-ink rule (fill pairs with `text.onGreen`) does not apply to text.
 * - The status pill always renders a dot + label (status is never colour alone),
 *   either via the task `status` map (StatusPill) or a custom `statusLabel`.
 * - Accept is a primary action (meets the 44px touch target at `md`); decline is
 *   a secondary action. Focus rings come from the Button atom.
 */
export type QuoteStatusValue = TaskStatusValue

export type QuoteCardProps = Omit<CardProps, 'children' | 'onSubmit'> & {
  /** Worker display name; drives the avatar initials fallback. */
  workerName: string
  /** Optional worker avatar image. */
  workerAvatarUrl?: string
  /** Worker rating score, e.g. "4.9" (or "—" when no reviews yet). */
  rating?: string
  /** Formatted quote amount including currency symbol, e.g. "£240". */
  amount: string
  /** Short message / pitch from the worker. */
  message: string
  /**
   * Quote lifecycle status. Maps to the SDL StatusPill family (dot + label).
   * Omit and pass `statusLabel` for a custom neutral status chip.
   */
  status?: QuoteStatusValue
  /** Custom status label; overrides the default label for the given `status`. */
  statusLabel?: string
  /** Accept the quote. When omitted, the accept action is hidden. */
  onAccept?: () => void
  /** Decline the quote. When omitted, the decline action is hidden. */
  onDecline?: () => void
  acceptLabel?: string
  declineLabel?: string
  /** Disable the action buttons (e.g. while a mutation is in flight). */
  actionsDisabled?: boolean
}

/** Worker quote card — avatar, rating, £ amount, message snippet, actions. */
export function QuoteCard({
  workerName,
  workerAvatarUrl,
  rating,
  amount,
  message,
  status,
  statusLabel,
  onAccept,
  onDecline,
  acceptLabel = 'Accept quote',
  declineLabel = 'Decline',
  actionsDisabled = false,
  ...cardProps
}: QuoteCardProps) {
  const showActions = Boolean(onAccept || onDecline)

  return (
    <Card {...cardProps}>
      <Stack gap={4}>
        {/* Header: worker identity + status */}
        <HStack justify="space-between" align="flex-start" gap={3}>
          <HStack gap={3} align="center" minW={0}>
            <Avatar name={workerName} src={workerAvatarUrl} size="lg" />
            <Stack gap={1} minW={0}>
              <Text
                fontSize="md"
                fontWeight={600}
                color="text.default"
                lineHeight="short"
                truncate
              >
                {workerName}
              </Text>
              {rating ? (
                <Rating
                  value={rating}
                  size="sm"
                  label={`${workerName} rating`}
                />
              ) : null}
            </Stack>
          </HStack>
          {status ? (
            <StatusPill status={status} label={statusLabel} />
          ) : statusLabel ? (
            <Badge variant="neutral" dot shape="pill">
              {statusLabel}
            </Badge>
          ) : null}
        </HStack>

        {/* Amount — green accent text (green ink), not a green fill */}
        <HStack align="baseline" gap={2}>
          <Text
            fontSize={{ base: '24px', md: '28px' }}
            fontWeight={700}
            color="text.link"
            lineHeight="short"
          >
            {amount}
          </Text>
          <Text fontSize="sm" color="text.muted">
            quoted
          </Text>
        </HStack>

        {/* Message snippet */}
        <Text fontSize="sm" color="text.muted" lineHeight="tall" lineClamp={3}>
          {message}
        </Text>

        {/* Actions */}
        {showActions ? (
          <HStack gap={3} pt={1}>
            {onAccept ? (
              <Button
                variant="primary"
                size="md"
                onClick={onAccept}
                disabled={actionsDisabled}
                flex={1}
              >
                {acceptLabel}
              </Button>
            ) : null}
            {onDecline ? (
              <Button
                variant="secondary"
                size="md"
                onClick={onDecline}
                disabled={actionsDisabled}
                flex={onAccept ? undefined : 1}
              >
                {declineLabel}
              </Button>
            ) : null}
          </HStack>
        ) : null}
      </Stack>
    </Card>
  )
}
