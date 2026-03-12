import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Container } from '../../ui/Container'
import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'
import { LandingHighlights } from './LandingHighlights'
import { LandingWorkerActions } from './LandingWorkerActions'
import { TaskBoard } from './TaskBoard'

function LandingStory() {
  return (
    <Box bg="bg" color="fg" minH="100vh">
      <Stack gap={0}>
        <Box as="section" py={{ base: 6, md: 8 }}>
          <Container>
            <LandingHeader />
          </Container>
        </Box>
        <Box as="section" py={{ base: 8, md: 12 }}>
          <Container>
            <LandingHero />
          </Container>
        </Box>
        <Box as="section" py={{ base: 8, md: 12 }}>
          <Container>
            <TaskBoard />
          </Container>
        </Box>
        <Box as="section" py={{ base: 8, md: 12 }}>
          <Container>
            <LandingWorkerActions />
          </Container>
        </Box>
        <Box as="section" py={{ base: 8, md: 12 }}>
          <Container>
            <LandingHighlights />
          </Container>
        </Box>
        <Box as="section" py={{ base: 8, md: 12 }} pb={{ base: 12, md: 16 }}>
          <Container>
            <LandingFooter />
          </Container>
        </Box>
      </Stack>
    </Box>
  )
}

const meta: Meta<typeof LandingStory> = {
  title: 'UI/Pages/Landing Page',
  component: LandingStory,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof LandingStory>

export const Default: Story = {}
