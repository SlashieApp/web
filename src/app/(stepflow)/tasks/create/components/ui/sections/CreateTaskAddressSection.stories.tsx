import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { expect, userEvent, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { parseExactAddress } from '../../../helpers/exactAddress'
import {
  CreateTaskAddressSection,
  type CreateTaskAddressSectionProps,
} from './CreateTaskAddressSection'

const FILLED = {
  addressLine1: '12 Example Street',
  addressLine2: '',
  city: 'London',
  county: '',
  postcode: 'SW1A 1AA',
}

function CreateTaskAddressSectionDemo({
  address = FILLED,
  usePinAddress = true,
  ...props
}: Omit<CreateTaskAddressSectionProps, 'register' | 'onUsePinAddress'> & {
  /** The lines already typed (or restored from a draft). */
  address?: Partial<CreateTaskFormFieldValues>
  /** Offer the pin's address (edit hides it until the pin moves). */
  usePinAddress?: boolean
}) {
  const { register, setValue } = useForm<CreateTaskFormFieldValues>({
    defaultValues: address,
  })
  return (
    <CreateTaskAddressSection
      {...props}
      register={register}
      onUsePinAddress={
        usePinAddress
          ? () => {
              const parsed = parseExactAddress(props.pinAddress ?? '')
              setValue('addressLine1', parsed.addressLine1)
              setValue('addressLine2', parsed.addressLine2)
              setValue('city', parsed.city)
              setValue('county', parsed.county)
              setValue('postcode', parsed.postcode)
            }
          : undefined
      }
    />
  )
}

const PIN_ADDRESS = '12 Clarendon Road, Watford, WD17 1JJ, United Kingdom'

/**
 * The exact address: private until the poster accepts a worker. The create
 * flow's address step and the edit page's Location group both use it.
 */
const meta = {
  title: 'Create task/CreateTaskAddressSection',
  component: CreateTaskAddressSectionDemo,
  parameters: { layout: 'padded' },
  args: { pinAddress: PIN_ADDRESS, address: {} },
} satisfies Meta<typeof CreateTaskAddressSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Create's address step, nothing typed yet: the lines and the pin's address. */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText(/Address line 1/)
    await expect(field).toHaveValue('')
    await expect(field).toBeRequired()
    await expect(field).not.toHaveAccessibleDescription()
    await expect(
      within(canvasElement).getByRole('button', {
        name: `Use ${PIN_ADDRESS}`,
      }),
    ).toBeEnabled()
  },
}

/** Edit's form: the privacy hint sits under line 1 (no step note says it there). */
export const WithPrivacyHint: Story = {
  args: { privacyHint: true, address: FILLED },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByLabelText(/Address line 1/),
    ).toHaveAccessibleDescription('Shared only with the worker you accept.')
  },
}

/** An address typed, or restored from a draft. */
export const Filled: Story = {
  args: { address: FILLED },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText(/Address line 1/)).toHaveValue(
      '12 Example Street',
    )
    await expect(canvas.getByLabelText(/^City/)).toHaveValue('London')
    await expect(canvas.getByLabelText(/Postcode/)).toHaveValue('SW1A 1AA')
  },
}

/** Continue with no first line: that field says what's missing. */
export const WithError: Story = {
  args: { addressErrors: { addressLine1: 'addressLine1Required' } },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText(/Address line 1/)
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(field).toHaveAccessibleDescription(
      /Add the first line of the address\./,
    )
  },
}

/** Use {address} fills the lines from the pin, only when tapped. */
export const UsePinAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText(/Address line 1/)).toHaveValue('')
    await userEvent.click(
      canvas.getByRole('button', { name: `Use ${PIN_ADDRESS}` }),
    )
    await expect(canvas.getByLabelText(/Address line 1/)).toHaveValue(
      '12 Clarendon Road',
    )
    await expect(canvas.getByLabelText(/^City/)).toHaveValue('Watford')
    await expect(canvas.getByLabelText(/Postcode/)).toHaveValue('WD17 1JJ')
  },
}

/** The pin's address isn't known yet: the button waits, without an address. */
export const NoPinAddressYet: Story = {
  args: { pinAddress: '' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Use pin address' }),
    ).toBeDisabled()
  },
}

/** Edit, before the pin has moved: no button (the label is a town). */
export const WithoutUsePinAddress: Story = {
  args: { usePinAddress: false, address: FILLED },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: /Use / }),
    ).toBeNull()
  },
}

/**
 * Form spacing (FE-481): line 1's label is 8 above its field (48 tall). The
 * pin button hangs 8 under the group of fields.
 */
export const Spacing: Story = {
  args: { privacyHint: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByText(/Address line 1/).closest('label')
      ?.parentElement as HTMLElement
    const label = field.querySelector('label') as HTMLElement
    const shell = (field.querySelector('input') as HTMLElement)
      .parentElement as HTMLElement
    const hint = within(field).getByText(
      'Shared only with the worker you accept.',
    )
    const button = canvas.getByRole('button', { name: `Use ${PIN_ADDRESS}` })
    const group = field.parentElement as HTMLElement

    await expect(gapBelow(label, shell)).toBe(formSpace.labelToControl)
    await expect(heightOf(shell)).toBe(formSpace.controlHeight)
    await expect(gapBelow(shell, hint)).toBe(formSpace.controlToHelper)
    await expect(group.contains(button)).toBe(false)
    await expect(gapBelow(group, button)).toBe(formSpace.alternativesGap)
  },
}

/** An error is 4 under line 1, and the button still hangs 8 under the group. */
export const SpacingWithError: Story = {
  args: { addressErrors: { addressLine1: 'addressLine1Required' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByText(/Address line 1/).closest('label')
      ?.parentElement as HTMLElement
    const shell = (field.querySelector('input') as HTMLElement)
      .parentElement as HTMLElement
    const error = within(field).getByText('Add the first line of the address.')
    const button = canvas.getByRole('button', { name: `Use ${PIN_ADDRESS}` })

    await expect(gapBelow(shell, error)).toBe(formSpace.controlToHelper)
    await expect(gapBelow(field.parentElement as HTMLElement, button)).toBe(
      formSpace.alternativesGap,
    )
    await expect(
      canvas.getByLabelText(/Address line 1/),
    ).toHaveAccessibleDescription(/Add the first line of the address\./)
  },
}
