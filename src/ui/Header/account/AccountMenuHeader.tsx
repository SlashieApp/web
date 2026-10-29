'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Stack, Text } from '@chakra-ui/react'
import bag from '../i11n.json'

import { MeAvatar } from '@/app/(auth)/components/ui/MeAvatar'

import { Link } from '../../Link'

export type AccountMenuHeaderProps = {
  displayName: string
  email: string
  onViewProfile?: () => void
}

/**
 * Who is signed in, with the way to their Profile. Plans live on Plan & billing.
 *
 * The header of the account menu, on the form spacing (Foundations-Form-Spacing,
 * menus): the name and the email are `formSpace.titleToSubtitle` (8) apart, the
 * Profile link is `controlToHelper` (4) under the email, and the first row is
 * `headerToBody` (24) under the block. No rule: the space separates it, as it does
 * a dialog's header from its body. The block owns that 24 below it (a piece owns
 * its outer spacing), so put it straight above the rows, in no gapped stack.
 *
 * It counts as a row of the menu: the avatar and the text are inset 12 inside
 * the block (top and left), where a row's label is, so the avatar's left edge
 * and the labels below line up, and the first thing in the panel sits as far from
 * its edge as the first row's label does.
 */
export function AccountMenuHeader({
  displayName,
  email,
  onViewProfile,
}: AccountMenuHeaderProps) {
  const t = useI11n(bag)

  return (
    <HStack
      data-menu-header=""
      align="flex-start"
      gap={3}
      px={3}
      pt={3}
      mb="form.headerToBody"
    >
      <MeAvatar size="md" name={displayName.trim() || email} />
      <Stack gap="form.titleToSubtitle" minW={0} flex={1} align="flex-start">
        <Text
          fontSize="sm"
          lineHeight="20px"
          fontWeight={500}
          color="text.default"
          truncate
          w="full"
        >
          {displayName}
        </Text>
        <Stack gap="form.controlToHelper" minW={0} w="full" align="flex-start">
          <Text
            fontSize="xs"
            lineHeight="16px"
            color="text.muted"
            truncate
            w="full"
          >
            {email}
          </Text>
          <Link
            href="/profile"
            tone="emphasis"
            fontSize="xs"
            lineHeight="16px"
            fontWeight={500}
            color="text.link"
            onClick={onViewProfile}
          >
            {t.viewProfile}
          </Link>
        </Stack>
      </Stack>
    </HStack>
  )
}
