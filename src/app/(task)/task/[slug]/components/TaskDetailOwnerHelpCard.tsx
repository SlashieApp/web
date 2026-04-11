'use client'

import { Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button, GlassCard } from '@ui'

export function TaskDetailOwnerHelpCard() {
  return (
    <GlassCard
      p={6}
      borderWidth="0"
      bg="linear-gradient(160deg, #03225a 0%, #012b73 55%, #00358f 100%)"
      color="white"
      boxShadow="ambient"
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <Text fontSize="md" fontWeight={700} color="white">
            Need help?
          </Text>
          <Text fontSize="sm" opacity={0.88} lineHeight="tall">
            Our team can help with quotes, payments, or disputes.
          </Text>
        </Stack>
        <Button
          as={NextLink}
          href="mailto:support@handybox.com"
          size="sm"
          bg="white"
          color="primary.800"
          _hover={{ bg: 'primary.50' }}
          alignSelf="flex-start"
          borderRadius="lg"
        >
          Chat with support
        </Button>
      </Stack>
    </GlassCard>
  )
}
