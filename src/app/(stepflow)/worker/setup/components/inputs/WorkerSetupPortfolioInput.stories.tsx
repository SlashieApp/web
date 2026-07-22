import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  WorkerSetupPortfolioInput,
  type WorkerSetupPortfolioInputProps,
} from './WorkerSetupPortfolioInput'

function ControlledPortfolio(
  props: Omit<WorkerSetupPortfolioInputProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return (
    <WorkerSetupPortfolioInput {...props} value={value} onChange={setValue} />
  )
}

const meta = {
  title: 'worker/setup/WorkerSetupPortfolioInput',
  component: WorkerSetupPortfolioInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <ControlledPortfolio {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupPortfolioInputProps>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { value: [], onChange: () => {} },
}

export const WithItems: Story = {
  args: {
    value: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
      'https://example.com/not-an-image',
    ],
    onChange: () => {},
  },
}
