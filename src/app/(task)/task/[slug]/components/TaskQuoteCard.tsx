'use client'

import { Box, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Badge, Button } from '@ui'

export type TaskQuoteCardProps = {
  name: string
  avatarLabel: string
  avatarUrl?: string | null
  priceLabel: string
  message?: string | null
  ratingSummary?: string | null
  trustBadge?: 'pro' | 'verified'
  /** Owner task page: prominent quote amount and layout. */
  ownerQuoteEmphasis?: boolean
  acceptPrimary?: boolean
  messageHref?: string
  isOwnQuote?: boolean
  onAccept?: () => void
  acceptLoading?: boolean
  acceptDisabled?: boolean
}

function avatarGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1)
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${(hue + 40) % 360} 60% 36%) 100%)`
}

export function TaskQuoteCard({
  name,
  avatarLabel,
  avatarUrl,
  priceLabel,
  message,
  ratingSummary,
  trustBadge,
  ownerQuoteEmphasis = false,
  acceptPrimary = false,
  messageHref,
  isOwnQuote = false,
  onAccept,
  acceptLoading = false,
  acceptDisabled = false,
}: TaskQuoteCardProps) {
  const snippet =
    message && message.trim().length > 0
      ? message.length > 140
        ? `${message.slice(0, 137).trim()}…`
        : message
      : 'No message provided with this quote.'

  const priceBlock = ownerQuoteEmphasis ? (
    <Stack align="flex-end" gap={0} flexShrink={0} textAlign="right">
      <Text
        fontSize="10px"
        fontWeight={800}
        color="formLabelMuted"
        letterSpacing="0.12em"
      >
        QUOTE
      </Text>
      <Text fontWeight={800} fontSize="xl" color="secondary.700">
        {priceLabel}
      </Text>
    </Stack>
  ) : (
    <Text fontWeight={800} fontSize="lg" color="cardFg" flexShrink={0}>
      {priceLabel}
    </Text>
  )

  const showActions = Boolean(messageHref || isOwnQuote || onAccept)

  return (
    <Stack
      gap={3}
      p={4}
      borderRadius="xl"
      bg="neutral.100"
      borderWidth="1px"
      borderColor="cardBorder"
      boxShadow="ghostBorder"
    >
      <HStack align="flex-start" gap={3} justify="space-between">
        <HStack align="flex-start" gap={3} flex={1} minW={0}>
          <Box
            flexShrink={0}
            boxSize="52px"
            borderRadius="lg"
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
          <Stack gap={1} flex={1} minW={0}>
            <HStack gap={2} flexWrap="wrap" align="center">
              <Heading size="sm" lineHeight="short">
                {name}
              </Heading>
              {trustBadge === 'pro' ? (
                <Badge
                  px={2}
                  py={0.5}
                  fontSize="10px"
                  bg="primary.100"
                  color="primary.700"
                >
                  PRO
                </Badge>
              ) : null}
              {trustBadge === 'verified' ? (
                <Badge
                  px={2}
                  py={0.5}
                  fontSize="10px"
                  bg="primary.600"
                  color="white"
                  fontWeight={700}
                >
                  VERIFIED
                </Badge>
              ) : null}
            </HStack>
            {ratingSummary ? (
              <Text fontSize="sm" color="secondary.600" fontWeight={600}>
                ★ {ratingSummary}
              </Text>
            ) : null}
          </Stack>
        </HStack>
        {priceBlock}
      </HStack>
      <Text
        fontSize="sm"
        color="formLabelMuted"
        fontStyle="italic"
        lineHeight="tall"
      >
        "{snippet}"
      </Text>
      {showActions ? (
        <HStack gap={2} flexWrap="wrap">
          {messageHref ? (
            <NextLink href={messageHref} passHref legacyBehavior>
              <Button
                as="a"
                size="sm"
                variant="secondary"
                borderColor="primary.200"
                color="primary.700"
                bg="primary.50"
                px={4}
                flex={1}
                minW="120px"
              >
                Message
              </Button>
            </NextLink>
          ) : null}
          {isOwnQuote ? (
            <Button
              size="sm"
              variant="secondary"
              borderColor="cardBorder"
              color="formLabelMuted"
              flex={1}
              minW="120px"
              disabled
            >
              Your quote
            </Button>
          ) : onAccept ? (
            <Button
              size="sm"
              px={4}
              flex={1}
              minW="120px"
              loading={acceptLoading}
              disabled={acceptDisabled}
              onClick={onAccept}
              {...(acceptPrimary
                ? {}
                : {
                    variant: 'outline' as const,
                    borderColor: 'primary.200',
                    color: 'primary.700',
                    bg: 'primary.50',
                  })}
            >
              Accept quote
            </Button>
          ) : null}
        </HStack>
      ) : null}
    </Stack>
  )
}
