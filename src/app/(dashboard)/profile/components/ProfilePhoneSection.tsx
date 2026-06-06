'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

import { PhoneContactEditor } from '@/app/(dashboard)/components/PhoneContactEditor'
import { SectionCard } from '@ui'

export function ProfilePhoneSection() {
  return (
    <SectionCard id="profile-phone" p={{ base: 5, md: 6 }}>
      <Stack gap={5}>
        <Stack gap={1}>
          <Heading size="md">Phone number</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Save your mobile number here first, then verify it with an SMS code.
            Verification confirms this saved number — it does not accept a
            different number at verify time.
          </Text>
        </Stack>
        <PhoneContactEditor />
      </Stack>
    </SectionCard>
  )
}
