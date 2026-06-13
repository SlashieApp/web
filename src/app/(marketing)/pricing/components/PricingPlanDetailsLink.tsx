import { Box, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

export function PricingPlanDetailsLink() {
  return (
    <Box textAlign="center">
      <NextLink
        href="#plan-details"
        style={{
          color: 'var(--chakra-colors-primary-700)',
          fontWeight: 700,
          fontSize: '0.95rem',
          textDecoration: 'none',
        }}
      >
        See all plan details &gt;
      </NextLink>
    </Box>
  )
}
