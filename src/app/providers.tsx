'use client'

import { ApolloProvider } from '@apollo/client/react'
import type { ReactNode } from 'react'

import { NotificationsProvider } from '@/app/(dashboard)/context/NotificationsProvider'
import { AnalyticsErrorBoundary } from '@/utils/analytics'
import { apolloClient } from '@/utils/apolloClient'
import { AppToastHost } from '@/utils/appToast'

import { CookieConsentBanner } from './CookieConsentBanner'
import { PostHogProvider } from './PostHogProvider'
import { ThemeProvider } from './ThemeProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <PostHogProvider>
          <NotificationsProvider>
            <AnalyticsErrorBoundary>
              <AppToastHost />
              {children}
              <CookieConsentBanner />
            </AnalyticsErrorBoundary>
          </NotificationsProvider>
        </PostHogProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}
