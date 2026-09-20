'use client'

import { Box, Text } from '@chakra-ui/react'
import { useCallback, useRef, useSyncExternalStore } from 'react'

import {
  getAccountDisabledFlag,
  isMeAccountDisabled,
  subscribeAccountDisabled,
} from '@/app/(auth)/helpers/accountDisabled'
import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { getAuthToken } from '@/utils/auth'
import { Link } from '@ui'

import bag from '../i11n.json'

export function AccountSuspendedBanner() {
  const t = useI11n(bag).suspended
  const me = useMe()
  const getUser = useUserStore((s) => s.getUser)
  const flagged = useSyncExternalStore(
    subscribeAccountDisabled,
    getAccountDisabledFlag,
    () => false,
  )
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

  const visible = isMeAccountDisabled(me) || flagged
  const mailto = `mailto:${t.email}`

  return (
    <>
      <Box ref={onHydrateRef} display="none" aria-hidden />
      {visible ? (
        <Box
          as="section"
          aria-label={t.ariaLabel}
          bg="status.warning.soft"
          borderBottomWidth="1px"
          borderColor="status.warning.solid"
          px={{ base: 3, lg: 4 }}
          py={2}
        >
          <Text
            fontSize="sm"
            color="status.warning.fg"
            fontWeight={600}
            lineHeight="tall"
            textAlign="center"
          >
            {t.beforeEmail}
            <Link
              href={mailto}
              fontSize="sm"
              fontWeight={700}
              color="text.link"
              _hover={{ textDecoration: 'underline' }}
            >
              {t.email}
            </Link>
            {t.afterEmail}
          </Text>
        </Box>
      ) : null}
    </>
  )
}
