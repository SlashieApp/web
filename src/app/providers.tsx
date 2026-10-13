'use client'

import { ApolloProvider } from '@apollo/client/react'
import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

import { AccountRestoreGate } from '@/app/(auth)/components/ui/AccountRestoreGate'
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
                  {/* Honour the OS reduced-motion setting in every motion component. */}
                  <MotionConfig reducedMotion="user">
                    <AppToastHost />
                    <AccountRestoreGate>{children}</AccountRestoreGate>
                    <CookieConsentBanner />
                  </MotionConfig>
                </AnalyticsErrorBoundary>
              </FeedbackProvider>
            </MessagesProvider>
          </LocaleProvider>
        </PostHogProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}
