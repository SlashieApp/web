import { Box } from '@chakra-ui/react'
import NextLink from 'next/link'

export function PricingPlanDetailsLink({ label }: { label: string }) {
  return (
    <Box textAlign="center">
      <NextLink
        href="#plan-details"
        style={{
          color: 'var(--chakra-colors-text-link)',
          fontWeight: 700,
          fontSize: '0.95rem',
          textDecoration: 'none',
        }}
      >
        {label}
      </NextLink>
    </Box>
  )
}
