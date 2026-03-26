import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { RegisterMarketingPanel } from './RegisterMarketingPanel'

const meta = {
  title: 'ui/RegisterMarketingPanel',
  component: RegisterMarketingPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RegisterMarketingPanel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
