'use client'

import { ApolloProvider } from '@apollo/client/react'
import type { ReactNode } from 'react'

import { MessagesProvider } from '@/app/(messages)/messages/context/MessagesProvider'
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
            <MessagesProvider>
              <FeedbackProvider>
                <AnalyticsErrorBoundary>
                  <AppToastHost />
                  {children}
                  <CookieConsentBanner />
                </AnalyticsErrorBoundary>
              </FeedbackProvider>
            </MessagesProvider>
          </LocaleProvider>
        </PostHogProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}
