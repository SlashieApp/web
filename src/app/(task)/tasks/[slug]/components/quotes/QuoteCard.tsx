'use client'

import { Box, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'
import {
  LuCalendar,
  LuCheck,
  LuClock,
  LuMapPin,
  LuMessageCircle,
} from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Link, Rating } from '@ui'

import bag from '../../i11n.json'

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
  /** Availability line, e.g. "Available tomorrow". */
  availabilityLabel?: string | null
  /** Duration line, e.g. "2–3 hrs est." */
  durationLabel?: string | null
  distanceLabel?: string | null
  /** Status badge under the price: Accepted / Declined / Your quote. */
  statusBadge?: QuoteCardStatusBadge | null
  showVerified?: boolean
  showBackgroundChecked?: boolean
  /** Recommended / first-sort highlight. */
  isBestMatch?: boolean
  ratingLine?: string | null
  /** When false, price column is hidden (visitors — API omits amounts). */
  showPrice?: boolean
  isOwnQuote?: boolean
  onAccept?: () => void
  onDecline?: () => void
  acceptLoading?: boolean
  declineLoading?: boolean
  acceptDisabled?: boolean
  messageHref?: string
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
  durationLabel,
  distanceLabel,
  statusBadge,
  showVerified = false,
  showBackgroundChecked = false,
  isBestMatch = false,
  ratingLine,
  showPrice = true,
  isOwnQuote = false,
  onAccept,
  onDecline,
  acceptLoading = false,
  declineLoading = false,
  acceptDisabled = false,
  messageHref,
  detailHref,
  workerProfileHref,
}: QuoteCardProps) {
  const { quotes: q } = useI11n(bag)
  const card = q.card

  const profileAria = formatMessage(card.viewProfileFor, { name })
  const displayRating = ratingLine === undefined ? card.noReviews : ratingLine
  const quotedMessage =
    message && message.trim().length > 0
      ? message.length > 280
        ? `${message.slice(0, 277).trim()}…`
        : message
      : null

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
      size="56px"
    />
  )

  const nameBlock = workerProfileHref ? (
    <Link
      href={workerProfileHref}
      _hover={{ textDecoration: 'none', color: 'text.link' }}
    >
      <Heading size="md" lineHeight="short" fontWeight={700}>
        {name}
      </Heading>
    </Link>
  ) : (
    <Heading size="md" lineHeight="short" fontWeight={700}>
      {name}
    </Heading>
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

  const hasActions = Boolean(onAccept || onDecline || messageHref || isOwnQuote)

  return (
    <Card layout="default" maxW="full" p={{ base: 4, lg: 5 }} w="full">
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 5, lg: 8 }}
        align={{ base: 'stretch', lg: 'center' }}
        w="full"
      >
        <Stack flex="1.3" minW={0} gap={3}>
          {isBestMatch ? (
            <Box
              as="span"
              alignSelf="flex-start"
              px={2.5}
              py={0.5}
              borderRadius="full"
              bg="status.success.soft"
              color="status.success.fg"
              fontSize="xs"
              fontWeight={700}
            >
              {card.bestMatch}
            </Box>
          ) : null}
          <HStack align="flex-start" gap={3} minW={0}>
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
            <Stack gap={1} minW={0} flex={1}>
              {nameBlock}
              {displayRating ? (
                <Rating
                  value={displayRating}
                  size="sm"
                  label={card.ratingAria}
                />
              ) : null}
              {distanceLabel ? (
                <HStack gap={1.5} color="text.muted" fontSize="sm">
                  <LuMapPin size={14} aria-hidden />
                  <Text>{distanceLabel}</Text>
                </HStack>
              ) : null}
            </Stack>
          </HStack>
          {quotedMessage ? (
            <Text
              fontSize="sm"
              color="text.muted"
              lineHeight="tall"
              fontStyle="italic"
            >
              “{quotedMessage}”
            </Text>
          ) : (
            <Text fontSize="sm" color="text.subtle" lineHeight="tall">
              {card.noMessage}
            </Text>
          )}
          {respondedLabel ? (
            <Text fontSize="xs" color="text.subtle" fontWeight={500}>
              {respondedLabel}
            </Text>
          ) : null}
        </Stack>

        <Stack flex="1" minW={{ lg: '200px' }} gap={2.5}>
          {(showPrice && priceLabel) || statusBadgeEl ? (
            <HStack align="baseline" gap={2} flexWrap="wrap">
              {showPrice && priceLabel ? (
                <Text
                  fontWeight={800}
                  fontSize={{ base: '3xl', lg: '4xl' }}
                  color="text.default"
                  lineHeight="1"
                >
                  {priceLabel}
                </Text>
              ) : null}
              {showPrice && (priceKindLabel || card.fixedPrice) ? (
                <Text fontSize="sm" color="text.muted" fontWeight={500}>
                  {priceKindLabel || card.fixedPrice}
                </Text>
              ) : null}
              {statusBadgeEl}
            </HStack>
          ) : null}
          {availabilityLabel ? (
            <MetaLine icon={<LuCalendar size={16} />}>
              {availabilityLabel}
            </MetaLine>
          ) : null}
          {durationLabel ? (
            <MetaLine icon={<LuClock size={16} />}>{durationLabel}</MetaLine>
          ) : null}
          {showVerified ? (
            <MetaLine icon={<LuCheck size={16} />} tone="success">
              {card.insuredVerified}
            </MetaLine>
          ) : null}
          {showBackgroundChecked ? (
            <MetaLine icon={<LuCheck size={16} />} tone="success">
              {card.backgroundChecked}
            </MetaLine>
          ) : null}
        </Stack>

        {hasActions ? (
          <Stack
            flexShrink={0}
            w={{ base: 'full', lg: '200px' }}
            gap={2}
            justify="center"
          >
            {isOwnQuote ? (
              <Button
                size="lg"
                variant="secondary"
                disabled
                w="full"
                borderRadius="full"
              >
                {card.yours}
              </Button>
            ) : onAccept ? (
              <Button
                size="lg"
                w="full"
                loading={acceptLoading}
                disabled={acceptDisabled || declineLoading}
                onClick={onAccept}
                variant="primary"
                borderRadius="full"
              >
                {card.acceptQuote}
              </Button>
            ) : null}
            {messageHref ? (
              <Button
                asChild
                size="lg"
                variant="secondary"
                w="full"
                borderRadius="full"
              >
                <Link href={messageHref} _hover={{ textDecoration: 'none' }}>
                  <HStack gap={2} justify="center">
                    <LuMessageCircle size={18} aria-hidden />
                    <Text as="span">{card.message}</Text>
                  </HStack>
                </Link>
              </Button>
            ) : detailHref ? (
              <Button
                asChild
                size="lg"
                variant="secondary"
                w="full"
                borderRadius="full"
              >
                <Link href={detailHref} _hover={{ textDecoration: 'none' }}>
                  {card.viewProfile}
                </Link>
              </Button>
            ) : null}
            {onDecline && !isOwnQuote ? (
              <Button
                size="sm"
                variant="ghost"
                w="full"
                loading={declineLoading}
                disabled={acceptLoading || acceptDisabled}
                onClick={onDecline}
              >
                {card.decline}
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}

function MetaLine({
  icon,
  children,
  tone = 'muted',
}: {
  icon: ReactNode
  children: ReactNode
  tone?: 'muted' | 'success'
}) {
  return (
    <HStack
      gap={2}
      align="center"
      color={tone === 'success' ? 'text.default' : 'text.muted'}
      fontSize="sm"
    >
      <Box
        as="span"
        color={tone === 'success' ? 'status.success.fg' : 'text.muted'}
        display="inline-flex"
        aria-hidden
      >
        {icon}
      </Box>
      <Text fontWeight={tone === 'success' ? 600 : 500}>{children}</Text>
    </HStack>
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
