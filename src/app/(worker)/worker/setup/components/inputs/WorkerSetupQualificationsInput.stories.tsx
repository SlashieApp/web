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
  title: 'worker/setup/WorkerSetupQualificationsInput',
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

export const Empty: Story = {
  args: { value: [], onChange: () => {} },
}

export const WithSelection: Story = {
  args: {
    value: ['City & Guilds', 'Gas Safe', 'Fully Insured'],
    onChange: () => {},
  },
}
