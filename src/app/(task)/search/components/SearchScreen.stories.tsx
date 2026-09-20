import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SearchScreen } from './SearchScreen'

const meta: Meta<typeof SearchScreen> = {
  title: 'task/search/SearchScreen',
  component: SearchScreen,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
