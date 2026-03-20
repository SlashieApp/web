'use client'

import { Box, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import {
  LandingFooter,
  LandingHeader,
  TaskCreationForm,
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

export default function CreateTaskPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <LandingHeader />
        </Section>

        <Section bg="surfaceContainerLow">
          <Stack gap={8}>
            <Stack gap={2}>
              <Link
                as={NextLink}
                href="/tasks"
                fontWeight={600}
                color="primary.700"
                _hover={{ textDecoration: 'none' }}
              >
                ← Back to tasks
              </Link>
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight={800}
                letterSpacing="-0.02em"
              >
                Post a job request
              </Text>
              <Text color="muted">
                Follow the guided form to share your job details, preferred
                timing, and budget in one place.
              </Text>
            </Stack>
            <TaskCreationForm />
          </Stack>
        </Section>

        <Section id="footer" py={{ base: 8, md: 12 }} pb={{ base: 12, md: 16 }}>
          <LandingFooter />
        </Section>
      </Stack>
    </Box>
  )
}
