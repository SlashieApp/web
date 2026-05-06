import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Select } from './Select'

const meta = {
  title: 'ui/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    rootProps: { maxW: '320px' },
    children: (
      <>
        <option value="flexible">Flexible</option>
        <option value="before">Before a date</option>
        <option value="exact">Exact date and time</option>
      </>
    ),
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: 'flexible',
  },
}

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Choose an option',
    defaultValue: '',
  },
}
