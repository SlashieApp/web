import type { Metadata } from 'next'

import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'

import { Footer } from '@/ui/Footer/Footer'

export const metadata: Metadata = {
  title: 'About | Slashie',
  description:
    'Slashie connects people who need local tasks done with workers who quote, deliver, and build reputation on the map.',
}

export default function AboutPage() {
  return (
    <>
      <Box py={{ base: 10, md: 14 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <Stack gap={6}>
            <Heading size="xl">About Slashie</Heading>
            <Text color="text.muted" lineHeight="tall" fontSize="md">
              Slashie is a map-first local task marketplace. Customers post what
              needs doing; workers browse nearby tasks and send quotes. When
              work is booked, payment stays between customer and worker —
              Slashie focuses on discovery, quoting, and trust.
            </Text>
            <Text color="text.muted" lineHeight="tall" fontSize="md">
              Workers can start on a free quote tier or subscribe to Slashie
              Unlimited for unlimited quoting. Customers post tasks for free.
              Platform billing is separate from job payments.
            </Text>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
