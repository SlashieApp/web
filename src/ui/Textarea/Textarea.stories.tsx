import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Textarea } from './Textarea'

const meta = {
  title: 'ui/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    placeholder: 'Share your skills, experience, and the kind of work you do.',
  },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
