import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { expect, within } from 'storybook/test'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  CreateTaskLocationSection,
  type CreateTaskLocationSectionProps,
} from './CreateTaskLocationSection'

function CreateTaskLocationSectionDemo(
  props: Omit<CreateTaskLocationSectionProps, 'register' | 'onUsePinAddress'>,
) {
  const { register, setValue } = useForm<CreateTaskFormFieldValues>()
  return (
    <CreateTaskLocationSection
      {...props}
      register={register}
      onUsePinAddress={() => setValue('streetAddress', props.pinAddress ?? '')}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskLocationSection',
  component: CreateTaskLocationSectionDemo,
  parameters: { layout: 'padded' },
  args: {
    publicArea: 'Watford',
  },
} satisfies Meta<typeof CreateTaskLocationSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Area known: workers see the town, the exact address is still to enter. */
export const Default: Story = {}

/** The area is still being looked up: the pill reads "Move the map". */
export const AreaLookingUp: Story = { args: { publicArea: '' } }

/** FE-209: copy the pin's street address into Exact address. */
export const WithPinAddress: Story = {
  args: { pinAddress: '12 Clarendon Road, Watford WD17 1JJ, United Kingdom' },
}

/** Current location denied or unavailable: a hint says to search or drag. */
export const LocateUnavailable: Story = {
  args: { publicArea: '', locateUnavailable: true },
}

/** Continue pressed without an address or a pin: both messages show. */
export const WithErrors: Story = {
  args: {
    publicArea: '',
    streetAddressError: 'Enter your exact address.',
    locationError: 'Search or move the map to set your task area.',
  },
}

/** Phones, compact panel: the area and an Add exact address row. */
export const Compact: Story = {
  args: { compact: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Workers will see: Watford')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Add exact address' }),
    ).toBeVisible()
  },
}

/** Compact, area still being looked up. */
export const CompactAreaLookingUp: Story = {
  args: { compact: true, publicArea: '' },
}

/** Compact with an address typed: the row shows it, with an edit pencil. */
export const CompactWithAddress: Story = {
  args: { compact: true, streetAddress: '12 QA Test Street' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', {
        name: 'Edit exact address: 12 QA Test Street',
      }),
    ).toHaveTextContent('12 QA Test Street')
  },
}

/** Compact after Continue without an address or a pin: both messages show. */
export const CompactWithErrors: Story = {
  args: {
    compact: true,
    publicArea: '',
    streetAddressError: 'addressRequired',
    locationError: 'locationMissing',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Add the exact address.')).toBeVisible()
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Search or move the map to set the area.',
    )
  },
}
