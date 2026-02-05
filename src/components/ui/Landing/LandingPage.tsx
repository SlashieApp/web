'use client'

import { Box, Container, Stack } from '@chakra-ui/react'

import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'
import { LandingHighlights } from './LandingHighlights'
import { LandingWorkerActions } from './LandingWorkerActions'
import { TaskBoard } from './TaskBoard'

export function LandingPage() {
  return (
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 10, md: 16 }}>
      <Container maxW="6xl">
        <Stack gap={10}>
          <LandingHeader />
          <LandingHero />
          <TaskBoard />
          <LandingWorkerActions />
          <LandingHighlights />
          <LandingFooter />
        </Stack>
      </Container>
    </Box>
  )
}
