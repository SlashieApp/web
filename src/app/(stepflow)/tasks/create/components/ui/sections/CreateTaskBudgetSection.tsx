'use client'

import { Text } from '@chakra-ui/react'
import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
import type { UseFormRegister } from 'react-hook-form'

import { useI11n } from '@/i18n/useI11n'
import { sdlFigure } from '@/theme/styles'
import { FormField, Input, RadioButtonGroup } from '@ui'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'

export type CreateTaskBudgetSectionProps = {
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  /** Shown as the amount's symbol; tasks are posted in GBP. */
  budgetCurrency: Currency
  budgetType: TaskBudgetType
  paymentMethod: TaskPaymentMethod
  onBudgetTypeChange: (value: TaskBudgetType) => void
  onPaymentMethodChange: (value: TaskPaymentMethod) => void
  /** Copy key from the form schema. */
  budgetMajorError?: string
}

const CURRENCY_SYMBOL: Record<Currency, string> = {
  [Currency.Gbp]: '£',
  [Currency.Usd]: '$',
}

/** Budget type first, so the amount's label can say what it is per. */
export function CreateTaskBudgetSection({
  bare = false,
  sectionHeading = '',
  register,
  budgetCurrency,
  budgetType,
  paymentMethod,
  onBudgetTypeChange,
  onPaymentMethodChange,
  budgetMajorError,
}: CreateTaskBudgetSectionProps) {
  const t = useI11n(bag)
  const f = t.fields
  const amountLabel =
    budgetType === TaskBudgetType.PerHour
      ? f.budgetPerHour
      : budgetType === TaskBudgetType.PerDay
        ? f.budgetPerDay
        : f.budget

  return (
    <CreateTaskSection
      bare={bare}
      heading={sectionHeading}
      bodyGap={5}
      headingSubtext={
        <Text fontSize="sm" color="text.muted">
          {t.steps.budget.description}
        </Text>
      }
    >
      <RadioButtonGroup
        label={f.budgetType}
        value={budgetType}
        options={[
          { value: TaskBudgetType.OneOff, label: f.oneOff },
          { value: TaskBudgetType.PerHour, label: f.perHour },
          { value: TaskBudgetType.PerDay, label: f.perDay },
        ]}
        onChange={onBudgetTypeChange}
      />

      <FormField
        label={amountLabel}
        required
        errorText={taskFieldError(t.errors, budgetMajorError)}
      >
        <Input
          type="number"
          inputMode="decimal"
          min={1}
          step="0.01"
          placeholder="0.00"
          rootProps={{ maxW: { base: 'full', md: '240px' } }}
          startElement={
            <Text {...sdlFigure} fontSize="sm" color="text.muted">
              {CURRENCY_SYMBOL[budgetCurrency]}
            </Text>
          }
          {...register('budgetMajor')}
        />
      </FormField>

      <RadioButtonGroup
        label={f.payment}
        value={paymentMethod}
        options={[
          { value: TaskPaymentMethod.Cash, label: f.cash },
          { value: TaskPaymentMethod.BankTransfer, label: f.bankTransfer },
        ]}
        onChange={onPaymentMethodChange}
      />
    </CreateTaskSection>
  )
}
