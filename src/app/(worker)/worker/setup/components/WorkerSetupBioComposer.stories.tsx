import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  WorkerSetupBioComposer,
  type WorkerSetupBioComposerProps,
} from './WorkerSetupBioComposer'

function ControlledComposer(
  props: Omit<WorkerSetupBioComposerProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return <WorkerSetupBioComposer {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'form/WorkerSetupBioComposer',
  component: WorkerSetupBioComposer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <ControlledComposer {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupBioComposerProps>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { value: '', onChange: () => {} },
}

export const TooShort: Story = {
  args: { value: 'I do handyman jobs around London.', onChange: () => {} },
}

export const Great: Story = {
  args: {
    value:
      'I fit and repair kitchens and bathrooms across North London, with 8 years on the tools. Customers choose me for tidy work, honest quotes and turning up when I say I will. Fully insured and City & Guilds qualified.',
    onChange: () => {},
  },
}

export const RejectedJunk: Story = {
  args: {
    value: 'o',
    onChange: () => {},
    errorText:
      'Write at least 80 characters — customers read this before accepting your quote.',
  },
}
