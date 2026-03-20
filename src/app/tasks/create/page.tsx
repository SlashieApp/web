'use client'

import { Box, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import {
  LandingFooter,
  LandingHeader,
  TaskCreationForm,
} from '@/app/components'
import { Header, Heading, Section, Text } from '@ui'

export default function CreateTaskPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header>
            <LandingHeader />
          </Header>
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
              <Heading size={{ base: '2xl', md: '3xl' }} fontWeight={800}>
                Post a job request
              </Heading>
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
