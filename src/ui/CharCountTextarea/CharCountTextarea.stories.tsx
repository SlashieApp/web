import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { FormField } from '../FormField/FormField'
import { formControlLabelProps } from '../formControlStyles'
import { CharCountTextarea } from './CharCountTextarea'

const meta = {
  title: 'form/CharCountTextarea',
  component: CharCountTextarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    value: '',
    maxLength: 300,
    placeholder:
      'Tell customers about your experience, skills, and what makes you great to work with.',
    rows: 6,
  },
} satisfies Meta<typeof CharCountTextarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function CharCountTextareaStory() {
    const [value, setValue] = useState('')
    return (
      <Stack maxW="560px" gap={4}>
        <FormField label="Short bio" labelProps={formControlLabelProps}>
          <CharCountTextarea
            value={value}
            maxLength={300}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tell customers about your experience, skills, and what makes you great to work with. Keep it clear and friendly."
            rows={6}
          />
        </FormField>
      </Stack>
    )
  },
}
