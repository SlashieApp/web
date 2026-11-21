import { Currency, TaskPaymentMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, userEvent, within } from 'storybook/test'

import {
  desktop1280,
  expectChoiceGroup,
  expectGaps,
  expectWidth,
  fieldByLabel,
  phone390,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace } from '@/theme/styles'
import { expectField } from '@/ui/Modal/taskDialogSpacing.testing'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  createTaskStoryErrors,
  emptyCreateTaskValues,
} from '../../createTaskStoryFixtures'
import {
  CreateTaskBudgetSection,
  type CreateTaskBudgetSectionProps,
} from './CreateTaskBudgetSection'

type DemoProps = Pick<
  CreateTaskBudgetSectionProps,
  'bare' | 'sectionHeading' | 'budgetMajorError' | 'budgetUnitError'
> & {
  budgetMajor?: string
  budgetCurrency?: Currency
  budgetUnit?: string
  openBudget?: boolean
  paymentMethod?: TaskPaymentMethod
}

function CreateTaskBudgetSectionDemo({
  budgetMajor,
  budgetCurrency = emptyCreateTaskValues.budgetCurrency,
  budgetUnit = '',
  openBudget = false,
  paymentMethod = emptyCreateTaskValues.paymentMethod,
  ...props
}: DemoProps) {
  const { register } = useForm<CreateTaskFormFieldValues>({
    defaultValues: { ...emptyCreateTaskValues, budgetMajor },
  })
  const [unit, setUnit] = useState(budgetUnit)
  const [open, setOpen] = useState(openBudget)
  const [payment, setPayment] = useState(paymentMethod)
  return (
    <CreateTaskBudgetSection
      {...props}
      register={register}
      budgetCurrency={budgetCurrency}
      budgetUnit={unit}
      openBudget={open}
      paymentMethod={payment}
      onBudgetUnitChange={setUnit}
      onOpenBudgetChange={setOpen}
      onPaymentMethodChange={setPayment}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskBudgetSection',
  component: CreateTaskBudgetSectionDemo,
  parameters: { layout: 'padded' },
  args: { bare: true },
} satisfies Meta<typeof CreateTaskBudgetSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Defaults (FE-584): no amount yet, nothing for the unit (the whole job), cash. */
export const Default: Story = {}

/**
 * A suggestion fills the unit field and shows as chosen; tapping it again
 * clears it. Typing your own words leaves every suggestion unchosen.
 */
export const Suggestions: Story = {
  args: { budgetMajor: '60' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByLabelText(/What's it for/)
    const perDay = canvas.getByRole('button', { name: 'per day' })
    await expect(perDay).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(perDay)
    await expect(field).toHaveValue('per day')
    await expect(perDay).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(perDay)
    await expect(field).toHaveValue('')
    await userEvent.type(field, 'per room')
    for (const chip of canvas.getAllByRole('button', { pressed: false })) {
      await expect(chip).toHaveAttribute('aria-pressed', 'false')
    }
    await expect(canvas.queryByRole('button', { pressed: true })).toBeNull()
  },
}

/** Charged per hour: the chosen suggestion. */
export const PerHour: Story = {
  args: { budgetMajor: '25', budgetUnit: 'per hour' },
}

/** The poster's own words, which workers see as typed. */
export const OwnUnit: Story = {
  args: { budgetMajor: '15', budgetUnit: 'per room' },
}

/**
 * Skip folds the amount and unit into an Open budget note, with focus on Add
 * a budget; that brings them back with what was typed, focus on the amount.
 * How you'll pay stays either way.
 */
export const SkipAndUndo: Story = {
  args: { budgetMajor: '60', budgetUnit: 'per day' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Skip: let workers quote' }),
    )
    await expect(canvas.getByText('Open budget')).toBeVisible()
    await expect(
      canvas.getByText('Workers will quote their own price.'),
    ).toBeVisible()
    await expect(canvas.queryByLabelText(/^Amount/)).toBeNull()
    const add = canvas.getByRole('button', { name: 'Add a budget' })
    await expect(add).toHaveFocus()
    await expect(canvas.getByText("How you'll pay")).toBeVisible()
    await userEvent.click(add)
    const amount = canvas.getByLabelText(/^Amount/)
    await expect(amount).toHaveFocus()
    await expect(amount).toHaveValue(60)
    await expect(canvas.getByLabelText(/What's it for/)).toHaveValue('per day')
  },
}

/** An open budget, as Edit task opens one. */
export const OpenBudget: Story = {
  args: { openBudget: true },
}

/** Paid by bank transfer instead of cash. */
export const BankTransfer: Story = {
  args: {
    budgetMajor: '120',
    paymentMethod: TaskPaymentMethod.BankTransfer,
  },
}

/** An older task priced in dollars keeps its symbol (new tasks are in pounds). */
export const UsDollars: Story = {
  args: { budgetMajor: '150', budgetCurrency: Currency.Usd },
}

/** Continue pressed with no amount: the real message shows under the field. */
export const AmountRequired: Story = {
  args: { budgetMajorError: createTaskStoryErrors().budgetMajor },
}

/** Card mode (edit page): the fields sit in a titled section card. */
export const CardMode: Story = {
  args: { bare: false, budgetMajor: '120' },
}

/** zh-HK: the suggestions and the note in Traditional Chinese. */
export const ZhHk: Story = {
  args: { budgetMajor: '60', budgetUnit: '按日' },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks/create' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: '按日' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(
      canvas.getByRole('button', { name: '略過：讓工作者報價' }),
    ).toBeVisible()
  },
}

/**
 * Form spacing (FE-481): the amount, the unit field and the payment group lay
 * out like fields, 20 apart (the Skip link sits between the unit and the
 * payment). The amount and the unit are 48 tall.
 */
export const Spacing: Story = {
  ...phone390,
  args: { budgetMajor: '120' },
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    const amount = fieldByLabel(canvasElement, /^Amount/)
    const unit = fieldByLabel(canvasElement, /^What's it for/)
    await expectGaps([amount, unit], formSpace.fieldGap)
    await expectField(amount)
    await expectChoiceGroup(canvasElement, "How you'll pay")
  },
}

/** From `sm` the payment rows sit side by side, still 8 apart. */
export const SpacingWide: Story = {
  ...desktop1280,
  args: { budgetMajor: '120' },
  play: async ({ canvasElement }) => {
    await expectChoiceGroup(canvasElement, "How you'll pay")
  },
}
