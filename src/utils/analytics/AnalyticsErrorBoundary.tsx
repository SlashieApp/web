'use client'

import NextLink from 'next/link'
import { Component, type ErrorInfo, type ReactNode } from 'react'

import errorBag from '@/app/i11n.json'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { Button, StatusCard } from '@ui'

import {
  redirectToLandingIfAppRoute,
  shouldFallbackToLandingOnApiFailure,
} from '@/utils/apiAvailability'
import { capture, getCurrentRoute } from './capture'

/**
 * The card when the whole app has failed: the error page's own words
 * (`app/error.tsx`), in the reader's language, with Try again and Search
 * (FE-541). The boundary wraps the app, so the card is the page and its one
 * main (fullPage).
 */
function LastResortCard({ onRetry }: { onRetry: () => void }) {
  const t = useI11n(errorBag)
  const href = useLocalizedHref()
  return (
    <StatusCard
      fullPage
      role="alert"
      title={t.errorTitle}
      body={t.errorBody}
      actions={
        <>
          <Button size="form" variant="primary" onClick={onRetry}>
            {t.retry}
          </Button>
          <Button asChild size="form" variant="ghost">
            <NextLink href={href(APP_HOME)}>{t.search}</NextLink>
          </Button>
        </>
      }
    />
  )
}

type AnalyticsErrorBoundaryProps = {
  children: ReactNode
  route?: string
}

type AnalyticsErrorBoundaryState = {
  hasError: boolean
}

export class AnalyticsErrorBoundary extends Component<
  AnalyticsErrorBoundaryProps,
  AnalyticsErrorBoundaryState
> {
  state: AnalyticsErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AnalyticsErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (
      typeof window !== 'undefined' &&
      shouldFallbackToLandingOnApiFailure(window.location.pathname)
    ) {
      redirectToLandingIfAppRoute()
      return
    }

    try {
      capture('$exception', {
        route: this.props.route ?? getCurrentRoute(),
        error_message: error.message,
        component_stack: errorInfo.componentStack?.slice(0, 500),
      })
    } catch {
      // no-op
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return <LastResortCard onRetry={this.handleRetry} />
  }
}
