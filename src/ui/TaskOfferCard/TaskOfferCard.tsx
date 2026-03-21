'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Badge } from '../Badge'
import { Button } from '../Button'
import { Heading, Text } from '../Typography'

export type TaskOfferCardProps = {
  name: string
  avatarLabel: string
  priceLabel: string
  message?: string | null
  ratingSummary?: string | null
  trustBadge?: 'pro' | 'verified'
  acceptPrimary?: boolean
  messageHref: string
  isOwnOffer?: boolean
  onAccept?: () => void
  acceptLoading?: boolean
  acceptDisabled?: boolean
}

function avatarGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${(hue + 40) % 360} 60% 36%) 100%)`
}

export function TaskOfferCard({
  name,
  avatarLabel,
  priceLabel,
  message,
  ratingSummary,
  trustBadge,
  acceptPrimary = false,
  messageHref,
  isOwnOffer = false,
  onAccept,
  acceptLoading = false,
  acceptDisabled = false,
}: TaskOfferCardProps) {
  const snippet =
    message && message.trim().length > 0
      ? message.length > 140
        ? `${message.slice(0, 137).trim()}…`
        : message
      : 'No message provided with this quote.'

  return (
    <Stack
      gap={3}
      p={4}
      borderRadius="xl"
      bg="surfaceContainerLowest"
      borderWidth="1px"
      borderColor="border"
      boxShadow="ghostBorder"
    >
      <HStack align="flex-start" gap={3}>
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
        >
          {avatarLabel.slice(0, 2).toUpperCase()}
        </Box>
        <Stack gap={1} flex={1} minW={0}>
          <HStack justify="space-between" align="flex-start" gap={2}>
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
                <Text fontSize="xs" fontWeight={600} color="primary.600">
                  ✓ Verified
                </Text>
              ) : null}
            </HStack>
            <Text fontWeight={800} fontSize="lg" color="fg" flexShrink={0}>
              {priceLabel}
            </Text>
          </HStack>
          {ratingSummary ? (
            <Text fontSize="sm" color="secondary.500" fontWeight={600}>
              ★ {ratingSummary}
            </Text>
          ) : null}
        </Stack>
      </HStack>
      <Text fontSize="sm" color="muted" fontStyle="italic" lineHeight="tall">
        “{snippet}”
      </Text>
      <HStack gap={2} flexWrap="wrap">
        <Button
          as={NextLink}
          href={messageHref}
          size="sm"
          variant="outline"
          borderColor="primary.200"
          color="primary.700"
          bg="primary.50"
          px={4}
          flex={1}
          minW="120px"
        >
          Message
        </Button>
        {isOwnOffer ? (
          <Button
            size="sm"
            variant="outline"
            borderColor="border"
            color="muted"
            flex={1}
            minW="120px"
            disabled
          >
            Your offer
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
            Accept offer
          </Button>
        ) : null}
      </HStack>
    </Stack>
  )
}
