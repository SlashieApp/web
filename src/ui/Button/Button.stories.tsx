import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Atoms/Button',
  component: Button,
  args: {
    children: 'Button',
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const PrimaryBlue: Story = {
  args: {
    colorPalette: 'linkBlue',
  },
}

export const AccentMustard: Story = {
  args: {
    background: 'mustard.500',
    color: 'black',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    borderColor: 'border',
  },
}

export const Surface: Story = {
  args: {
    variant: 'outline',
    background: 'glassBg',
    borderColor: 'glassBorder',
  },
}
