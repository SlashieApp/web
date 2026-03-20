'use client'

import { Box, Stack } from '@chakra-ui/react'

import {
  HomeHeroSection,
  HomeHowItWorksSection,
  HomeTrustSection,
} from './components'

import { Header, Section, SiteFooter, SiteHeader } from '@ui'

export default function HomePage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 4, md: 5 }}>
          <Header>
            <SiteHeader activeItem="post-job" />
          </Header>
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
          pb={{ base: 10, md: 14 }}
          bg="surfaceContainerLow"
        >
          <HomeTrustSection />
        </Section>
        <SiteFooter />
      </Stack>
    </Box>
  )
}
