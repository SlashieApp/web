'use client'

import { ApolloProvider } from '@apollo/client/react'
import type { ReactNode } from 'react'

import { NotificationLandPopupHost } from '@/app/(dashboard)/components/notifications/NotificationLandPopupHost'
import { NotificationsProvider } from '@/app/(dashboard)/context/NotificationsProvider'
import { FeedbackProvider } from '@/content/feedback/FeedbackProvider'
import { LocaleProvider } from '@/i18n/LocaleProvider'
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
          <LocaleProvider>
            <NotificationsProvider>
              <FeedbackProvider>
                <AnalyticsErrorBoundary>
                  <AppToastHost />
                  <NotificationLandPopupHost />
                  {children}
                  <CookieConsentBanner />
                </AnalyticsErrorBoundary>
              </FeedbackProvider>
            </NotificationsProvider>
          </LocaleProvider>
        </PostHogProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}
