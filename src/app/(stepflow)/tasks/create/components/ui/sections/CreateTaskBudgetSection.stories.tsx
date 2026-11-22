import { Currency, TaskPaymentMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, userEvent, waitFor, within } from 'storybook/test'

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
  type BudgetChoice,
  CreateTaskBudgetSection,
  type CreateTaskBudgetSectionProps,
} from './CreateTaskBudgetSection'

const PAYMENT_LABEL = 'Your accepted payment method'

type DemoProps = Pick<
  CreateTaskBudgetSectionProps,
  | 'bare'
  | 'sectionHeading'
  | 'questionInTitle'
  | 'budgetChoiceError'
  | 'budgetMajorError'
  | 'budgetUnitError'
  | 'paymentMethodsError'
> & {
  budgetMajor?: string
  budgetCurrency?: Currency
  budgetUnit?: string
  /** Null: the question isn't answered yet (a new task). */
  choice?: BudgetChoice | null
  paymentMethods?: TaskPaymentMethod[]
}

function CreateTaskBudgetSectionDemo({
  budgetMajor = '',
  budgetCurrency = emptyCreateTaskValues.budgetCurrency,
  budgetUnit = '',
  choice = null,
  paymentMethods = emptyCreateTaskValues.paymentMethods,
  ...props
}: DemoProps) {
  const { register, watch } = useForm<CreateTaskFormFieldValues>({
    defaultValues: { ...emptyCreateTaskValues, budgetMajor },
  })
  const [unit, setUnit] = useState(budgetUnit)
  const [answer, setAnswer] = useState(choice)
  const [payment, setPayment] = useState(paymentMethods)
  return (
    <CreateTaskBudgetSection
      {...props}
      register={register}
      budgetCurrency={budgetCurrency}
      budgetMajor={watch('budgetMajor')}
      budgetUnit={unit}
      budgetAnswered={answer !== null}
      openBudget={answer === 'open'}
      paymentMethods={payment}
      onBudgetUnitChange={setUnit}
      onBudgetChoiceChange={setAnswer}
      onPaymentMethodsChange={setPayment}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskBudgetSection',
  component: CreateTaskBudgetSectionDemo,
  parameters: { layout: 'padded' },
  // As the create step: its own title asks the question.
  args: { bare: true, questionInTitle: true },
} satisfies Meta<typeof CreateTaskBudgetSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

const radio = (canvasElement: HTMLElement, name: string) =>
  within(canvasElement).getByRole('radio', { name })

/** A reveal has finished opening: nothing is clipped or faded any more. */
async function opened(element: HTMLElement) {
  await waitFor(() => expect(element).toBeVisible())
  await waitFor(() =>
    expect(
      getComputedStyle(element.closest('[data-reveal]') as Element).opacity,
    ).toBe('1'),
  )
}

/**
 * A new task (Ryan 22 Nov): the question, with neither answer picked and
 * nothing under it. No amount, no unit, and how you'll pay isn't asked yet.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('radiogroup', { name: 'Do you have a budget in mind?' }),
    ).toBeVisible()
    await expect(radio(canvasElement, 'Set a budget')).not.toBeChecked()
    await expect(radio(canvasElement, 'Open budget')).not.toBeChecked()
    await expect(canvas.queryByLabelText(/^Amount/)).toBeNull()
    await expect(canvas.queryByText("What's it for?")).toBeNull()
    await expect(canvas.queryByText(PAYMENT_LABEL)).toBeNull()
  },
}

/**
 * Set a budget opens the amount with the cursor in it, and how you'll pay
 * after it. What it's for only opens once an amount is typed, with Whole job
 * picked; clearing the amount folds it away again.
 */
export const SetABudget: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(radio(canvasElement, 'Set a budget'))
    await expect(radio(canvasElement, 'Set a budget')).toBeChecked()
    const amount = await canvas.findByLabelText(/^Amount/)
    await opened(amount)
    await expect(amount).toHaveFocus()
    await opened(await canvas.findByText(PAYMENT_LABEL))
    await expect(canvas.queryByText("What's it for?")).toBeNull()

    await userEvent.type(amount, '60')
    await opened(await canvas.findByText("What's it for?"))
    await expect(radio(canvasElement, 'Whole job')).toBeChecked()
    await expect(canvas.queryByLabelText(/in your words/)).toBeNull()

    await userEvent.clear(amount)
    await waitFor(() => expect(canvas.queryByText("What's it for?")).toBeNull())
  },
}

/**
 * What it's for is one choice: Whole job, a suggestion, or Other, which
 * opens a field for the poster's own words with the cursor in it. Picking a
 * suggestion again closes the field.
 */
export const WhatItIsFor: Story = {
  args: { choice: 'set', budgetMajor: '60' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('radiogroup', { name: "What's it for?" })
    await expect(within(group).getAllByRole('radio')).toHaveLength(7)
    await userEvent.click(radio(canvasElement, 'Per day'))
    await expect(radio(canvasElement, 'Per day')).toBeChecked()
    await expect(radio(canvasElement, 'Whole job')).not.toBeChecked()

    await userEvent.click(radio(canvasElement, 'Other'))
    const own = await canvas.findByLabelText(/in your words/)
    await opened(own)
    await expect(own).toHaveFocus()
    await expect(own).toHaveValue('')
    await expect(radio(canvasElement, 'Other')).toBeChecked()
    await expect(radio(canvasElement, 'Per day')).not.toBeChecked()
    await userEvent.type(own, 'per room')
    await expect(radio(canvasElement, 'Other')).toBeChecked()

    await userEvent.click(radio(canvasElement, 'Per hour'))
    await expect(radio(canvasElement, 'Per hour')).toBeChecked()
    await waitFor(() =>
      expect(canvas.queryByLabelText(/in your words/)).toBeNull(),
    )
  },
}

/** Charged per hour: the suggestion picked. */
export const PerHour: Story = {
  args: { choice: 'set', budgetMajor: '25', budgetUnit: 'per hour' },
  play: async ({ canvasElement }) => {
    await expect(radio(canvasElement, 'Per hour')).toBeChecked()
  },
}

/** The poster's own words: Other is picked and its field shows them. */
export const OwnUnit: Story = {
  args: { choice: 'set', budgetMajor: '15', budgetUnit: 'per room' },
  play: async ({ canvasElement }) => {
    await expect(radio(canvasElement, 'Other')).toBeChecked()
    await expect(
      within(canvasElement).getByLabelText(/in your words/),
    ).toHaveValue('per room')
  },
}

/**
 * Changing the answer keeps what was typed: Open budget folds the amount and
 * unit into the note, and Set a budget brings them back.
 */
export const ChangeYourMind: Story = {
  args: { choice: 'set', budgetMajor: '60', budgetUnit: 'per day' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(radio(canvasElement, 'Open budget'))
    await opened(await canvas.findByText('Workers will quote their own price.'))
    await waitFor(() => expect(canvas.queryByLabelText(/^Amount/)).toBeNull())
    await expect(canvas.queryByText("What's it for?")).toBeNull()
    await expect(canvas.getByText(PAYMENT_LABEL)).toBeVisible()

    await userEvent.click(radio(canvasElement, 'Set a budget'))
    const amount = await canvas.findByLabelText(/^Amount/)
    await opened(amount)
    await expect(amount).toHaveValue(60)
    await expect(amount).toHaveFocus()
    await expect(radio(canvasElement, 'Per day')).toBeChecked()
    await waitFor(() =>
      expect(
        canvas.queryByText('Workers will quote their own price.'),
      ).toBeNull(),
    )
  },
}

/** An open budget, as Edit task opens one: the note, and how you'll pay. */
export const OpenBudget: Story = {
  args: { choice: 'open' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(radio(canvasElement, 'Open budget')).toBeChecked()
    await expect(
      canvas.getByText('Workers will quote their own price.'),
    ).toBeVisible()
    await expect(canvas.queryByLabelText(/^Amount/)).toBeNull()
    await expect(canvas.getByText(PAYMENT_LABEL)).toBeVisible()
  },
}

/**
 * "Your accepted payment method" takes any number of the three (FE-599):
 * Cash, Bank transfer, Pay by card. A tap adds one or takes it off.
 */
export const SeveralPaymentMethods: Story = {
  args: {
    choice: 'set',
    budgetMajor: '120',
    paymentMethods: [TaskPaymentMethod.Cash],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = await canvas.findByRole('group', { name: PAYMENT_LABEL })
    const rows = within(group).getAllByRole('checkbox')
    await expect(rows.map((row) => row.textContent)).toEqual([
      'Cash',
      'Bank transfer',
      'Pay by card',
    ])
    const [cash, bank, card] = rows as [HTMLElement, HTMLElement, HTMLElement]
    await expect(cash).toHaveAttribute('aria-checked', 'true')
    await expect(bank).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(card)
    await userEvent.click(bank)
    for (const row of rows) {
      await expect(row).toHaveAttribute('aria-checked', 'true')
    }
    await userEvent.click(cash)
    await expect(cash).toHaveAttribute('aria-checked', 'false')
    await expect(card).toHaveAttribute('aria-checked', 'true')
  },
}

/** With none chosen the form says so under the rows. */
export const NoPaymentMethod: Story = {
  args: {
    choice: 'set',
    budgetMajor: '120',
    paymentMethods: [],
    paymentMethodsError: 'paymentMethodRequired',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Choose at least one payment method.'),
    ).toBeVisible()
  },
}

/** An older task priced in dollars keeps its symbol (new tasks are in pounds). */
export const UsDollars: Story = {
  args: { choice: 'set', budgetMajor: '150', budgetCurrency: Currency.Usd },
}

/** Continue pressed with neither answer picked: the message sits under the choices. */
export const ChoiceRequired: Story = {
  args: { budgetChoiceError: 'budgetChoiceRequired' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Choose one to continue.')).toBeVisible()
    await expect(
      canvas.getByRole('radiogroup', { name: 'Do you have a budget in mind?' }),
    ).toHaveAttribute('aria-invalid', 'true')
  },
}

/** Continue pressed with no amount: the real message shows under the field. */
export const AmountRequired: Story = {
  args: {
    choice: 'set',
    budgetMajorError: createTaskStoryErrors().budgetMajor,
  },
}

/**
 * Edit task: the section is titled "Budget", so the question shows above the
 * choices, and the task's own answer starts picked.
 */
export const InEditTask: Story = {
  args: { questionInTitle: false, choice: 'set', budgetMajor: '120' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Do you have a budget in mind?'),
    ).toBeVisible()
  },
}

/** Card mode: the fields sit in a titled section card. */
export const CardMode: Story = {
  args: {
    bare: false,
    questionInTitle: false,
    choice: 'set',
    budgetMajor: '120',
  },
}

/** zh-HK: the question's answers, the choices and the note in Traditional Chinese. */
export const ZhHk: Story = {
  args: { choice: 'set', budgetMajor: '60', budgetUnit: '按日' },
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
    await expect(radio(canvasElement, '設定預算')).toBeChecked()
    await expect(radio(canvasElement, '按日')).toBeChecked()
    await expect(radio(canvasElement, '整項工作')).not.toBeChecked()
    await userEvent.click(radio(canvasElement, '開放預算'))
    await opened(await canvas.findByText('工作者會自行報價。'))
  },
}

/**
 * Form spacing (FE-481): the choices, the amount, what it's for and the
 * payment group lay out like fields, 20 apart, each space inside its own
 * fold. The amount is 48 tall.
 */
export const Spacing: Story = {
  ...phone390,
  args: { choice: 'set', budgetMajor: '120' },
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    const canvas = within(canvasElement)
    const choices = canvas.getByRole('radiogroup', {
      name: 'Do you have a budget in mind?',
    })
    const amount = fieldByLabel(canvasElement, /^Amount/)
    const unit = canvas.getByRole('radiogroup', { name: "What's it for?" })
      .parentElement as HTMLElement
    const pay = canvas.getByRole('group', { name: PAYMENT_LABEL })
      .parentElement as HTMLElement
    await expectGaps([choices, amount, unit, pay], formSpace.fieldGap)
    await expectField(amount)
    await expectChoiceGroup(canvasElement, PAYMENT_LABEL, [], 'group')
  },
}

/** From `sm` the payment rows sit side by side, still 8 apart. */
export const SpacingWide: Story = {
  ...desktop1280,
  args: { choice: 'set', budgetMajor: '120' },
  play: async ({ canvasElement }) => {
    await expectChoiceGroup(canvasElement, PAYMENT_LABEL, [], 'group')
  },
}
