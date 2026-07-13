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
  title: 'form/WorkerSetupSkillsInput',
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

export const Empty: Story = {
  args: { value: [], onChange: () => {} },
}

export const WithSelection: Story = {
  args: {
    value: ['Furniture Assembly', 'TV Mounting', 'Shelving'],
    onChange: () => {},
  },
}

export const BelowMinimumError: Story = {
  args: {
    value: ['Painting'],
    onChange: () => {},
    errorText:
      'Add at least 3 skills so customers can find you for the right tasks.',
  },
}

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
