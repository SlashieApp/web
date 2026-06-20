import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { CharCountTextarea } from '../CharCountTextarea/CharCountTextarea'
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

export const WithCharCount: Story = {
  render: function WithCharCountStory() {
    const [value, setValue] = useState('')
    return (
      <Box maxW="560px">
        <CharCountTextarea
          value={value}
          maxLength={300}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tell customers about your experience, skills, and what makes you great to work with."
          rows={6}
        />
      </Box>
    )
  },
}
