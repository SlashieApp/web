import { Box, HStack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

function ShieldIcon() {
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="40px"
      borderRadius="full"
      bg="primary.100"
      color="primary.700"
      flexShrink={0}
      aria-hidden
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>Shield</title>
        <path
          d="M12 3 20 6v6c0 4.4-3.2 8.5-8 9-4.8-.5-8-4.6-8-9V6l8-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export function PricingDisclaimer() {
  return (
    <Box
      borderWidth="1px"
      borderColor="cardBorder"
      borderRadius="2xl"
      bg="cardBg"
      px={{ base: 4, md: 5 }}
      py={4}
    >
      <HStack gap={4} align="flex-start">
        <ShieldIcon />
        <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
          Job payments are arranged directly between customers and workers.
          Slashie subscription is for platform access only.{' '}
          <NextLink
            href="/terms"
            style={{
              color: 'var(--chakra-colors-primary-700)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Terms apply.
          </NextLink>
        </Text>
      </HStack>
    </Box>
  )
}
