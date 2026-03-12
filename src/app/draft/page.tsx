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

export default function DraftPage() {
  return (
    <Box bg="bg" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <LandingHeader />
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
