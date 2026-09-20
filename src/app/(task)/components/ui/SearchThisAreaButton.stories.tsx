import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SearchThisAreaButton } from './SearchThisAreaButton'

const meta: Meta<typeof SearchThisAreaButton> = {
  title: 'task/ui/SearchThisAreaButton',
  component: SearchThisAreaButton,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    visible: true,
    enabled: true,
    onClick: () => {},
  },
}
