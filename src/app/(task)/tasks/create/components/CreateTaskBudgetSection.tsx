'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
import type { UseFormRegister } from 'react-hook-form'

import { Button, FormField, Input, SectionCard, Select } from '@ui'
import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'

export type CreateTaskBudgetSectionProps = {
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
    <SectionCard
      bodyGap={5}
      header={
        <Heading size="lg" color="primary.700">
          5. Budget & payment
        </Heading>
      }
    >
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
              <Text fontWeight={700} fontSize="sm" color="formLabelMuted">
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
            bg={budgetType === TaskBudgetType.OneOff ? 'primary.600' : 'cardBg'}
            color={budgetType === TaskBudgetType.OneOff ? 'white' : 'cardFg'}
            boxShadow="none"
            onClick={() => onBudgetTypeChange(TaskBudgetType.OneOff)}
          >
            One-off
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={budgetType === TaskBudgetType.PerDay ? 'primary.600' : 'cardBg'}
            color={budgetType === TaskBudgetType.PerDay ? 'white' : 'cardFg'}
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
              budgetType === TaskBudgetType.PerHour ? 'primary.600' : 'cardBg'
            }
            color={budgetType === TaskBudgetType.PerHour ? 'white' : 'cardFg'}
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
                ? 'primary.600'
                : 'cardBg'
            }
            color={
              paymentMethod === TaskPaymentMethod.Cash ? 'white' : 'cardFg'
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
                ? 'primary.600'
                : 'cardBg'
            }
            color={
              paymentMethod === TaskPaymentMethod.BankTransfer
                ? 'white'
                : 'cardFg'
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
    </SectionCard>
  )
}
