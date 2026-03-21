'use client'

import { Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button, GlassCard, Heading, Text } from '@ui'

export function WorkerAccessGate({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <GlassCard p={{ base: 6, md: 7 }} bg="primary.50" borderColor="primary.100">
      <Stack gap={4} maxW="2xl">
        <Heading size="lg">{title}</Heading>
        <Text color="muted">{description}</Text>
        <Button
          as={NextLink}
          href="/dashboard/worker/register"
          alignSelf="flex-start"
        >
          Become a worker
        </Button>
      </Stack>
    </GlassCard>
  )
}
