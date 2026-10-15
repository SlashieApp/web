import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  WorkerSetupQualificationsInput,
  type WorkerSetupQualificationsInputProps,
} from './WorkerSetupQualificationsInput'

function ControlledQualifications(
  props: Omit<WorkerSetupQualificationsInputProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return (
    <WorkerSetupQualificationsInput
      {...props}
      value={value}
      onChange={setValue}
    />
  )
}

const meta = {
  title: 'Worker setup/WorkerSetupQualificationsInput',
  component: WorkerSetupQualificationsInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <ControlledQualifications {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupQualificationsInputProps>

export default meta

type Story = StoryObj<typeof meta>

/** Empty: the optional label, the field and every suggested qualification. */
export const Empty: Story = {
  args: { value: [], onChange: () => {} },
}

/** Three chosen: they leave the suggestions and show as removable chips. */
export const WithSelection: Story = {
  args: {
    value: ['City & Guilds', 'Gas Safe', 'NICEIC'],
    onChange: () => {},
  },
}

/** Ten chosen: the field, Add button and suggestions are all gone. */
export const AtCap: Story = {
  args: {
    value: [
      'City & Guilds',
      'Gas Safe',
      'NICEIC',
      'NVQ',
      'CSCS Card',
      'Part P',
      'First Aid at Work',
      'Working at Height',
      'Asbestos Awareness',
      'Public Liability Insurance',
    ],
    onChange: () => {},
  },
}

/** Qualifications near the 40 character limit: the long chips wrap onto new rows. */
export const LongQualifications: Story = {
  args: {
    value: [
      'City & Guilds Level 3 Electrical Install',
      'Gas Safe registered, domestic boilers',
    ],
    onChange: () => {},
  },
}
