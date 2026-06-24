import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { FormField } from '../FormField'
import { Textarea } from './Textarea'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    'aria-invalid': {
      control: 'boolean',
      name: 'invalid',
      description: 'Render the error border treatment.',
    },
  },
  args: {
    placeholder: 'What needs doing, access details, and preferred timing?',
    rows: 4,
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * Every state at a glance — renders correctly under both the light and dark
 * theme toolbar (no hardcoded mode). Tab into the default field to see the
 * SDL focus ring.
 */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5} maxW="480px">
      <Box>
        <Text fontSize="xs" color="text.muted" mb={1}>
          Default
        </Text>
        <Textarea placeholder="Tell us what needs doing" rows={3} />
      </Box>
      <Box>
        <Text fontSize="xs" color="text.muted" mb={1}>
          Filled
        </Text>
        <Textarea
          defaultValue="Need a leaking kitchen tap fixed, ideally this week. Side gate access available."
          rows={3}
        />
      </Box>
      <Box>
        <Text fontSize="xs" color="text.muted" mb={1}>
          Disabled
        </Text>
        <Textarea
          disabled
          defaultValue="This job has already been awarded."
          rows={3}
        />
      </Box>
      <Box>
        <Text fontSize="xs" color="text.muted" mb={1}>
          Read only
        </Text>
        <Textarea
          readOnly
          defaultValue="Submitted brief, no longer editable."
          rows={3}
        />
      </Box>
      <Box>
        <Text fontSize="xs" color="text.muted" mb={1}>
          Invalid
        </Text>
        <Textarea
          aria-invalid
          defaultValue="Too short"
          rows={3}
          placeholder="Describe the job"
        />
      </Box>
    </Stack>
  ),
}

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This job has already been awarded.',
  },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'Submitted brief, no longer editable.',
  },
}

/** Standalone error border treatment via `aria-invalid`. */
export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: 'Too short',
  },
}

/** Tab into the field to see the visible SDL focus ring (`border.focus`). */
export const Focus: Story = {
  parameters: { pseudo: { focusVisible: true } },
}

/**
 * Paired with {@link FormField} for a persistent `<label>` — never rely on the
 * placeholder as the label.
 */
export const WithLabel: Story = {
  render: () => (
    <Box maxW="480px">
      <FormField
        label="Task description"
        helperText="Include access details and preferred timing."
      >
        <Textarea placeholder="What needs doing?" rows={4} />
      </FormField>
    </Box>
  ),
}

/**
 * Error message is tied to the field via `aria-describedby` / `aria-invalid`
 * (wired by {@link FormField}), so assistive tech announces it.
 */
export const WithError: Story = {
  render: () => (
    <Box maxW="480px">
      <FormField
        label="Task description"
        errorText="Please add at least 20 characters so workers can quote."
        required
      >
        <Textarea placeholder="What needs doing?" rows={4} />
      </FormField>
    </Box>
  ),
}

/** Controlled usage with a live character counter. */
export const WithCharCount: Story = {
  render: function WithCharCountStory() {
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
          color="text.muted"
          pointerEvents="none"
          aria-hidden
        >
          {value.length} / {maxLength}
        </Text>
      </Box>
    )
  },
}
