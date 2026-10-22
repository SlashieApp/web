import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Observable } from '@apollo/client/utilities'
import { ChakraProvider } from '@chakra-ui/react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import type { Preview } from '@storybook/nextjs-vite'
import type { CSSProperties } from 'react'
import type React from 'react'

import { ThemeProvider } from 'next-themes'

import { darkSystem, lightSystem } from '../src/theme/chakraSystem'
import {
  CameraSourceContext,
  type OpenCamera,
} from '../src/ui/CameraCapture/CameraCapture'
import { TOUCH_SCREEN_QUERY } from '../src/ui/PhotoSourcePicker/photoSource'

/**
 * Default client for every story: requests never answer, so a story can't
 * reach the API (`.env` points at production). Stories that need data wrap
 * themselves in their own seeded client.
 */
const storyApolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new ApolloLink(() => new Observable(() => {})),
})

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

/** A media query answer that matches, for {@link TOUCH_SCREEN_QUERY}. */
function matchingQuery(media: string): MediaQueryList {
  return {
    matches: true,
    media,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }
}

/**
 * A stand-in camera: a canvas, redrawn every frame until its track stops,
 * saying which camera was asked for (a dot circles so the preview moves).
 */
const openStoryCamera: OpenCamera = async (facing) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 960
  const context = canvas.getContext('2d')
  if (!context) throw new DOMException('No 2D canvas', 'NotReadableError')
  const stream = canvas.captureStream()
  const [track] = stream.getVideoTracks()
  const draw = (time: number) => {
    if (track.readyState === 'ended') return
    context.fillStyle = facing === 'user' ? '#8a3f6b' : '#2f6f9f'
    context.fillRect(0, 0, 1280, 960)
    context.fillStyle = '#ffffff'
    context.font = '600 72px sans-serif'
    context.textAlign = 'center'
    context.fillText(
      facing === 'user' ? 'Front camera' : 'Back camera',
      640,
      500,
    )
    context.beginPath()
    context.arc(
      640 + 320 * Math.cos(time / 600),
      480 + 320 * Math.sin(time / 600),
      28,
      0,
      2 * Math.PI,
    )
    context.fill()
    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
  return stream
}

/**
 * The camera a story gets (`parameters: { camera }`), so no story opens a
 * real one: `live` (the default) or a camera that never starts or fails.
 */
const storyCameras: Record<string, OpenCamera> = {
  live: openStoryCamera,
  starting: () => new Promise(() => {}),
  blocked: async () => {
    throw new DOMException('Permission denied', 'NotAllowedError')
  },
  busy: async () => {
    throw new DOMException('Could not start video source', 'NotReadableError')
  },
  unavailable: async () => {
    throw new DOMException('Requested device not found', 'NotFoundError')
  },
}

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
      <ApolloProvider client={storyApolloClient}>
        <ThemeProvider
          attribute="class"
          disableTransitionOnChange
          forcedTheme={context.globals.theme ?? 'light'}
        >
          <ChakraProvider
            value={context.globals.theme === 'dark' ? darkSystem : lightSystem}
          >
            <CameraSourceContext.Provider
              value={storyCameras[context.parameters.camera ?? 'live']}
            >
              <div style={storybookFontRootStyle}>
                <Story />
              </div>
            </CameraSourceContext.Provider>
          </ChakraProvider>
        </ThemeProvider>
      </ApolloProvider>
    ),
  ],
  /**
   * A desktop browser never matches the touch-screen query, so a story with
   * `parameters: { touchScreen: true }` answers it as a phone or tablet does:
   * the photo button (`@ui` PhotoSourcePicker) then offers Take photo.
   */
  beforeEach: ({ parameters }) => {
    if (!parameters.touchScreen) return
    const realMatchMedia = window.matchMedia
    window.matchMedia = (query) =>
      query === TOUCH_SCREEN_QUERY
        ? matchingQuery(query)
        : realMatchMedia.call(window, query)
    return () => {
      window.matchMedia = realMatchMedia
    }
  },
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
          'UI',
          'Shell',
          'Task detail',
          [
            'Page',
            'Summary',
            'Layout',
            'Overview',
            'Quotes',
            'Analytics',
            'Parts',
          ],
          'Search',
          'Tasks',
          'My tasks',
          'Create task',
          'Quote flow',
          'Review flow',
          'Edit task',
          'Messages',
          'Dashboard',
          'Worker setup',
          'Worker profile',
          'Workers',
          'Public profile',
          'Auth',
          'Marketing',
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
