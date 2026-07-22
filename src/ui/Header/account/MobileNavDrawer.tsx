'use client'

import { HStack } from '@chakra-ui/react'
import { useCallback } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useMe } from '@/app/(auth)/store/user'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useI11n } from '@/i18n/useI11n'

import { Button } from '../../Button'
import { Drawer } from '../../Drawer'
import { Link } from '../../Link'

import bag from '../i11n.json'
import { AccountMenuContent } from './AccountMenuContent'

export type MobileNavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  const me = useMe()
  const t = useI11n(bag)
  const postTaskBlocked = me != null && !isEmailVerified(me)

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={t.accountMenu}
      placement="end"
      size="full"
    >
      <HStack justify="flex-end" align="center" gap={2} mb={3} flexShrink={0}>
        <LanguageSwitcher />
        {postTaskBlocked ? (
          <Button size="sm" variant="secondary" disabled>
            {t.postTask}
          </Button>
        ) : (
          <Button asChild size="sm" variant="primary">
            <Link
              href="/tasks/create"
              _hover={{ textDecoration: 'none' }}
              onClick={close}
            >
              {t.postTask}
            </Link>
          </Button>
        )}
      </HStack>

      <AccountMenuContent onClose={close} />
    </Drawer>
  )
}
