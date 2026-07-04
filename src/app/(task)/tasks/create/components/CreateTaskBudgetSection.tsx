'use client'

import { HStack, Text } from '@chakra-ui/react'
import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
import type { UseFormRegister } from 'react-hook-form'

import { Button, FormField, Input, Select } from '@ui'
import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'
import { CreateTaskSection } from './CreateTaskSection'

export type CreateTaskBudgetSectionProps = {
  /** Bare mode for the stepped create flow (no Card/heading). */
  bare?: boolean
  /** Card header text (card mode only). */
  sectionHeading?: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  budgetCurrency: Currency
  budgetType: TaskBudgetType
  paymentMethod: TaskPaymentMethod
  onBudgetCurrencyChange: (value: Currency) => void
  onBudgetTypeChange: (value: TaskBudgetType) => void
  onPaymentMethodChange: (value: TaskPaymentMethod) => void
  budgetMajorError?: string
}

const CURRENCY_PREFIX: Record<Currency, string> = {
  [Currency.Usd]: 'USD',
  [Currency.Gbp]: 'GBP',
}

export function CreateTaskBudgetSection({
  bare = false,
  sectionHeading = '5. Budget & payment',
  register,
  budgetCurrency,
  budgetType,
  paymentMethod,
  onBudgetCurrencyChange,
  onBudgetTypeChange,
  onPaymentMethodChange,
  budgetMajorError,
}: CreateTaskBudgetSectionProps) {
  return (
    <CreateTaskSection bare={bare} heading={sectionHeading} bodyGap={5}>
      <FormField label="Budget amount" errorText={budgetMajorError}>
        <HStack gap={2} align="stretch" maxW={{ base: 'full', md: '380px' }}>
          <Select
            rootProps={{ w: '108px', flexShrink: 0 }}
            value={budgetCurrency}
            onChange={(e) => onBudgetCurrencyChange(e.target.value as Currency)}
          >
            <option value={Currency.Usd}>USD</option>
            <option value={Currency.Gbp}>GBP</option>
          </Select>
          <Input
            type="number"
            min={1}
            step="0.01"
            placeholder="0.00"
            rootProps={{ flex: 1, minW: 0 }}
            startElement={
              <Text fontWeight={700} fontSize="sm" color="text.muted">
                {CURRENCY_PREFIX[budgetCurrency]}
              </Text>
            }
            {...register('budgetMajor')}
          />
        </HStack>
      </FormField>

      <FormField label="Budget type">
        <HStack gap={2} flexWrap="wrap">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={
              budgetType === TaskBudgetType.OneOff
                ? 'action.primary'
                : 'bg.surface'
            }
            color={
              budgetType === TaskBudgetType.OneOff
                ? 'text.onGreen'
                : 'text.default'
            }
            boxShadow="none"
            onClick={() => onBudgetTypeChange(TaskBudgetType.OneOff)}
          >
            One-off
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={
              budgetType === TaskBudgetType.PerDay
                ? 'action.primary'
                : 'bg.surface'
            }
            color={
              budgetType === TaskBudgetType.PerDay
                ? 'text.onGreen'
                : 'text.default'
            }
            boxShadow="none"
            onClick={() => onBudgetTypeChange(TaskBudgetType.PerDay)}
          >
            Per day
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={
              budgetType === TaskBudgetType.PerHour
                ? 'action.primary'
                : 'bg.surface'
            }
            color={
              budgetType === TaskBudgetType.PerHour
                ? 'text.onGreen'
                : 'text.default'
            }
            boxShadow="none"
            onClick={() => onBudgetTypeChange(TaskBudgetType.PerHour)}
          >
            Per hour
          </Button>
        </HStack>
      </FormField>

      <FormField label="Payment method">
        <HStack gap={2} flexWrap="wrap">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={
              paymentMethod === TaskPaymentMethod.Cash
                ? 'action.primary'
                : 'bg.surface'
            }
            color={
              paymentMethod === TaskPaymentMethod.Cash
                ? 'text.onGreen'
                : 'text.default'
            }
            boxShadow="none"
            onClick={() => onPaymentMethodChange(TaskPaymentMethod.Cash)}
          >
            Cash
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={
              paymentMethod === TaskPaymentMethod.BankTransfer
                ? 'action.primary'
                : 'bg.surface'
            }
            color={
              paymentMethod === TaskPaymentMethod.BankTransfer
                ? 'text.onGreen'
                : 'text.default'
            }
            boxShadow="none"
            onClick={() =>
              onPaymentMethodChange(TaskPaymentMethod.BankTransfer)
            }
          >
            Bank transfer
          </Button>
        </HStack>
      </FormField>
    </CreateTaskSection>
  )
}
