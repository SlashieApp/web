import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { expect, userEvent, within } from 'storybook/test'

import {
  expectPieces,
  fieldByLabel,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  CreateTaskAddressSection,
  type CreateTaskAddressSectionProps,
} from './CreateTaskAddressSection'

function CreateTaskAddressSectionDemo({
  streetAddress = '',
  usePinAddress = true,
  ...props
}: Omit<CreateTaskAddressSectionProps, 'register' | 'onUsePinAddress'> & {
  /** The address already typed (or restored from a draft). */
  streetAddress?: string
  /** Offer "Use pin address" (edit hides it until the pin moves). */
  usePinAddress?: boolean
}) {
  const { register, setValue } = useForm<CreateTaskFormFieldValues>({
    defaultValues: { streetAddress },
  })
  return (
    <CreateTaskAddressSection
      {...props}
      register={register}
      onUsePinAddress={
        usePinAddress
          ? () => setValue('streetAddress', props.pinAddress ?? '')
          : undefined
      }
    />
  )
}

const PIN_ADDRESS = '12 Clarendon Road, Watford WD17 1JJ, United Kingdom'

/**
 * The exact address: private until the poster accepts a worker. The create
 * flow's address step and the edit page's Location group both use it.
 */
const meta = {
  title: 'Create task/CreateTaskAddressSection',
  component: CreateTaskAddressSectionDemo,
  parameters: { layout: 'padded' },
  args: { pinAddress: PIN_ADDRESS },
} satisfies Meta<typeof CreateTaskAddressSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Create's address step, nothing typed yet: the locked label, the field and Use pin address. */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText(/Exact address/)
    await expect(field).toHaveValue('')
    await expect(field).toBeRequired()
    await expect(field).not.toHaveAccessibleDescription()
  },
}

/** Edit's form: the privacy hint sits under the field (no step note says it there). */
export const WithPrivacyHint: Story = {
  args: {
    privacyHint: true,
    streetAddress: '12 Example Street, London SW1A 1AA',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByLabelText(/Exact address/),
    ).toHaveAccessibleDescription('Shared only with the worker you accept.')
  },
}

/** An address typed, or restored from a draft. */
export const Filled: Story = {
  args: { streetAddress: '12 Example Street, London SW1A 1AA' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByLabelText(/Exact address/),
    ).toHaveValue('12 Example Street, London SW1A 1AA')
  },
}

/** Continue with no address: the field says what's missing. */
export const WithError: Story = {
  args: { streetAddressError: 'addressRequired' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText(/Exact address/)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(field).toHaveAccessibleDescription(/Add the exact address\./)
  },
}

/** Use pin address fills the field from the pin, only when tapped. */
export const UsePinAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByLabelText(/Exact address/)
    await expect(field).toHaveValue('')
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use pin address' }),
    )
    await expect(field).toHaveValue(PIN_ADDRESS)
  },
}

/** The pin's address isn't known yet: Use pin address waits for it. */
export const NoPinAddressYet: Story = {
  args: { pinAddress: '' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Use pin address' }),
    ).toBeDisabled()
  },
}

/** Edit, before the pin has moved: no Use pin address (the label is a town). */
export const WithoutUsePinAddress: Story = {
  args: {
    usePinAddress: false,
    streetAddress: '12 Example Street, London SW1A 1AA',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: 'Use pin address' }),
    ).toBeNull()
  },
}

/**
 * Form spacing (FE-481): the label is 8 above the field, the "Use pin address"
 * button 8 under it, and the privacy hint 4 under the control. The field is 48
 * tall.
 */
export const Spacing: Story = {
  args: { privacyHint: true },
  play: async ({ canvasElement }) => {
    // The label is an icon and the words in a span: find the span, then its field.
    const field = within(canvasElement)
      .getByText(/Exact address/)
      .closest('label')?.parentElement as HTMLElement
    const { control, pieces } = await expectPieces(field)
    await expect(pieces).toHaveLength(2)
    await expect(pieces[0]?.getBoundingClientRect().height).toBe(
      formSpace.controlHeight,
    )
    await expect(
      gapBelow(
        control,
        within(field).getByText('Shared only with the worker you accept.'),
      ),
    ).toBe(formSpace.controlToHelper)
  },
}
