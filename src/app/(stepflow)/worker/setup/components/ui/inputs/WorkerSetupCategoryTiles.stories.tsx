import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { workerSetupStoryErrors } from '../../workerSetupStoryFixtures'
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
  title: 'Worker setup/WorkerSetupCategoryTiles',
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

/** Nothing picked yet: every tile is unselected. */
export const Unselected: Story = {
  args: { value: '', onChange: () => {} },
}

/** One trade picked: its tile is highlighted and pressed. */
export const HandymanSelected: Story = {
  args: { value: 'handyman', onChange: () => {} },
}

/** Continue pressed with no trade: the real error shows under the grid. */
export const RequiredError: Story = {
  args: {
    value: '',
    onChange: () => {},
    errorText: workerSetupStoryErrors('services.skills').primaryCategory,
  },
}

/** Phones: two tiles per row instead of three. */
export const Mobile: Story = {
  args: { value: 'plumbing', onChange: () => {} },
  globals: { viewport: { value: 'mobile1' } },
}
