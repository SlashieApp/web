import { ApolloProvider } from '@apollo/client/react'
import { ChakraProvider } from '@chakra-ui/react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import type { Preview } from '@storybook/nextjs-vite'
import type { CSSProperties } from 'react'
import type React from 'react'

import { ThemeProvider } from 'next-themes'

import { darkSystem, lightSystem } from '../src/theme/chakraSystem'
import { apolloClient } from '../src/utils/apolloClient'

/** Mirrors `next/font` CSS variables from `app/layout.tsx` so theme `fonts.heading` / `fonts.body` resolve in Storybook. */
const storybookFontRootStyle = {
  minHeight: '100%',
  // Canvas uses the SDL `bg.canvas` role so every story sits on the themed surface.
  background: 'var(--chakra-colors-bg-canvas)',
  color: 'var(--chakra-colors-text-default)',
  '--font-plus-jakarta':
    '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  '--font-inter': '"Inter", ui-sans-serif, system-ui, sans-serif',
} as CSSProperties

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ApolloProvider client={apolloClient}>
        <ThemeProvider
          attribute="class"
          disableTransitionOnChange
          forcedTheme={context.globals.theme ?? 'light'}
        >
          <ChakraProvider
            value={context.globals.theme === 'dark' ? darkSystem : lightSystem}
          >
            <div style={storybookFontRootStyle}>
              <Story />
            </div>
          </ChakraProvider>
        </ThemeProvider>
      </ApolloProvider>
    ),
  ],
  parameters: {
    // App Router project: mount AppRouterContext for next/navigation hooks.
    nextjs: {
      appDirectory: true,
    },
    // Docs pages (MDX + autodocs) render free-standing JSX OUTSIDE the story
    // decorators, so wrap the whole docs page in a ChakraProvider. Pages that
    // also show dark mode nest their own provider — harmless.
    docs: {
      container: (props: React.ComponentProps<typeof DocsContainer>) => (
        <DocsContainer {...props}>
          <ChakraProvider value={lightSystem}>{props.children}</ChakraProvider>
        </DocsContainer>
      ),
    },
    options: {
      storySort: {
        order: [
          'Foundations',
          [
            'Overview & Principles',
            'Color',
            'Typography',
            'Space & Radius',
            'Elevation',
            'Motion',
            'Accessibility',
          ],
          'Components',
          'Patterns',
          'ui',
          'layout',
          'header',
          'task',
          'taskDetail',
          'quotes',
          'Design',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
