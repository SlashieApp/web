'use client'

import { Box, SimpleGrid, Stack } from '@chakra-ui/react'

import { GlassCard, Heading, Text } from '@ui'

const steps = [
  {
    icon: '📝',
    title: 'Post your task',
    body: 'Describe what needs to be done. Add photos and your budget range in seconds.',
  },
  {
    icon: '📨',
    title: 'Receive offers',
    body: 'Compare profiles, reviews, and quotes from qualified local professionals.',
  },
  {
    icon: '✅',
    title: 'Get it done',
    body: 'Book your preferred pro, pay securely through the app, and leave a review.',
  },
] as const

export function HomeHowItWorksSection() {
  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading size="2xl">How it works</Heading>
        <Text color="muted" maxW="2xl">
          Simplified maintenance for busy lives. From leak to fix in three easy
          steps.
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        {steps.map((step) => (
          <GlassCard key={step.title} p={6} bg="surfaceContainerLowest">
            <Stack gap={3}>
              <Box
                w="42px"
                h="42px"
                borderRadius="lg"
                bg="surfaceContainerLow"
                display="grid"
                placeItems="center"
                fontSize="lg"
              >
                {step.icon}
              </Box>
              <Heading size="md">{step.title}</Heading>
              <Text color="muted" fontSize="sm">
                {step.body}
              </Text>
            </Stack>
          </GlassCard>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
