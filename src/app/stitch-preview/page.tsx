'use client'

import { Box, Stack } from '@chakra-ui/react'

import { LandingFooter, LandingHeader } from '@/app/components'
import { Header, Section, StitchScreensPreview } from '@ui'

export default function StitchPreviewPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header>
            <LandingHeader />
          </Header>
        </Section>
        <Section bg="surfaceContainerLow">
          <StitchScreensPreview />
        </Section>
        <Section id="footer" py={{ base: 8, md: 12 }} pb={{ base: 12, md: 16 }}>
          <LandingFooter />
        </Section>
      </Stack>
    </Box>
  )
}
