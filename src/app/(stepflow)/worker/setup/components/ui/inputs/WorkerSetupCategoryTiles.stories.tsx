import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { expect, userEvent, within } from 'storybook/test'

import { ZH_HK_SETUP, withZhHk } from '../../workerSetupStoryFixtures'
import {
  WorkerSetupCategoryTiles,
  type WorkerSetupCategoryTilesProps,
} from './WorkerSetupCategoryTiles'

function ControlledTiles(
  props: Omit<WorkerSetupCategoryTilesProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return (
    <WorkerSetupCategoryTiles
      {...props}
      value={value}
      onChange={(slug) => setValue(slug)}
    />
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

const label = 'What kind of work do you do most?'

/** Nothing picked yet; picking a tile checks it. */
export const Unselected: Story = {
  args: { label, value: '', onChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group', { name: label })
    await userEvent.click(
      within(group).getByRole('radio', { name: 'Plumbing' }),
    )
    await expect(canvas.getByRole('radio', { name: 'Plumbing' })).toBeChecked()
  },
}

/** One trade picked: its tile is outlined and tinted. */
export const HandymanSelected: Story = {
  args: { label, value: 'handyman', onChange: () => {} },
}

/** Continue pressed with no trade: the error shows under the grid. */
export const RequiredError: Story = {
  args: {
    label,
    value: '',
    onChange: () => {},
    errorText: 'Choose the kind of work you do most.',
  },
}

/** Phones: two tiles per row instead of three. */
export const Mobile: Story = {
  args: { label, value: 'plumbing', onChange: () => {} },
  globals: { viewport: { value: 'mobile1' } },
}

/** zh-HK: trade names in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: ZH_HK_SETUP,
  decorators: [withZhHk],
  args: { label: '你最常做哪類工作？', value: 'cleaning', onChange: () => {} },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('radio', { name: '清潔' }),
    ).toBeChecked()
  },
}
