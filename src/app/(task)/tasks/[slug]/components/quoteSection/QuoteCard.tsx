'use client'

import {
  Box,
  HStack,
  Heading,
  Image,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { LuCheck, LuChevronRight } from 'react-icons/lu'

import { Button } from '@ui'

function avatarGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1)
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${(hue + 40) % 360} 60% 36%) 100%)`
}

export type QuoteCardProps = {
  name: string
  avatarLabel: string
  avatarUrl?: string | null
  /** Shown in the price column when `showPrice` is true. */
  priceLabel: string
  priceKindLabel?: string | null
  message?: string | null
  respondedLabel?: string | null
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

export function QuoteCard({
  name,
  avatarLabel,
  avatarUrl,
  priceLabel,
  priceKindLabel,
  message,
  respondedLabel,
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
  const profileHref = workerProfileHref ?? detailHref ?? '/quotes'
  const profileLinkLabel = workerProfileHref ? 'View profile' : 'Messages'
  const body =
    message && message.trim().length > 0
      ? message.length > 220
        ? `${message.slice(0, 217).trim()}…`
        : message
      : 'No message provided with this quote.'

  const isCard = variant === 'card'

  return (
    <Stack
      gap={3}
      {...(isCard
        ? {
            p: 4,
            borderRadius: 'xl',
            bg: 'cardBg',
            borderWidth: '1px',
            borderColor: 'cardBorder',
          }
        : {})}
    >
      <HStack align="flex-start" gap={3} justify="space-between" w="full">
        <HStack align="flex-start" gap={3} flex={1} minW={0}>
          {workerProfileHref ? (
            <Link
              as={NextLink}
              href={workerProfileHref}
              flexShrink={0}
              _hover={{ textDecoration: 'none' }}
              aria-label={`View profile for ${name}`}
            >
              <QuoteCardAvatar
                name={name}
                avatarLabel={avatarLabel}
                avatarUrl={avatarUrl}
              />
            </Link>
          ) : (
            <QuoteCardAvatar
              name={name}
              avatarLabel={avatarLabel}
              avatarUrl={avatarUrl}
            />
          )}
          <Stack gap={1} flex={1} minW={0}>
            <HStack gap={2} align="center" flexWrap="wrap">
              {workerProfileHref ? (
                <Link
                  as={NextLink}
                  href={workerProfileHref}
                  _hover={{ textDecoration: 'none', color: 'primary.700' }}
                >
                  <Heading size="sm" lineHeight="short">
                    {name}
                  </Heading>
                </Link>
              ) : (
                <Heading size="sm" lineHeight="short">
                  {name}
                </Heading>
              )}
              {showVerified ? (
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="18px"
                  borderRadius="full"
                  bg="primary.600"
                  color="white"
                  flexShrink={0}
                  aria-label="Verified on Slashie"
                >
                  <LuCheck size={12} strokeWidth={3} aria-hidden />
                </Box>
              ) : null}
            </HStack>
            {ratingLine ? (
              <HStack
                gap={1}
                fontSize="sm"
                color="formLabelMuted"
                fontWeight={500}
              >
                <Text as="span" color="secondary.600" aria-hidden>
                  ★
                </Text>
                <Text as="span">{ratingLine}</Text>
              </HStack>
            ) : null}
          </Stack>
        </HStack>
        <HStack align="flex-start" gap={0} flexShrink={0}>
          {showPrice ? (
            <Stack align="flex-end" gap={0} textAlign="right" minW="4rem">
              <Text
                fontWeight={800}
                fontSize="xl"
                color="primary.600"
                lineHeight="shorter"
              >
                {priceLabel}
              </Text>
              {priceKindLabel ? (
                <Text fontSize="xs" color="formLabelMuted">
                  {priceKindLabel}
                </Text>
              ) : null}
            </Stack>
          ) : null}
          <Link
            as={NextLink}
            href={profileHref}
            display="flex"
            alignItems="center"
            alignSelf="center"
            mt={0.5}
            px={1}
            color="formLabelMuted"
            _hover={{ color: 'cardFg' }}
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
          bg="neutral.100"
          fontSize="xs"
          fontWeight={600}
          color="formLabelMuted"
        >
          {respondedLabel}
        </Box>
      ) : null}
      <Text fontSize="sm" color="cardFg" lineHeight="tall">
        {body}
      </Text>
      {isOwnQuote ? (
        <Button size="sm" variant="secondary" disabled w="full">
          Your quote
        </Button>
      ) : onAccept || onDecline ? (
        <Stack gap={2} w="full">
          {onAccept ? (
            <Button
              size="sm"
              w="full"
              loading={acceptLoading}
              disabled={acceptDisabled || declineLoading}
              onClick={onAccept}
              variant={acceptPrimary ? 'primary' : 'outline'}
              {...(acceptPrimary
                ? {}
                : {
                    borderColor: 'primary.300',
                    color: 'primary.700',
                  })}
            >
              Accept quote
            </Button>
          ) : null}
          {onDecline ? (
            <Button
              size="sm"
              w="full"
              variant="ghost"
              color="red.600"
              loading={declineLoading}
              disabled={acceptLoading || acceptDisabled}
              onClick={onDecline}
            >
              Decline
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  )
}

function QuoteCardAvatar({
  name,
  avatarLabel,
  avatarUrl,
}: {
  name: string
  avatarLabel: string
  avatarUrl?: string | null
}) {
  return (
    <Box
      flexShrink={0}
      boxSize="48px"
      borderRadius="full"
      bg={avatarGradient(name + avatarLabel)}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight={800}
      fontSize="sm"
      letterSpacing="0.02em"
      overflow="hidden"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${name} avatar`}
          w="full"
          h="full"
          objectFit="cover"
        />
      ) : (
        avatarLabel.slice(0, 2).toUpperCase()
      )}
    </Box>
  )
}
