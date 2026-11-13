'use client'

import { Box } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { useAccountSuspended } from '@/app/(auth)/helpers/accountDisabled'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { getAuthToken } from '@/utils/auth'
import { Link } from '@ui'

import bag from '../i11n.json'
import { AccountNotice } from './AccountNotice'

export function AccountSuspendedBanner() {
  const t = useI11n(bag).suspended
  const me = useMe()
  const getUser = useUserStore((s) => s.getUser)
  const visible = useAccountSuspended(me)
  const hydratedRef = useRef(false)

  const onHydrateRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hydratedRef.current) return
      hydratedRef.current = true
      if (!getAuthToken() || useUserStore.getState().me) return
      void getUser()
    },
    [getUser],
  )

  const mailto = `mailto:${t.email}`

  return (
    <>
      <Box ref={onHydrateRef} display="none" aria-hidden />
      {visible ? (
        <AccountNotice
          announce="alert"
          ariaLabel={t.ariaLabel}
          data-suspended-banner=""
        >
          {t.beforeEmail}
          <Link
            href={mailto}
            fontSize="sm"
            fontWeight={500}
            color="text.link"
            _hover={{ textDecoration: 'underline' }}
          >
            {t.email}
          </Link>
          {t.afterEmail}
        </AccountNotice>
      ) : null}
    </>
  )
}
