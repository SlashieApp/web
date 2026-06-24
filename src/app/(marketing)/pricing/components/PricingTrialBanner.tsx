import { Box, HStack, Text } from '@chakra-ui/react'

import { Badge } from '@ui'

import type { PricingRecord } from '../helpers/getPricingForPage'

type PricingTrialBannerProps = {
  pricing: PricingRecord
}

function GiftIcon() {
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="36px"
      borderRadius="full"
      bg="status.success.soft"
      color="status.success.fg"
      flexShrink={0}
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Gift</title>
        <path
          d="M20 12v8H4v-8M12 22V12M12 12H7.5a2.5 2.5 0 1 1 0-5C11 7 12 12 12 12Zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 7 12 12 12 12ZM4 7h16v5H4V7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function trialBannerCopy(trialLabel: string | null | undefined): string {
  const label = trialLabel?.trim()
  if (!label) return 'Try Slashie Unlimited free. Cancel anytime.'
  const normalized = label.replace(/\btrial\b/i, '').trim()
  return `Try Slashie Unlimited ${normalized.toLowerCase()}. Cancel anytime.`
}

function trialBadgeLabel(trialLabel: string | null | undefined): string {
  const label = trialLabel?.trim()
  if (!label) return 'FREE TRIAL'
  return label.toUpperCase()
}

export function PricingTrialBanner({ pricing }: PricingTrialBannerProps) {
  const trialLabel = pricing.trialLabel?.trim()
  if (!trialLabel && !pricing.trialDays) return null

  return (
    <Box
      borderWidth="1px"
      /* TODO(sdl): green accent border mapped to border.focus */
      borderColor="border.focus"
      borderRadius="2xl"
      bg="status.success.soft"
      px={{ base: 4, md: 5 }}
      py={4}
    >
      <HStack
        gap={4}
        align={{ base: 'flex-start', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <HStack gap={3} align="center" flex={1}>
          <GiftIcon />
          <Text
            fontSize="sm"
            fontWeight={600}
            color="text.default"
            lineHeight="tall"
          >
            {trialBannerCopy(trialLabel)}
          </Text>
        </HStack>
        <Badge
          bg="status.success.soft"
          color="status.success.fg"
          borderWidth="1px"
          /* TODO(sdl): green accent border mapped to border.focus */
          borderColor="border.focus"
          borderRadius="full"
          px={3}
          py={1}
          fontSize="2xs"
          fontWeight={800}
          letterSpacing="0.08em"
          flexShrink={0}
        >
          {trialBadgeLabel(trialLabel)}
        </Badge>
      </HStack>
    </Box>
  )
}
