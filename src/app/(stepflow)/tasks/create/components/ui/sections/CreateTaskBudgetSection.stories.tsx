import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
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
  'bare' | 'sectionHeading' | 'budgetMajorError'
> & {
  budgetMajor?: string
  budgetCurrency?: Currency
  budgetType?: TaskBudgetType
  paymentMethod?: TaskPaymentMethod
}

function CreateTaskBudgetSectionDemo({
  budgetMajor,
  budgetCurrency = emptyCreateTaskValues.budgetCurrency,
  budgetType = emptyCreateTaskValues.budgetType,
  paymentMethod = emptyCreateTaskValues.paymentMethod,
  ...props
}: DemoProps) {
  const { register } = useForm<CreateTaskFormFieldValues>({
    defaultValues: { ...emptyCreateTaskValues, budgetMajor },
  })
  const [type, setType] = useState(budgetType)
  const [payment, setPayment] = useState(paymentMethod)
  return (
    <CreateTaskBudgetSection
      {...props}
      register={register}
      budgetCurrency={budgetCurrency}
      budgetType={type}
      paymentMethod={payment}
      onBudgetTypeChange={setType}
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

/** Defaults: one-off, cash, and no amount entered yet. */
export const Default: Story = {}

/** The amount's label follows the budget type, and choices are radio buttons. */
export const TypeLabelsTheAmount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText('Budget')).toBeVisible()
    await userEvent.click(canvas.getByRole('radio', { name: 'Per hour' }))
    await expect(
      canvas.getByRole('radio', { name: 'Per hour' }),
    ).toHaveAttribute('aria-checked', 'true')
    await expect(canvas.getByLabelText('Budget per hour')).toBeVisible()
  },
}

/** One-off budget of 120 pounds paid in cash. */
export const OneOff: Story = {
  args: { budgetMajor: '120' },
}

/** Charged per hour instead of a one-off total. */
export const PerHour: Story = {
  args: { budgetMajor: '25', budgetType: TaskBudgetType.PerHour },
}

/** Charged per day. */
export const PerDay: Story = {
  args: { budgetMajor: '180', budgetType: TaskBudgetType.PerDay },
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

/**
 * Form spacing (FE-481): the choice groups lay out like fields. Each label is 8
 * above its rows, the rows 8 apart (one under the other on a phone), and the
 * groups and the amount field 20 apart. The amount is 48 tall.
 */
export const Spacing: Story = {
  ...phone390,
  args: { budgetMajor: '120' },
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    const type = await expectChoiceGroup(canvasElement, 'Budget type')
    const amount = fieldByLabel(canvasElement, /^Budget/)
    const pay = await expectChoiceGroup(canvasElement, "How you'll pay")
    await expectGaps([type.root, amount, pay.root], formSpace.fieldGap)
    await expectField(amount)
  },
}

/** From `sm` the rows sit side by side, still 8 apart. */
export const SpacingWide: Story = {
  ...desktop1280,
  args: { budgetMajor: '120' },
  play: async ({ canvasElement }) => {
    await expectChoiceGroup(canvasElement, 'Budget type')
    await expectChoiceGroup(canvasElement, "How you'll pay")
  },
}
