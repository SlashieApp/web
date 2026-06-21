import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Textarea } from './Textarea'

const meta = {
  title: 'ui/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const PostTaskDescription: Story = {
  render: () => (
    <Textarea
      placeholder="What needs doing, access details, and preferred timing?"
      rows={4}
    />
  ),
}

export const QuoteMessage: Story = {
  render: function QuoteMessageStory() {
    const [value, setValue] = useState('')
    return (
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Introduce yourself and explain how you’ll tackle the job."
        rows={4}
      />
    )
  },
}

export const WorkerBioWithCharCount: Story = {
  render: function WorkerBioStory() {
    const [value, setValue] = useState('')
    const maxLength = 300
    return (
      <Box position="relative" w="full" maxW="480px">
        <Textarea
          value={value}
          maxLength={maxLength}
          pb={10}
          rows={5}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tell customers about your experience, skills, and service area."
        />
        <Text
          position="absolute"
          bottom={3}
          right={4}
          fontSize="xs"
          color="formLabelMuted"
          pointerEvents="none"
          aria-hidden
        >
          {value.length} / {maxLength}
        </Text>
      </Box>
    )
  },
}
