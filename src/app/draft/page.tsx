'use client'

import { Box, Stack } from '@chakra-ui/react'

import {
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingHighlights,
  LandingWorkerActions,
  TaskBoard,
} from '@/app/components'
import { Header, Section } from '@ui'

export default function DraftPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header>
            <LandingHeader />
          </Header>
        </Section>
        <Section id="post-task" py={{ base: 8, md: 12 }}>
          <LandingHero />
        </Section>
        <Section id="tasks" py={{ base: 8, md: 12 }}>
          <TaskBoard />
        </Section>
        <Section id="worker-actions" py={{ base: 8, md: 12 }}>
          <LandingWorkerActions />
        </Section>
        <Section id="highlights" py={{ base: 8, md: 12 }}>
          <LandingHighlights />
        </Section>
        <Section id="footer" py={{ base: 8, md: 12 }} pb={{ base: 12, md: 16 }}>
          <LandingFooter />
        </Section>
      </Stack>
    </Box>
  )
}
