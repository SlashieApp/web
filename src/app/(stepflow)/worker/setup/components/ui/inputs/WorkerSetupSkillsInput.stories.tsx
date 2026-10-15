import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  WorkerSetupSkillsInput,
  type WorkerSetupSkillsInputProps,
} from './WorkerSetupSkillsInput'

function ControlledSkillsInput(
  props: Omit<WorkerSetupSkillsInputProps, 'onChange'>,
) {
  const [skills, setSkills] = useState(props.value)
  return (
    <WorkerSetupSkillsInput {...props} value={skills} onChange={setSkills} />
  )
}

const meta = {
  title: 'Worker setup/WorkerSetupSkillsInput',
  component: WorkerSetupSkillsInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <ControlledSkillsInput {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupSkillsInputProps>

export default meta

type Story = StoryObj<typeof meta>

/** Empty: the field, the 0 / 12 counter and the default suggestions. */
export const Empty: Story = {
  args: { value: [], onChange: () => {} },
}

/** Three chosen: they leave the suggestions and show as removable chips. */
export const WithSelection: Story = {
  args: {
    value: ['Furniture Assembly', 'TV Mounting', 'Shelving'],
    onChange: () => {},
  },
}

/** Continue pressed with fewer than three skills: the error shows. */
export const BelowMinimumError: Story = {
  args: {
    value: ['Painting'],
    onChange: () => {},
    errorText:
      'Add at least 3 skills so customers can find you for the right tasks.',
  },
}

/** Twelve chosen: the field, Add button and suggestions are all gone. */
export const AtCap: Story = {
  args: {
    value: [
      'Furniture Assembly',
      'TV Mounting',
      'Shelving',
      'Door Repairs',
      'Flat-pack',
      'Painting',
      'Plumbing Repairs',
      'Electrical Fixes',
      'Garden Tidy-up',
      'Deep Cleaning',
      'Removals',
      'Tiling',
    ],
    onChange: () => {},
  },
}

/** A plumber's suggestions: the chips follow the chosen trade. */
export const TradeSuggestions: Story = {
  args: {
    value: ['Tap Repairs'],
    suggestions: [
      'Tap Repairs',
      'Leak Fixes',
      'Toilet Installs',
      'Radiator Bleeding',
      'Shower Fitting',
      'Waste Unblocking',
    ],
    onChange: () => {},
  },
}

/** Skills near the 30 character limit: the long chips wrap onto new rows. */
export const LongSkills: Story = {
  args: {
    value: [
      'Bathroom suite fitting service',
      'Kitchen worktop installation',
      'Underfloor heating repairs',
    ],
    onChange: () => {},
  },
}
