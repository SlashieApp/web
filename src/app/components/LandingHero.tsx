'use client'

import { Grid, HStack, Stack } from '@chakra-ui/react'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'
import NextLink from 'next/link'

export function LandingHero() {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: '1.2fr 0.8fr' }}
      gap={8}
      alignItems="center"
    >
      <Stack gap={5} pl={{ base: 0, md: 6 }}>
        <Badge alignSelf="flex-start">Local trades, sorted</Badge>
        <Heading
          size={{ base: '2xl', md: '4xl' }}
          letterSpacing="-0.02em"
          lineHeight={1.1}
        >
          Book trusted local handymen in minutes.
        </Heading>
        <Text color="muted" fontSize="lg">
          Post a job, get offers, and book a vetted handyman. HandyBox keeps
          your job details, messages, and updates in one place.
        </Text>
        <HStack gap={3} flexWrap="wrap">
          <Button as={NextLink} href="/register" size="lg">
            Get started
          </Button>
          <Button
            as={NextLink}
            href="/tasks"
            variant="subtle"
            bg="surfaceContainerLow"
          >
            Browse tasks
          </Button>
        </HStack>
      </Stack>

      <GlassCard p={6} bg="surfaceContainerLow">
        <Stack gap={4}>
          <Heading size="md">Need a hand with something?</Heading>
          <Text color="muted">
            Use the dedicated task page to add full job details, timing, and
            budget preferences.
          </Text>
          <Button as={NextLink} href="/tasks/create" variant="tool">
            Create a task
          </Button>
        </Stack>
      </GlassCard>
    </Grid>
  )
}
