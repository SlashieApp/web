import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import RootError from './error'

/**
 * Story-only: a private, in-memory `localStorage` for this page. The real one
 * is shared by every test file running at once and survives between visits,
 * and an "accepted" cookie choice would let the next `capture()` start PostHog
 * with the production token, so these stories never touch it.
 */
function stubLocalStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  const storage: Storage = {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key)
    },
    setItem: (key, value) => {
      data.set(key, String(value))
    },
  }
  const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: storage,
  })
  return () => {
    if (original) Object.defineProperty(window, 'localStorage', original)
    else Reflect.deleteProperty(window, 'localStorage')
  }
}

const meta = {
  title: 'Shell/RootError',
  component: RootError,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    error: new Error('Something broke while loading the page'),
    reset: fn(),
  },
  // The boundary reports the error with `capture`, which only queues it in
  // memory unless analytics were accepted: start with nothing stored.
  beforeEach: () => stubLocalStorage(),
} satisfies Meta<typeof RootError>

export default meta
type Story = StoryObj<typeof meta>

/** Root error boundary: branded message with a primary Try again and a link to search. */
export const Default: Story = {}

/** Clicking Try again calls the boundary's `reset` once. */
export const Retry: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Try again' }),
    )
    await expect(args.reset).toHaveBeenCalledTimes(1)
  },
}

/** Phone width: the card keeps its 1rem page gutters. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/search' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
}
