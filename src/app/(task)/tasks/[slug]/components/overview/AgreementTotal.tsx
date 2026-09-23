'use client'

import { Box } from '@chakra-ui/react'

/**
 * Invoice figure for a Booking or Order card. Rendered inside Card `metric`,
 * which wraps children in a text node — these spans override that size.
 */
export function AgreementTotal({
  label,
  amount,
}: {
  label: string
  amount: string
}) {
  return (
    <Box as="span" display="block">
      <Box
        as="span"
        display="block"
        fontSize="xs"
        fontWeight={500}
        color="text.muted"
        letterSpacing="0.06em"
        textTransform="uppercase"
        lineHeight="short"
      >
        {label}
      </Box>
      <Box
        as="span"
        display="block"
        mt={1}
        fontSize="2xl"
        fontWeight={700}
        color="text.default"
        lineHeight="short"
      >
        {amount}
      </Box>
    </Box>
  )
}
