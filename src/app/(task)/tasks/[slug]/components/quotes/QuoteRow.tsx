'use client'

import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LuBadgeCheck, LuMessageCircle } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Avatar, Badge, Button, IconButton, Link } from '@ui'

import bag from '../../i11n.json'

export type QuoteRowStatus = 'accepted' | 'declined' | 'notSelected'

export type QuoteRowProps = {
  name: string
  /**
   * Another worker's quote seen by anyone but the owner (FE-370): a plain
   * placeholder avatar, and never a photo, profile link or verified mark.
   */
  anonymous?: boolean
  /** Initials for the avatar when there is no photo. */
  avatarLabel?: string
  avatarUrl?: string | null
  workerProfileHref?: string
  /** The quoted amount. Every quote has one; nothing shows if it's missing. */
  priceLabel?: string | null
  message?: string | null
  availabilityLabel?: string | null
  respondedLabel?: string | null
  showVerified?: boolean
  status?: QuoteRowStatus | null
  isBestMatch?: boolean
  onAccept?: () => void
  onDecline?: () => void
  acceptLoading?: boolean
  declineLoading?: boolean
  messageHref?: string
  withDivider?: boolean
}

const STATUS_VARIANT = {
  accepted: 'success',
  declined: 'neutral',
  notSelected: 'neutral',
} as const

/**
 * One quote as a list row (FE-258): avatar, name and times on the left,
 * price on the right, the message under it, and owner actions last.
 */
export function QuoteRow({
  name,
  anonymous = false,
  avatarLabel = '',
  avatarUrl,
  workerProfileHref,
  priceLabel,
  message,
  availabilityLabel,
  respondedLabel,
  showVerified = false,
  status,
  isBestMatch = false,
  onAccept,
  onDecline,
  acceptLoading = false,
  declineLoading = false,
  messageHref,
  withDivider = true,
}: QuoteRowProps) {
  const { quotes: q } = useI11n(bag)
  const card = q.card
  const statusLabel = status
    ? {
        accepted: card.accepted,
        declined: card.declined,
        notSelected: card.notSelected,
      }[status]
    : null
  const meta = [availabilityLabel, respondedLabel].filter(Boolean).join(' · ')
  // Never who sent another worker's quote, whatever is passed in.
  const profileHref = anonymous ? undefined : workerProfileHref
  const verified = !anonymous && showVerified
  const avatar = anonymous ? (
    <Avatar name={name} size="lg" fallback="icon" />
  ) : (
    <QuoteAvatar
      name={name}
      avatarLabel={avatarLabel}
      avatarUrl={avatarUrl}
      size="40px"
    />
  )
  const busy = acceptLoading || declineLoading

  return (
    <Stack
      gap={2}
      py={4}
      borderBottomWidth={withDivider ? '1px' : 0}
      borderColor="border.default"
    >
      <HStack align="flex-start" gap={3}>
        {profileHref ? (
          <Link
            href={profileHref}
            aria-label={formatMessage(card.viewProfileFor, { name })}
            flexShrink={0}
            borderRadius="full"
            _hover={{ textDecoration: 'none' }}
          >
            {avatar}
          </Link>
        ) : (
          avatar
        )}
        <Stack gap={0.5} flex={1} minW={0}>
          <HStack gap={1.5} flexWrap="wrap" align="center">
            {profileHref ? (
              <Link
                href={profileHref}
                fontWeight={600}
                color="text.default"
                truncate
              >
                {name}
              </Link>
            ) : (
              <Text fontWeight={600} color="text.default" truncate>
                {name}
              </Text>
            )}
            {verified ? (
              <HStack
                as="span"
                gap={0}
                color="status.success.fg"
                aria-label={card.verified}
                title={card.verified}
              >
                <LuBadgeCheck size={16} aria-hidden />
              </HStack>
            ) : null}
            {isBestMatch ? (
              <Badge variant="success" size="sm" shape="pill">
                {card.bestMatch}
              </Badge>
            ) : null}
            {statusLabel && status ? (
              <Badge variant={STATUS_VARIANT[status]} size="sm" shape="pill">
                {statusLabel}
              </Badge>
            ) : null}
          </HStack>
          {meta ? (
            <Text fontSize="xs" color="text.muted">
              {meta}
            </Text>
          ) : null}
        </Stack>
        {priceLabel ? (
          <Text
            flexShrink={0}
            fontWeight={700}
            fontSize="lg"
            lineHeight="short"
            color="text.default"
            fontVariantNumeric="tabular-nums"
          >
            {priceLabel}
          </Text>
        ) : null}
      </HStack>
      {message ? (
        <Text
          fontSize="sm"
          color="text.muted"
          lineHeight="tall"
          lineClamp={2}
          pl={{ base: 0, sm: '52px' }}
        >
          {message}
        </Text>
      ) : null}
      {onAccept || onDecline || messageHref ? (
        <HStack gap={2} justify="flex-end">
          {messageHref ? (
            <IconButton asChild aria-label={card.message} variant="ghost">
              <Link href={messageHref}>
                <LuMessageCircle size={18} aria-hidden />
              </Link>
            </IconButton>
          ) : null}
          {onDecline ? (
            <Button
              variant="ghost"
              loading={declineLoading}
              disabled={busy}
              onClick={onDecline}
            >
              {card.decline}
            </Button>
          ) : null}
          {onAccept ? (
            <Button
              variant="primary"
              loading={acceptLoading}
              disabled={busy}
              onClick={onAccept}
            >
              {card.accept}
            </Button>
          ) : null}
        </HStack>
      ) : null}
    </Stack>
  )
}

function avatarGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1)
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${(hue + 40) % 360} 60% 36%) 100%)`
}

/** Photo, or initials on a name-seeded gradient when there is none. */
function QuoteAvatar({
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
