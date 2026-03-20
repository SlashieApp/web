'use client'

import { Box, Stack } from '@chakra-ui/react'

import {
  HomeHeroSection,
  HomeHowItWorksSection,
  HomePageHeader,
  HomeTrustSection,
} from './components'

import { Section } from '@ui'

export default function HomePage() {
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
        <Section
          id="trust"
          py={{ base: 10, md: 14 }}
          pb={{ base: 14, md: 20 }}
          bg="surfaceContainerLow"
        >
          <HomeTrustSection />
        </Section>
      </Stack>
    </Box>
  )
}
