import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Section } from '../../ui/Layout'
import { HomeHeroSection } from './HomeHeroSection'
import { HomeHowItWorksSection } from './HomeHowItWorksSection'
import { HomePageHeader } from './HomePageHeader'
import { HomeTrustSection } from './HomeTrustSection'

function LandingStory() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 4, md: 5 }}>
          <HomePageHeader />
        </Section>
        <Section id="hero" py={{ base: 8, md: 12 }} bg="surfaceContainerLow">
          <HomeHeroSection />
        </Section>
        <Section id="how-it-works" py={{ base: 8, md: 12 }}>
          <HomeHowItWorksSection />
        </Section>
        <Section id="trust" py={{ base: 10, md: 14 }} bg="surfaceContainerLow">
          <HomeTrustSection />
        </Section>
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
