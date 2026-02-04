import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { UiButton } from './Button'

const meta: Meta<typeof UiButton> = {
  title: 'UI/Atoms/Button',
  component: UiButton,
  args: {
    children: 'Button',
  },
}

export default meta

type Story = StoryObj<typeof UiButton>

export const Primary: Story = {
  args: {
    colorPalette: 'orange',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const Glass: Story = {
  args: {
    variant: 'outline',
    background: 'glassBg',
    borderColor: 'glassBorder',
    backdropFilter: 'blur(10px)',
  },
}
