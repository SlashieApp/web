'use client'

import { Box, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'

import { GlassCard } from '../Card/GlassCard'

const highlights = [
  {
    title: 'Post in minutes',
    body: 'Share a small job with photos, location, and timing.',
  },
  {
    title: 'Get clear offers',
    body: 'Workers reply with availability and upfront pricing.',
  },
  {
    title: 'Book with confidence',
    body: 'Pick the best fit and keep everything in one thread.',
  },
]

export function LandingHighlights() {
  return (
    <Box id="highlights">
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        {highlights.map((card) => (
          <GlassCard key={card.title} p={5}>
            <Stack gap={2}>
              <Heading size="sm">{card.title}</Heading>
              <Text color="muted">{card.body}</Text>
            </Stack>
          </GlassCard>
        ))}
      </SimpleGrid>
    </Box>
  )
}
