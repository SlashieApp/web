'use client'

import { HStack, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { BudgetUnit, TaskPaymentMethod } from '@codegen/schema'
import type { UseFormRegister } from 'react-hook-form'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { TextInput } from '@/ui/Input'
import { Heading } from '@ui'
import type { CreateTaskFormValues } from '../createTaskFormSchema'

export type CreateTaskBudgetSectionProps = {
  register: UseFormRegister<CreateTaskFormValues>
  budgetUnit: BudgetUnit
  paymentMethod: TaskPaymentMethod
  onBudgetUnitChange: (value: BudgetUnit) => void
  onPaymentMethodChange: (value: TaskPaymentMethod) => void
  budgetMajorError?: string
}

const UNIT_PREFIX: Record<BudgetUnit, string> = {
  [BudgetUnit.Usd]: 'USD',
  [BudgetUnit.Gbp]: 'GBP',
}

export function CreateTaskBudgetSection({
  register,
  budgetUnit,
  paymentMethod,
  onBudgetUnitChange,
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
                value={budgetUnit}
                onChange={(e) =>
                  onBudgetUnitChange(e.target.value as BudgetUnit)
                }
              >
                <option value={BudgetUnit.Usd}>USD</option>
                <option value={BudgetUnit.Gbp}>GBP</option>
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
                {UNIT_PREFIX[budgetUnit]}
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
