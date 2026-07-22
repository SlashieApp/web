'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LuCheck, LuChevronRight } from 'react-icons/lu'
import bag from '../../i11n.json'

import { formatMessage } from '@/i18n/loadPageI11n'
import { Button, Link } from '@ui'

function avatarGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1)
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${(hue + 40) % 360} 60% 36%) 100%)`
}

export type QuoteCardStatusBadge = 'accepted' | 'declined' | 'yours'

export type QuoteCardProps = {
  name: string
  avatarLabel: string
  avatarUrl?: string | null
  /** Shown in the price column when `showPrice` is true. */
  priceLabel: string
  priceKindLabel?: string | null
  message?: string | null
  respondedLabel?: string | null
  /** Availability chip, e.g. "Available this week". */
  availabilityLabel?: string | null
  /** Status badge under the price: Accepted (green) / Declined / Your quote. */
  statusBadge?: QuoteCardStatusBadge | null
  showVerified?: boolean
  ratingLine?: string | null
  /** When false, price column is hidden (e.g. visitors — API omits amounts for non-posters). */
  showPrice?: boolean
  /** `list` = divider rows like task meta; `card` = bordered tile. */
  variant?: 'list' | 'card'
  acceptPrimary?: boolean
  isOwnQuote?: boolean
  onAccept?: () => void
  onDecline?: () => void
  acceptLoading?: boolean
  declineLoading?: boolean
  acceptDisabled?: boolean
  detailHref?: string
  /** Links avatar and name to the public worker profile when set. */
  workerProfileHref?: string
}

const STATUS_BADGE_STYLES: Record<
  QuoteCardStatusBadge,
  { bg: string; color: string; borderColor: string }
> = {
  accepted: {
    bg: 'status.success.soft',
    color: 'status.success.fg',
    borderColor: 'status.success.soft',
  },
  declined: {
    bg: 'bg.subtle',
    color: 'text.muted',
    borderColor: 'border.default',
  },
  yours: {
    bg: 'bg.surface',
    color: 'status.success.fg',
    borderColor: 'status.success.solid',
  },
}

export function QuoteCard({
  name,
  avatarLabel,
  avatarUrl,
  priceLabel,
  priceKindLabel,
  message,
  respondedLabel,
  availabilityLabel,
  statusBadge,
  showVerified = false,
  ratingLine,
  showPrice = true,
  variant = 'list',
  acceptPrimary = false,
  isOwnQuote = false,
  onAccept,
  onDecline,
  acceptLoading = false,
  declineLoading = false,
  acceptDisabled = false,
  detailHref,
  workerProfileHref,
}: QuoteCardProps) {
  const { quotes: q } = useI11n(bag)
  const card = q.card

  const profileHref = workerProfileHref ?? detailHref ?? '/quotes'
  const profileLinkLabel = workerProfileHref ? card.viewProfile : card.messages
  // Default only when omitted (`undefined`); explicit `null` still hides the row.
  const displayRating = ratingLine === undefined ? card.noReviews : ratingLine
  const body =
    message && message.trim().length > 0
      ? message.length > (variant === 'card' ? 160 : 220)
        ? `${message.slice(0, variant === 'card' ? 157 : 217).trim()}…`
        : message
      : card.noMessage

  const isCard = variant === 'card'

  const statusLabels: Record<QuoteCardStatusBadge, string> = {
    accepted: card.accepted,
    declined: card.declined,
    yours: card.yours,
  }

  const avatar = (
    <QuoteCardAvatar
      name={name}
      avatarLabel={avatarLabel}
      avatarUrl={avatarUrl}
      size={isCard ? '44px' : '48px'}
    />
  )

  const nameBlock = workerProfileHref ? (
    <Link
      href={workerProfileHref}
      _hover={{ textDecoration: 'none', color: 'text.link' }}
    >
      <Heading size="sm" lineHeight="short">
        {name}
      </Heading>
    </Link>
  ) : (
    <Heading size="sm" lineHeight="short">
      {name}
    </Heading>
  )

  const ratingRow = (
    <HStack gap={1} fontSize="sm" color="text.muted" fontWeight={500}>
      <Text as="span" color="status.warning.solid" aria-hidden>
        ★
      </Text>
      <Text as="span">{displayRating}</Text>
    </HStack>
  )

  const badgeStyle = statusBadge ? STATUS_BADGE_STYLES[statusBadge] : null
  const statusBadgeEl =
    badgeStyle && statusBadge ? (
      <Box
        as="span"
        display="inline-block"
        px={2.5}
        py={0.5}
        borderRadius="full"
        borderWidth="1px"
        borderColor={badgeStyle.borderColor}
        bg={badgeStyle.bg}
        color={badgeStyle.color}
        fontSize="xs"
        fontWeight={700}
        whiteSpace="nowrap"
      >
        {statusLabels[statusBadge]}
      </Box>
    ) : null

  const priceBlock =
    (showPrice && priceLabel) || statusBadgeEl ? (
      <Stack align="flex-end" gap={1} textAlign="right" flexShrink={0}>
        {showPrice && priceLabel ? (
          <Text
            fontWeight={700}
            fontSize={isCard ? '2xl' : 'xl'}
            color={isCard ? 'text.default' : 'text.link'}
            lineHeight="shorter"
          >
            {priceLabel}
          </Text>
        ) : null}
        {!isCard && showPrice && priceKindLabel ? (
          <Text fontSize="xs" color="text.muted">
            {priceKindLabel}
          </Text>
        ) : null}
        {statusBadgeEl}
      </Stack>
    ) : null

  const availabilityChip = availabilityLabel ? (
    <Box
      as="span"
      display="inline-block"
      w="fit-content"
      px={2.5}
      py={1}
      borderRadius="full"
      bg="status.success.soft"
      color="status.success.fg"
      fontSize="xs"
      fontWeight={600}
    >
      {availabilityLabel}
    </Box>
  ) : null

  const actionBlock = isOwnQuote ? (
    <Button size="sm" variant="secondary" disabled w="full">
      {card.yours}
    </Button>
  ) : onAccept || onDecline ? (
    // Decline (ghost) beside Accept (primary), per the quotes-module mockup.
    <HStack gap={2} w="full">
      {onDecline ? (
        <Button
          size="sm"
          flex={1}
          variant="ghost"
          borderWidth="1px"
          borderColor="border.default"
          color="text.default"
          loading={declineLoading}
          disabled={acceptLoading || acceptDisabled}
          onClick={onDecline}
        >
          {card.decline}
        </Button>
      ) : null}
      {onAccept ? (
        <Button
          size="sm"
          flex={1}
          loading={acceptLoading}
          disabled={acceptDisabled || declineLoading}
          onClick={onAccept}
          variant="primary"
        >
          {card.accept}
        </Button>
      ) : null}
    </HStack>
  ) : null

  const profileAria = formatMessage(card.viewProfileFor, { name })

  if (isCard) {
    return (
      <Stack
        gap={3}
        p={4}
        borderRadius="xl"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        w="full"
      >
        <HStack align="flex-start" gap={3} justify="space-between" w="full">
          <HStack align="flex-start" gap={3} flex={1} minW={0}>
            {workerProfileHref ? (
              <Link
                href={workerProfileHref}
                flexShrink={0}
                _hover={{ textDecoration: 'none' }}
                aria-label={profileAria}
              >
                {avatar}
              </Link>
            ) : (
              avatar
            )}
            <Stack gap={0.5} flex={1} minW={0}>
              <HStack gap={2} align="center" flexWrap="wrap">
                {nameBlock}
                {showVerified ? <VerifiedBadge /> : null}
              </HStack>
              {ratingRow}
            </Stack>
          </HStack>
          {priceBlock}
        </HStack>
        <Text fontSize="sm" color="text.default" lineHeight="tall">
          {body}
        </Text>
        {availabilityChip}
        {respondedLabel ? (
          <Text fontSize="xs" color="text.muted" fontWeight={500}>
            {respondedLabel}
          </Text>
        ) : null}
        {actionBlock}
      </Stack>
    )
  }

  return (
    <Stack gap={3}>
      <HStack align="flex-start" gap={3} justify="space-between" w="full">
        <HStack align="flex-start" gap={3} flex={1} minW={0}>
          {workerProfileHref ? (
            <Link
              href={workerProfileHref}
              flexShrink={0}
              _hover={{ textDecoration: 'none' }}
              aria-label={profileAria}
            >
              {avatar}
            </Link>
          ) : (
            avatar
          )}
          <Stack gap={1} flex={1} minW={0}>
            <HStack gap={2} align="center" flexWrap="wrap">
              {nameBlock}
              {showVerified ? <VerifiedBadge /> : null}
            </HStack>
            {displayRating ? ratingRow : null}
          </Stack>
        </HStack>
        <HStack align="flex-start" gap={0} flexShrink={0}>
          {priceBlock}
          <Link
            href={profileHref}
            display="flex"
            alignItems="center"
            alignSelf="center"
            mt={0.5}
            px={1}
            color="text.muted"
            _hover={{ color: 'text.default' }}
            aria-label={profileLinkLabel}
          >
            <LuChevronRight size={22} aria-hidden />
          </Link>
        </HStack>
      </HStack>
      {respondedLabel ? (
        <Box
          as="span"
          display="inline-block"
          w="fit-content"
          px={3}
          py={1}
          borderRadius="full"
          bg="bg.subtle"
          fontSize="xs"
          fontWeight={600}
          color="text.muted"
        >
          {respondedLabel}
        </Box>
      ) : null}
      <Text fontSize="sm" color="text.default" lineHeight="tall">
        {body}
      </Text>
      {availabilityChip}
      {actionBlock}
    </Stack>
  )
}

function VerifiedBadge() {
  const { quotes: q } = useI11n(bag)
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="18px"
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      flexShrink={0}
      aria-label={q.card.verified}
    >
      <LuCheck size={12} strokeWidth={3} aria-hidden />
    </Box>
  )
}

export function QuoteCardAvatar({
  name,
  avatarLabel,
  avatarUrl,
  size = '48px',
}: {
  name: string
  avatarLabel: string
  avatarUrl?: string | null
  size?: string
}) {
  // Broken/forbidden image URLs (e.g. object-storage 403) fall back to
  // initials instead of a blank circle with a broken-image glyph.
  const [imageFailed, setImageFailed] = useState(false)
  const { quotes: q } = useI11n(bag)
  const showImage = Boolean(avatarUrl?.trim()) && !imageFailed

  return (
    <Box
      flexShrink={0}
      boxSize={size}
      borderRadius="full"
      bg={avatarGradient(name + avatarLabel)}
      display="flex"
      alignItems="center"
      justifyContent="center"
      /* TODO(sdl): verify role - white initials on a generated multi-hue avatar gradient, no SDL avatar-text role */
      color="white"
      fontWeight={700}
      fontSize="sm"
      letterSpacing="0.02em"
      overflow="hidden"
    >
      {showImage && avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={formatMessage(q.card.avatarAlt, { name })}
          w="full"
          h="full"
          objectFit="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        avatarLabel.slice(0, 2).toUpperCase()
      )}
    </Box>
  )
}
