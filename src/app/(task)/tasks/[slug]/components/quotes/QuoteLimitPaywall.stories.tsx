import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { QuoteLimitPaywall } from './QuoteLimitPaywall'

/** Shown to a worker who has used every free quote this month. */
const meta = {
  title: 'Task detail/Quotes/QuoteLimitPaywall',
  component: QuoteLimitPaywall,
  parameters: { layout: 'padded' },
  // Mid-October, so the free quotes reset on 1 November.
  args: { now: new Date(Date.UTC(2026, 9, 16, 12)) },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteLimitPaywall>

export default meta
type Story = StoryObj<typeof meta>

/** The Slashie Unlimited offer, the reset date and a Go unlimited button. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        'Quote on as many tasks as you like. Your free quotes reset on 1 Nov 2026.',
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Go unlimited' }),
    ).toHaveAttribute('href', '/billing')
  },
}

/** zh-HK: the same card in Chinese, with a zh-HK date. */
export const ZhHk: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/zh-hk/tasks/task-1/quote' } },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        '可為任何數量的任務報價。你的免費報價於 2026年11月1日 重設。',
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: '升級為無限報價' }),
    ).toHaveAttribute('href', '/zh-hk/billing')
  },
}

/** Phone width: the same card full width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
