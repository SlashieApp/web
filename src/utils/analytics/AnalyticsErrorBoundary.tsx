'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button, StatusCard } from '@ui'

import {
  redirectToLandingIfAppRoute,
  shouldFallbackToLandingOnApiFailure,
} from '@/utils/apiAvailability'
import { capture, getCurrentRoute } from './capture'

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

    return (
      // The boundary wraps the whole app, so when it trips the shell and its
      // main are gone: the card is the page and its one main (fullPage).
      <StatusCard
        fullPage
        role="alert"
        title="Something went wrong"
        body="An unexpected error occurred. Try again or refresh the page."
        actions={
          <Button size="form" variant="primary" onClick={this.handleRetry}>
            Try again
          </Button>
        }
      />
    )
  }
}
