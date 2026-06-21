import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button, type UiButtonVariant } from './Button'

const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

const variantLabels: Record<UiButtonVariant, string> = {
  primary: 'Post a task',
  secondary: 'Save draft',
  tertiary: 'View details',
  outline: 'Filter tasks',
  ghost: 'Dismiss',
  subtle: 'Learn more',
  success: 'Confirm booking',
  danger: 'Cancel task',
}

function variantStory(variant: UiButtonVariant): Story {
  return {
    render: () => <Button variant={variant}>{variantLabels[variant]}</Button>,
  }
}

export const Primary = variantStory('primary')
export const Secondary = variantStory('secondary')
export const Tertiary = variantStory('tertiary')
export const Outline = variantStory('outline')
export const Ghost = variantStory('ghost')
export const Subtle = variantStory('subtle')
export const Success = variantStory('success')
export const Danger = variantStory('danger')
