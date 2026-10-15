import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskQuoteHeader } from './TaskQuoteHeader'

const meta: Meta<typeof TaskQuoteHeader> = {
  title: 'Quote flow/TaskQuoteHeader',
  component: TaskQuoteHeader,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    exitHref: '/tasks/example',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Desktop: close button, logo and a centred title. */
export const Default: Story = {}

/** Phones: a shorter bar with the title left-aligned. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
