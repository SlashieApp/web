'use client'

import { Box, HStack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'

import bag from '../i11n.json'

/** Between Google / Apple and the email form. */
export function AuthDivider() {
  const t = useI11n(bag).fields
  return (
    <HStack gap={3} w="full">
      <Box flex={1} h="1px" bg="border.default" />
      <Text fontSize="xs" color="text.muted" flexShrink={0}>
        {t.orEmail}
      </Text>
      <Box flex={1} h="1px" bg="border.default" />
    </HStack>
  )
}
