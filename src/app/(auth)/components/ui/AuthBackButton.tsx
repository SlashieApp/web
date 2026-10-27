'use client'

import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { LuArrowLeft } from 'react-icons/lu'

import { authSwitchHref } from '@/app/(auth)/helpers/authRedirect'
import { stripLocalePrefix } from '@/i18n/navigation'
import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'
import { useGoBack } from '@/utils/goBack'
import { IconButton } from '@ui'

import bag from '../i11n.json'

const subscribe = () => () => {}

/**
 * With nothing behind the page (a link from an email, a fresh start) Back goes
 * to Log in, carrying `next`; someone already signed in (an unverified email)
 * goes to Search, since Log in would send them straight back.
 */
function authBackHref(): string {
  if (getAuthToken()) return APP_HOME
  return authSwitchHref('/login', new URLSearchParams(window.location.search))
}

/**
 * The auth pages are not nav pages and have no nav (FE-445), so each carries a
 * way back at the logo row's left, at every width. Log in is where a signed-out
 * visit starts: it shows an arrow only when something is behind it.
 */
export function AuthBackButton() {
  const t = useI11n(bag).shell
  const isLogin = stripLocalePrefix(usePathname() ?? '') === '/login'
  const onBack = useGoBack(authBackHref)
  // Read after hydration; the server renders none, and Log in's arrow appears with it.
  const somethingBehind = useSyncExternalStore(
    subscribe,
    () => window.history.length > 1,
    () => false,
  )

  if (isLogin && !somethingBehind) return null

  return (
    <Box position="absolute" left={-2} top="50%" transform="translateY(-50%)">
      <IconButton
        type="button"
        variant="ghost"
        aria-label={t.back}
        color="text.default"
        onClick={onBack}
      >
        <LuArrowLeft />
      </IconButton>
    </Box>
  )
}
