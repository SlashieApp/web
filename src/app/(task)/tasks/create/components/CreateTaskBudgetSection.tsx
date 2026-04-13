'use client'

import { HStack, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { Currency, TaskBudgetType, TaskPaymentMethod } from '@codegen/schema'
import type { UseFormRegister } from 'react-hook-form'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { TextInput } from '@/ui/Input'
import { Heading } from '@ui'
import type { CreateTaskFormValues } from '../createTaskFormSchema'

export type CreateTaskBudgetSectionProps = {
  register: UseFormRegister<CreateTaskFormValues>
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
  [Currency.Gdp]: 'GBP',
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
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={5}>
        <Heading size="lg" color="primary.700">
          3. Budget & payment
        </Heading>

        <FormField label="Budget amount" errorText={budgetMajorError}>
          <HStack gap={2} align="stretch" maxW={{ base: 'full', md: '380px' }}>
            <NativeSelect.Root w="108px" flexShrink={0}>
              <NativeSelect.Field
                bg="surfaceContainerLowest"
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                value={budgetCurrency}
                onChange={(e) =>
                  onBudgetCurrencyChange(e.target.value as Currency)
                }
              >
                <option value={Currency.Usd}>USD</option>
                <option value={Currency.Gdp}>GBP</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
            <HStack
              flex={1}
              align="center"
              gap={2}
              bg="surfaceContainerLowest"
              borderRadius="lg"
              boxShadow="ghostBorder"
              px={3}
              minH="44px"
            >
              <Text fontWeight={700} fontSize="sm" color="muted" flexShrink={0}>
                {CURRENCY_PREFIX[budgetCurrency]}
              </Text>
              <TextInput
                flex={1}
                type="number"
                min={1}
                step="0.01"
                {...register('budgetMajor')}
                placeholder="0.00"
                borderWidth={0}
                boxShadow="none"
                h="auto"
                minH={0}
                py={2}
              />
            </HStack>
          </HStack>
        </FormField>

        <FormField label="Budget type">
          <HStack gap={2} flexWrap="wrap">
            <Button
              type="button"
              size="sm"
              variant="subtle"
              bg={
                budgetType === TaskBudgetType.OneOff
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                budgetType === TaskBudgetType.OneOff ? 'onSecondaryFixed' : 'fg'
              }
              boxShadow="none"
              onClick={() => onBudgetTypeChange(TaskBudgetType.OneOff)}
            >
              One-off
            </Button>
            <Button
              type="button"
              size="sm"
              variant="subtle"
              bg={
                budgetType === TaskBudgetType.PerDay
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                budgetType === TaskBudgetType.PerDay ? 'onSecondaryFixed' : 'fg'
              }
              boxShadow="none"
              onClick={() => onBudgetTypeChange(TaskBudgetType.PerDay)}
            >
              Per day
            </Button>
            <Button
              type="button"
              size="sm"
              variant="subtle"
              bg={
                budgetType === TaskBudgetType.PerHour
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                budgetType === TaskBudgetType.PerHour
                  ? 'onSecondaryFixed'
                  : 'fg'
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
              variant="subtle"
              bg={
                paymentMethod === TaskPaymentMethod.Cash
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                paymentMethod === TaskPaymentMethod.Cash
                  ? 'onSecondaryFixed'
                  : 'fg'
              }
              boxShadow="none"
              onClick={() => onPaymentMethodChange(TaskPaymentMethod.Cash)}
            >
              Cash
            </Button>
            <Button
              type="button"
              size="sm"
              variant="subtle"
              bg={
                paymentMethod === TaskPaymentMethod.BankTransfer
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                paymentMethod === TaskPaymentMethod.BankTransfer
                  ? 'onSecondaryFixed'
                  : 'fg'
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
      </Stack>
    </GlassCard>
  )
}
