'use client'

import { Box, Grid, Text } from '@chakra-ui/react'

import { SectionCard } from '@ui'

export function PortfolioPlaceholder() {
  return (
    <SectionCard eyebrow="Portfolio" heading="Work examples">
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        gap={3}
        w="full"
      >
        {[1, 2, 3].map((slot) => (
          <Box
            key={slot}
            display="grid"
            placeItems="center"
            minH="120px"
            borderRadius="lg"
            bg="neutral.100"
            color="formLabelMuted"
            fontSize="sm"
            fontWeight={600}
          >
            Photos coming soon
          </Box>
        ))}
      </Grid>
      <Text fontSize="sm" color="formLabelMuted">
        Workers will be able to showcase completed work here in a future update.
      </Text>
    </SectionCard>
  )
}
