import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { expectGaps } from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import { CreateTaskLocationSection } from './CreateTaskLocationSection'

/**
 * The pin's public side: the area chip on the location step's card (and on
 * edit, under the small map). The exact address is
 * `Create task/CreateTaskAddressSection`.
 */
const meta = {
  title: 'Create task/CreateTaskLocationSection',
  component: CreateTaskLocationSection,
  parameters: { layout: 'padded' },
  args: {
    publicArea: 'Watford',
  },
} satisfies Meta<typeof CreateTaskLocationSection>

export default meta
type Story = StoryObj<typeof meta>

/** Area known: the chip says what workers will see. No address field here. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Workers will see: Watford')).toBeVisible()
    await expect(canvas.queryByLabelText(/Exact address/)).toBeNull()
  },
}

/** The area is still being looked up: the chip says to move the map. */
export const AreaLookingUp: Story = {
  args: { publicArea: '' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Move the map to set the area.'),
    ).toBeVisible()
  },
}

/** Current location denied or unavailable: a hint says to search or drag. */
export const LocateUnavailable: Story = {
  args: { publicArea: '', locateUnavailable: true },
}

/** A searched place the map can't find: search again or move the map. */
export const PlaceNotFound: Story = {
  args: { publicArea: '', locationError: 'placeNotFound' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
      "We couldn't find that place. Search again or move the map to set the pin.",
    )
  },
}

/** Continue pressed with no pin or place: the area message shows. */
export const WithError: Story = {
  args: { publicArea: '', locationError: 'locationMissing' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
      'Search or move the map to set the area.',
    )
  },
}

/**
 * Form spacing (FE-481): the privacy note, the area chip, the hint and the error
 * are notes in a form: field groups, 20 apart.
 */
export const Spacing: Story = {
  args: {
    publicArea: 'Watford',
    privacyCallout: true,
    locateUnavailable: true,
    locationError: 'placeNotFound',
  },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByText(/Workers will see/)
    const column = chip.closest('[aria-live]')?.parentElement as HTMLElement
    await expect(column.children).toHaveLength(4)
    await expectGaps([...column.children], formSpace.fieldGap)
  },
}
