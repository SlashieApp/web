import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  CreateTaskLocationSection,
  type CreateTaskLocationSectionProps,
} from './CreateTaskLocationSection'

function CreateTaskLocationSectionDemo(
  props: Omit<CreateTaskLocationSectionProps, 'register'>,
) {
  const { register } = useForm<CreateTaskFormFieldValues>()
  return <CreateTaskLocationSection {...props} register={register} />
}

const meta = {
  title: 'stepflow/tasks/create/ui/sections/CreateTaskLocationSection',
  component: CreateTaskLocationSectionDemo,
  parameters: { layout: 'padded' },
  args: {
    mapPlaceName: 'Watford, Hertfordshire, England, United Kingdom',
  },
} satisfies Meta<typeof CreateTaskLocationSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoPinYet: Story = { args: { mapPlaceName: '' } }

export const LocateUnavailable: Story = {
  args: { mapPlaceName: '', locateUnavailable: true },
}

export const WithErrors: Story = {
  args: {
    mapPlaceName: '',
    streetAddressError: 'Enter your exact address.',
    locationError: 'Search or move the map to set your task area.',
  },
}
