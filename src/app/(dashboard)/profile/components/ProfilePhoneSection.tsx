'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

import { PhoneContactRow } from '@/app/(dashboard)/components/ContactMethodsPanel'
import { Card } from '@ui'

export function ProfilePhoneSection() {
  return (
    <Card layout="section" id="profile-phone" p={{ base: 5, md: 6 }}>
      <Stack gap={5}>
        <Stack gap={1}>
          <Heading size="md">Phone number</Heading>
          <Text fontSize="sm" color="text.muted">
            Add and verify the mobile number on your account. Verification
            confirms this saved number via SMS.
          </Text>
        </Stack>
        <PhoneContactRow />
      </Stack>
    </Card>
  )
}
