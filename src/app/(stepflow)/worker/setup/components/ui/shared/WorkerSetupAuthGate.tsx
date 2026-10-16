'use client'

import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { useUserStore } from '@/app/(auth)/store/user'
import { SessionError } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { stripLocalePrefix } from '@/i18n/navigation'
import { getAuthToken } from '@/utils/auth'

import { WORKER_SETUP_VIEWS, getWorkerSetupView } from '../../../views'

/**
 * Loads the account before setup: signed out goes to log in (in the reader's
 * language) and comes back here, `?next` included. An expired session counts
 * as signed out; an account that failed to load offers Try again.
 */
export function WorkerSetupAuthGate({ children }: { children: ReactNode }) {
  const me = useUserStore((s) => s.me)
  const isLoading = useUserStore((s) => s.isLoading)
  const getUser = useUserStore((s) => s.getUser)
  const logout = useUserStore((s) => s.logout)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const localize = useLocalizedHref()
  const [hydrated, setHydrated] = useState(false)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const redirectedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hydrated) return
      setHydrated(true)
      const token = getAuthToken()
      setHasToken(Boolean(token))
      if (token) void getUser()
    },
    [getUser, hydrated],
  )

  const view =
    WORKER_SETUP_VIEWS[
      getWorkerSetupView({
        status:
          !hydrated || (hasToken && !me && isLoading)
            ? 'loading'
            : me
              ? 'ready'
              : hasToken && getAuthToken()
                ? 'error'
                : 'guest',
        screen: 'about',
      })
    ]

  if (view.layout === 'redirect' && !redirectedRef.current) {
    redirectedRef.current = true
    const query = searchParams.toString()
    const back = `${stripLocalePrefix(pathname ?? '/worker/setup')}${query ? `?${query}` : ''}`
    router.replace(localize(`/login?next=${encodeURIComponent(back)}`))
  }
  if (view.layout === 'error') {
    return <SessionError onRetry={() => void getUser()} onLogout={logout} />
  }
  if (view.layout !== 'screen') return <SessionLoading ref={onMount} />

  return <Box ref={onMount}>{children}</Box>
}
