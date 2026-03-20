'use client'

import { Box, Stack } from '@chakra-ui/react'

import {
  LandingHero,
  LandingHighlights,
  LandingWorkerActions,
  TaskBoard,
} from '@/app/components'
import { Header, Section, SiteFooter, SiteHeader } from '@ui'

export default function DraftPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header>
            <SiteHeader activeItem="none" />
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
        <SiteFooter />
      </Stack>
    </Box>
  )
}
