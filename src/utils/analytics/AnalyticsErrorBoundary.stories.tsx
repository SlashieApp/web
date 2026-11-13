import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { stubLocalStorage } from '@/app/storyLocalStorage.testing'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'
import { APP_HOME } from '@/utils/appRoutes'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'

/** A child that always fails to render, so the boundary shows its message. */
function Broken(): never {
  throw new Error('Story-only render error')
}

const meta = {
  title: 'Auth/Status/AnalyticsErrorBoundary',
  component: AnalyticsErrorBoundary,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { children: <Broken /> },
  beforeEach: () => {
    // The boundary reports the error with `capture`, which only queues it in
    // memory unless analytics were accepted: start with nothing stored.
    const restoreStorage = stubLocalStorage()
    // On an app route that needs the API it sends the visitor to the landing
    // page instead of showing the card. Show it as on a public browse page.
    const { pathname, search } = window.location
    window.history.replaceState(null, '', APP_HOME)
    return () => {
      window.history.replaceState(null, '', `${pathname}${search}`)
      restoreStorage()
    }
  },
} satisfies Meta<typeof AnalyticsErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

const cardOf = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('alert', { name: 'Something went wrong' })

/** A page failed to render: the shared status card (R6), centred, 448 wide. */
export const Default: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Try again' })
    expectWindowWidth(canvasElement, 1366)
    expectCentredCardBox(canvasElement, cardOf(canvasElement), 'card', {
      alert: true,
    })
    expectPx(boxOf(cardOf(canvasElement)).width, 448)
  },
}

/** Phone: the card is the container, 358 wide at 390. */
export const Phone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Try again' })
    expectWindowWidth(canvasElement, 390)
    expectCentredCardBox(canvasElement, cardOf(canvasElement), 'card', {
      alert: true,
    })
    expectPx(boxOf(cardOf(canvasElement)).width, 358)
  },
}

/** Try again renders the children once more (here they fail again). */
export const Retry: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Try again' }),
    )
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Try again' }),
    ).toBeVisible()
  },
}

/** FE-541: the error page's own words, and Search beside Try again. */
export const SameWordsAsErrorPage: Story = {
  play: async ({ canvasElement }) => {
    const card = cardOf(canvasElement)
    await expect(card).toHaveTextContent(
      "Sorry, this page didn't load. Try again, or head back to search.",
    )
    await expect(
      within(card).getByRole('link', { name: 'Search tasks' }),
    ).toBeVisible()
  },
}

/** FE-541: in Chinese, from the `/zh-hk` prefix, like the error page. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('alert', {
      name: '出了點問題',
    })
    await expect(card).toHaveTextContent('抱歉，此頁面未能載入。')
    await expect(
      within(card).getByRole('button', { name: '再試一次' }),
    ).toBeVisible()
  },
}
