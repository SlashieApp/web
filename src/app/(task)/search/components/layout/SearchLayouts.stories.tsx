import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WebSearchLayout } from './SearchLayouts'

const meta: Meta<typeof WebSearchLayout> = {
  title: 'task/search/layout/SearchLayouts',
  component: WebSearchLayout,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
