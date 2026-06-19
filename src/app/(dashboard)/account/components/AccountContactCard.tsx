'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

import { ContactMethodsPanel } from '@/app/(dashboard)/components/ContactMethodsPanel'
import { Card } from '@ui'

export function AccountContactCard() {
  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading size="md">Contact methods</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Verify a contact method to unlock it as a default on your profile
            and to become a worker.
          </Text>
        </Stack>
        <ContactMethodsPanel showIntro={false} />
      </Stack>
    </Card>
  )
}
