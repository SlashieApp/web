'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@ui'

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
      <Box
        minH="40vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
        py={12}
      >
        <Stack gap={4} maxW="md" textAlign="center">
          <Heading size="md">Something went wrong</Heading>
          <Text color="formLabelMuted" fontSize="sm">
            An unexpected error occurred. Try again or refresh the page.
          </Text>
          <Button size="sm" variant="primary" onClick={this.handleRetry}>
            Try again
          </Button>
        </Stack>
      </Box>
    )
  }
}
