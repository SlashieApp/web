import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MarketingHeader } from './MarketingHeader'

const meta = {
  title: 'header/MarketingHeader',
  component: MarketingHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MarketingHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
