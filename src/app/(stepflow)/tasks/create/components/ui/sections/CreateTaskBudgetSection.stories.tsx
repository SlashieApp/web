import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
  const [currency, setCurrency] = useState<Currency>(budgetCurrency)
  const [type, setType] = useState(budgetType)
  const [payment, setPayment] = useState(paymentMethod)
  return (
    <CreateTaskBudgetSection
      {...props}
      register={register}
      budgetCurrency={currency}
      budgetType={type}
      paymentMethod={payment}
      onBudgetCurrencyChange={setCurrency}
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

/** Defaults: GBP, one-off, cash, and no amount entered yet. */
export const Default: Story = {}

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

/** US dollars: the currency prefix inside the amount field changes. */
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
