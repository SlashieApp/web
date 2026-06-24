'use client'
import { Link } from '@ui'

import { Box, HStack, Text } from '@chakra-ui/react'

import {
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useMe } from '@/app/(auth)/store/user'

export function PhoneVerificationBanner() {
  const me = useMe()
  const savedPhone = profileContactNumber(me)

  if (!me || !savedPhone || isPhoneVerified(me)) return null

  return (
    <Box
      bg="bg.subtle"
      borderBottomWidth="1px"
      borderColor="border.default"
      px={{ base: 3, lg: 4 }}
      py={2}
    >
      <HStack
        gap={3}
        justify="space-between"
        flexWrap="wrap"
        align="center"
        maxW="full"
      >
        <Text fontSize="sm" color="text.default" fontWeight={600}>
          Verify your phone to share it on tasks.
        </Text>
        <Link
          href="/profile#profile-phone"
          fontSize="sm"
          fontWeight={700}
          color="text.link"
          _hover={{ textDecoration: 'none', color: 'status.success.fg' }}
        >
          Verify phone
        </Link>
      </HStack>
    </Box>
  )
}
