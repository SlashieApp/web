import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { LoginMarketingPanel } from './LoginMarketingPanel'

const meta = {
  title: 'ui/LoginMarketingPanel',
  component: LoginMarketingPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LoginMarketingPanel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
