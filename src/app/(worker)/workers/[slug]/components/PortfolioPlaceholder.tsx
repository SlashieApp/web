'use client'

import { Box, Grid, Text } from '@chakra-ui/react'

import { Card } from '@ui'

export function PortfolioPlaceholder() {
  return (
    <Card layout="section" eyebrow="Portfolio" heading="Work examples">
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
            bg="bg.subtle"
            color="text.muted"
            fontSize="sm"
            fontWeight={600}
          >
            Photos coming soon
          </Box>
        ))}
      </Grid>
      <Text fontSize="sm" color="text.muted">
        Workers will be able to showcase completed work here in a future update.
      </Text>
    </Card>
  )
}
