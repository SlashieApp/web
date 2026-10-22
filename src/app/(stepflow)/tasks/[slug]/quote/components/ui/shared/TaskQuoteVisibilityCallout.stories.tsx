import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { QUOTE_ZH_HK, withQuoteZhHk } from '../../taskQuoteStoryFixtures'
import { TaskQuoteVisibilityCallout } from './TaskQuoteVisibilityCallout'

const meta: Meta<typeof TaskQuoteVisibilityCallout> = {
  title: 'Quote flow/TaskQuoteVisibilityCallout',
  component: TaskQuoteVisibilityCallout,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Review step: anyone sees the price, times and message; only the customer sees who. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        'Once you send it, anyone can see your price, times and message. Only the customer sees your name and profile.',
      ),
    ).toBeVisible()
    await expect(canvas.getByText('Who sees your quote')).toBeVisible()
    await expect(canvas.queryByText(/private/i)).toBeNull()
  },
}

/** The same note in zh-HK. */
export const ZhHk: Story = {
  parameters: QUOTE_ZH_HK,
  decorators: [withQuoteZhHk],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        '送出後，任何人都可以看到你的價錢、時間和留言。只有顧客會看到你的名字和個人檔案。',
      ),
    ).toBeVisible()
  },
}
