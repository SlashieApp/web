import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'

import { FormField } from '../FormField'
import { gapBelow } from '../FormField/formGap.testing'
import { Textarea } from './Textarea'

const meta = {
  title: 'UI/Textarea',
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

/** Playground driven by the Controls panel (placeholder, rows, states). */
export const Playground: Story = {}

/** Overview: every state at a glance, in both themes via the toolbar. */
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

/** Default: an empty field showing its placeholder. */
export const Default: Story = {}

/** Disabled: muted surface and text, not focusable. */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This job has already been awarded.',
  },
}

/** Read only: focusable and selectable, but not editable. */
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

/** Focus: the field starts focused, showing the SDL focus ring. */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox')
    field.focus()
    await expect(field).toHaveFocus()
  },
}

/** With label: a persistent `<label>` plus helper text from `FormField`. */
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

/** With error: `FormField` ties the message via `aria-describedby`. */
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

/** Filled: a short brief already entered in the field. */
export const Filled: Story = {
  args: {
    defaultValue:
      'Need a leaking kitchen tap fixed, ideally this week. Side gate access available.',
  },
}

/** Long text: content past the visible rows scrolls inside the field. */
export const LongText: Story = {
  args: {
    defaultValue: [
      'The kitchen tap has been dripping for about two weeks and the drip is getting faster.',
      'It is a mixer tap on a granite worktop, so please bring a basin wrench in case the nuts are awkward to reach.',
      'Access is through the side gate (code 4821), and the isolation valve under the sink is stiff.',
      'I work from home on weekdays, so any morning before eleven is fine.',
      'There is also a small leak from the dishwasher hose that I would like looked at while you are here.',
      'Parking is available on the drive, and please ring the bell once rather than knocking.',
    ].join('\n\n'),
  },
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

/** Story-only counter field, so the limit state can start pre-filled. */
function CharCountField({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
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
}

const LIMIT_TEXT =
  'I have fixed taps, boilers and radiators across north London for twelve years. '
    .repeat(4)
    .slice(0, 300)

/** Character limit reached: the counter reads 300 / 300 and typing stops. */
export const CharCountAtLimit: Story = {
  render: () => <CharCountField initial={LIMIT_TEXT} />,
}

/**
 * Form spacing (FE-481): a textarea is a block, so its helper is 4 under the
 * box itself, not 11 (a descender's worth of room under an inline-block).
 */
export const HelperSitsFourUnder: Story = {
  render: (args) => (
    <Box maxW="480px">
      <FormField label="Details" helperText="Add anything workers should know.">
        <Textarea {...args} />
      </FormField>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      gapBelow(
        canvas.getByRole('textbox'),
        canvas.getByText('Add anything workers should know.'),
      ),
    ).toBe(formSpace.controlToHelper)
  },
}
