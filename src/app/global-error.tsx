'use client'

import NextLink from 'next/link'
import { useEffect } from 'react'

import { capture, getCurrentRoute } from '@/utils/analytics'
import { APP_HOME } from '@/utils/appRoutes'

import bag from './i11n.json'

/**
 * Last-resort boundary for errors in the root layout itself (FE-72). It
 * replaces the whole document, so no providers, theme or locale exist here:
 * plain markup, inline styles and the English copy.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = bag.en

  useEffect(() => {
    try {
      capture('$exception', {
        route: getCurrentRoute(),
        error_message: error.message,
        digest: error.digest,
        boundary: 'global',
      })
    } catch {
      // Analytics must never break the error screen.
    }
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: '48px 16px',
          background: '#F4F6F5',
          color: '#111816',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <main style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 8px' }}>
            {t.errorTitle}
          </h1>
          <p style={{ margin: '0 0 24px', color: '#4A5551', lineHeight: 1.6 }}>
            {t.errorBody}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 44,
              padding: '0 20px',
              border: 0,
              borderRadius: 10,
              background: '#05683F',
              color: '#FFFFFF',
              font: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.retry}
          </button>
          <p style={{ margin: '16px 0 0' }}>
            <NextLink
              href={APP_HOME}
              style={{ color: '#05683F', fontWeight: 600 }}
            >
              {t.search}
            </NextLink>
          </p>
        </main>
      </body>
    </html>
  )
}
