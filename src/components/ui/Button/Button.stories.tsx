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
