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
      bg="status.success.soft"
      color="status.success.fg"
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

export function PricingDisclaimer({
  copy,
  termsHref,
}: {
  copy: { body: string; terms: string }
  termsHref: string
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="2xl"
      bg="bg.surface"
      px={{ base: 4, md: 5 }}
      py={4}
    >
      <HStack gap={4} align="flex-start">
        <ShieldIcon />
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {copy.body}{' '}
          <NextLink
            href={termsHref}
            style={{
              color: 'var(--chakra-colors-text-link)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {copy.terms}
          </NextLink>
        </Text>
      </HStack>
    </Box>
  )
}
