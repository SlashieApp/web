'use client'

/// <reference types="react/canary" />
import * as React from 'react'

type ViewTransitionProps = {
  children?: React.ReactNode
  name?: string
  share?: string
  default?: string
  enter?: string
  exit?: string
  update?: string
}

function Passthrough({ children }: { children?: React.ReactNode }) {
  return children
}

type ReactWithViewTransition = typeof React & {
  ViewTransition?: React.ComponentType<ViewTransitionProps>
}

const ReactViewTransition = (React as ReactWithViewTransition).ViewTransition

/**
 * One import boundary for React's experimental ViewTransition.
 *
 * Next aliases `react` to a vendored build that exports the component; the
 * plain npm `react` that Storybook and Vitest resolve does not. Rendering an
 * undefined element type would crash every story/test that touches a card.
 */
export const ViewTransition: React.ComponentType<ViewTransitionProps> =
  ReactViewTransition ?? Passthrough
