'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'

import { LandingFooter, LandingHeader, TaskBoard } from '@/app/components'
import { Container } from '@ui'

function Section({
  id,
  children,
  py = { base: 8, md: 12 },
  ...props
}: {
  id?: string
  children: React.ReactNode
  py?: { base: number; md: number }
} & React.ComponentProps<typeof Box>) {
  return (
    <Box as="section" id={id} py={py} {...props}>
      <Container>{children}</Container>
    </Box>
  )
}

export default function TasksPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <LandingHeader />
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
        <Section id="footer" py={{ base: 8, md: 12 }} pb={{ base: 12, md: 16 }}>
          <LandingFooter />
        </Section>
      </Stack>
    </Box>
  )
}
