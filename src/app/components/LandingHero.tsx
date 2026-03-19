'use client'

import { Badge } from '@/ui/Badge/Badge'
import { Button } from '@/ui/Button/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

export function LandingHero() {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: '1.1fr 0.9fr' }}
      gap={8}
      alignItems="center"
    >
      <Stack gap={5}>
        <Badge alignSelf="flex-start" bg="mustard.200" color="black">
          Local trades, sorted
        </Badge>
        <Heading size={{ base: '2xl', md: '3xl' }}>
          Book trusted local handymen in minutes.
        </Heading>
        <Text color="muted" fontSize="lg">
          Post a job, get offers, and book a vetted handyman. HandyBox keeps
          your job details, messages, and updates in one place.
        </Text>
        <HStack gap={3} flexWrap="wrap">
          <Button
            as={NextLink}
            href="/register"
            background="linkBlue.600"
            color="white"
          >
            Get started
          </Button>
          <Button
            as={NextLink}
            href="/tasks"
            variant="outline"
            borderColor="border"
          >
            Browse tasks
          </Button>
        </HStack>
      </Stack>

      <GlassCard p={6}>
        <Stack gap={4}>
          <Heading size="md">Need a hand with something?</Heading>
          <Text color="muted">
            Use the dedicated task page to add full job details, timing, and
            budget preferences.
          </Text>
          <Button
            as={NextLink}
            href="/tasks/create"
            background="mustard.500"
            color="black"
          >
            Create a task
          </Button>
        </Stack>
      </GlassCard>
    </Grid>
  )
}
