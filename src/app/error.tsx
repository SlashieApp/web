'use client'

import NextLink from 'next/link'
import { useEffect } from 'react'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { capture, getCurrentRoute } from '@/utils/analytics'
import { APP_HOME } from '@/utils/appRoutes'
import { Button } from '@ui'

import { StatusScreen } from './StatusScreen'
import bag from './i11n.json'

/**
 * Root error boundary (FE-72): a branded retry instead of Next's default
 * error screen. It catches page errors before the provider-level analytics
 * boundary, so it reports them to PostHog itself.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useI11n(bag)
  const href = useLocalizedHref()

  useEffect(() => {
    try {
      capture('$exception', {
        route: getCurrentRoute(),
        error_message: error.message,
        digest: error.digest,
      })
    } catch {
      // Analytics must never break the error screen.
    }
  }, [error])

  return (
    <StatusScreen
      title={t.errorTitle}
      body={t.errorBody}
      actions={
        <>
          <Button variant="primary" onClick={reset}>
            {t.retry}
          </Button>
          <Button asChild variant="ghost">
            <NextLink href={href(APP_HOME)}>{t.search}</NextLink>
          </Button>
        </>
      }
    />
  )
}
