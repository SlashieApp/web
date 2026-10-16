'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import bag from '../i11n.json'

import { MeAvatar } from '@/app/(auth)/components/ui/MeAvatar'

import { Link } from '../../Link'

export type AccountMenuHeaderProps = {
  displayName: string
  email: string
  onViewProfile?: () => void
}

/** Who is signed in, with the way to their Profile. Plans live on Plan & billing. */
export function AccountMenuHeader({
  displayName,
  email,
  onViewProfile,
}: AccountMenuHeaderProps) {
  const t = useI11n(bag)

  return (
    <Stack gap={0}>
      <HStack align="flex-start" gap={3} px={3} py={3}>
        <MeAvatar size="md" name={displayName.trim() || email} />
        <Stack gap={0.5} minW={0} flex={1} align="flex-start">
          <Text
            fontSize="sm"
            fontWeight={700}
            color="text.default"
            truncate
            w="full"
          >
            {displayName}
          </Text>
          <Text fontSize="xs" color="text.muted" truncate w="full">
            {email}
          </Text>
          <Link
            href="/profile"
            tone="emphasis"
            fontSize="xs"
            fontWeight={600}
            color="text.link"
            onClick={onViewProfile}
          >
            {t.viewProfile}
          </Link>
        </Stack>
      </HStack>
      <Box borderTopWidth="1px" borderColor="border.default" />
    </Stack>
  )
}
