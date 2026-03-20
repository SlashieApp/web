'use client'

import { Box, Stack } from '@chakra-ui/react'

import { TaskBoard } from '@/app/components'
import { Header, Heading, Section, SiteFooter, SiteHeader, Text } from '@ui'

export default function TasksPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header>
            <SiteHeader activeItem="my-jobs" />
          </Header>
        </Section>
        <Section bg="surfaceContainerLow">
          <Stack gap={10}>
            <Stack gap={3}>
              <Heading size="xl" letterSpacing="-0.02em">
                Browse local jobs
              </Heading>
              <Text color="muted">
                Browse the latest jobs posted by local homeowners and
                businesses.
              </Text>
            </Stack>
            <TaskBoard title="Latest tasks" />
          </Stack>
        </Section>
        <SiteFooter />
      </Stack>
    </Box>
  )
}
