'use client'

import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button, SectionCard } from '@ui'

export function WorkerAccessGate({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <SectionCard p={{ base: 6, md: 7 }} bg="green.100">
      <Stack gap={4} maxW="2xl">
        <Heading size="lg" color="secondary.900">
          {title}
        </Heading>
        <Text color="formLabelMuted">{description}</Text>
        <Link
          as={NextLink}
          href="/dashboard/worker/register"
          _hover={{ textDecoration: 'none' }}
        >
          <Button alignSelf="flex-start">Become a worker</Button>
        </Link>
      </Stack>
    </SectionCard>
  )
}
