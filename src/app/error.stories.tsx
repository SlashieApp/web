import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'

import RootError from './error'
import { stubLocalStorage } from './storyLocalStorage.testing'

const meta = {
  title: 'Auth/Status/RootError',
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
export const Default: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1366)
    const card = within(canvasElement).getByRole('region', {
      name: 'Something went wrong',
    })
    // R6: the shared card, 448 wide, centred.
    expectCentredCardBox(canvasElement, card)
    expectPx(boxOf(card).width, 448)
  },
}

/** Clicking Try again calls the boundary's `reset` once. */
export const Retry: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Try again' }),
    )
    await expect(args.reset).toHaveBeenCalledTimes(1)
  },
}

/** Phone width: the card is the container, 358 wide at 390. */
export const Mobile: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 390)
    const card = within(canvasElement).getByRole('region', {
      name: 'Something went wrong',
    })
    expectCentredCardBox(canvasElement, card)
    expectPx(boxOf(card).width, 358)
  },
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
