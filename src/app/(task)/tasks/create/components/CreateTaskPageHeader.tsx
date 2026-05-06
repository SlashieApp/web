'use client'

import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { SectionCard } from '@ui'

export function CreateTaskPageHeader() {
  return (
    <Stack gap={2}>
      <Link
        as={NextLink}
        href="/"
        fontWeight={600}
        color="primary.700"
        _hover={{ textDecoration: 'none' }}
      >
        ← Back to browse
      </Link>
      <Heading size={{ base: '2xl', md: '3xl' }} fontWeight={800}>
        Post a new task
      </Heading>
      <Text color="formLabelMuted">
        Detail your requirements, set your budget, and find the right worker for
        your job.
      </Text>
    </Stack>
  )
}
