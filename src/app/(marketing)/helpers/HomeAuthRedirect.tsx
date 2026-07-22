'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

import { useLocale } from '@/i18n/LocaleProvider'
import { withLocale } from '@/i18n/navigation'
import { isApiUnavailable } from '@/utils/apiAvailability'
import { APP_HOME } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'

/** Sends signed-in visitors from marketing home to the app browse route. */
export function HomeAuthRedirect() {
  const router = useRouter()
  const locale = useLocale()
  const redirectedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || redirectedRef.current) return
      if (!getAuthToken() || isApiUnavailable()) return
      redirectedRef.current = true
      router.replace(withLocale(locale, APP_HOME))
    },
    [locale, router],
  )

  return <span ref={onMount} hidden aria-hidden />
}
