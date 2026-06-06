'use client'

import { Box, HStack, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

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
      bg="neutral.100"
      borderBottomWidth="1px"
      borderColor="cardBorder"
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
        <Text fontSize="sm" color="cardFg" fontWeight={600}>
          Verify your phone to share it on tasks.
        </Text>
        <Link
          as={NextLink}
          href="/profile#profile-phone"
          fontSize="sm"
          fontWeight={700}
          color="primary.600"
          _hover={{ textDecoration: 'none', color: 'primary.700' }}
        >
          Verify phone
        </Link>
      </HStack>
    </Box>
  )
}
