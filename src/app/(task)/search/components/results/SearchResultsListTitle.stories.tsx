import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SearchResultsListTitle } from './SearchResultsListTitle'

const meta: Meta<typeof SearchResultsListTitle> = {
  title: 'Search/SearchResultsListTitle',
  component: SearchResultsListTitle,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
