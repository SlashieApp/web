import { ApolloProvider } from '@apollo/client/react'
import { ChakraProvider } from '@chakra-ui/react'
import type { Preview } from '@storybook/nextjs-vite'
import type { CSSProperties } from 'react'
import React from 'react'

import { ThemeProvider } from 'next-themes'

import { darkSystem, lightSystem } from '../src/theme/system'
import { apolloClient } from '../src/utils/apolloClient'

/** Mirrors `next/font` CSS variables from `app/layout.tsx` so theme `fonts.heading` / `fonts.body` resolve in Storybook. */
const storybookFontRootStyle = {
  minHeight: '100%',
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
    options: {
      storySort: {
        order: ['Design', 'UI'],
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
