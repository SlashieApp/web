import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  WorkerSetupCategoryTiles,
  type WorkerSetupCategoryTilesProps,
} from './WorkerSetupCategoryTiles'

function ControlledTiles(
  props: Omit<WorkerSetupCategoryTilesProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return (
    <WorkerSetupCategoryTiles {...props} value={value} onChange={setValue} />
  )
}

const meta = {
  title: 'form/WorkerSetupCategoryTiles',
  component: WorkerSetupCategoryTiles,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <ControlledTiles {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupCategoryTilesProps>

export default meta

type Story = StoryObj<typeof meta>

export const Unselected: Story = {
  args: { value: '', onChange: () => {} },
}

export const HandymanSelected: Story = {
  args: { value: 'handyman', onChange: () => {} },
}

export const RequiredError: Story = {
  args: {
    value: '',
    onChange: () => {},
    errorText: 'Choose the kind of work you do most.',
  },
}
