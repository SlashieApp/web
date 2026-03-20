'use client'

import { Box, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { TaskCreationForm } from '@/app/components'
import { Header, Heading, Section, SiteFooter, SiteHeader, Text } from '@ui'

export default function CreateTaskPage() {
  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 4, md: 5 }}>
          <Header>
            <SiteHeader activeItem="post-job" />
          </Header>
        </Section>

        <Section bg="surfaceContainerLow" py={{ base: 8, md: 10 }}>
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
                Follow the guided questions to share your job details, schedule,
                and budget.
              </Text>
            </Stack>
            <TaskCreationForm />
          </Stack>
        </Section>
        <SiteFooter />
      </Stack>
    </Box>
  )
}
