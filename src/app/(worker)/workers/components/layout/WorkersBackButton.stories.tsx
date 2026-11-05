import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'

import { WorkersBackButton } from './WorkersBackButton'

/**
 * Workers is not a nav page: below lg the map carries a Back arrow at its top
 * left, frosted over the map. It sits in the page container, so it starts on
 * the logo line (R1). The story stands in for the map: a positioned band.
 */
const meta = {
  title: 'Workers/WorkersBackButton',
  component: WorkersBackButton,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Box position="relative" h="160px" bg="bg.subtle">
      <WorkersBackButton />
    </Box>
  ),
} satisfies Meta<typeof WorkersBackButton>

export default meta
type Story = StoryObj<typeof meta>

/** Phone: the arrow is on the 16 gutter. */
export const Phone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 390)
    const back = await within(canvasElement).findByRole('button', {
      name: 'Back',
    })
    expectPx(boxOf(back).left, lines(canvasElement).logo)
    expectPx(boxOf(back).left, 16)
  },
}

/** Tablet portrait: the gutter is 24. */
export const Tablet: Story = {
  ...viewportAt(820),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 820)
    const back = await within(canvasElement).findByRole('button', {
      name: 'Back',
    })
    expectPx(boxOf(back).left, lines(canvasElement).logo)
    expectPx(boxOf(back).left, 24)
  },
}

/** From lg the header nav takes over, so there is no button. */
export const HiddenFromLg: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1366)
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Back' }),
    ).toBeNull()
  },
}
