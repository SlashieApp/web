import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'

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
  title: 'stepflow/tasks/create/ui/sections/CreateTaskLocationSection',
  component: CreateTaskLocationSectionDemo,
  parameters: { layout: 'padded' },
  args: {
    publicArea: 'Watford',
  },
} satisfies Meta<typeof CreateTaskLocationSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AreaLookingUp: Story = { args: { publicArea: '' } }

/** FE-209: copy the pin's street address into Exact address. */
export const WithPinAddress: Story = {
  args: { pinAddress: '12 Clarendon Road, Watford WD17 1JJ, United Kingdom' },
}

export const LocateUnavailable: Story = {
  args: { publicArea: '', locateUnavailable: true },
}

export const WithErrors: Story = {
  args: {
    publicArea: '',
    streetAddressError: 'Enter your exact address.',
    locationError: 'Search or move the map to set your task area.',
  },
}
