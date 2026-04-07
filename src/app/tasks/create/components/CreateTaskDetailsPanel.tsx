'use client'

import {
  HStack,
  NativeSelect,
  SimpleGrid,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { TaskPaymentMethod } from '@codegen/schema'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { TextInput } from '@/ui/Input'
import { Heading } from '@ui'

type TimeSlotOption = {
  value: string
  label: string
}

export type CreateTaskDetailsPanelProps = {
  title: string
  description: string
  category: string
  preferredDate: string
  preferredTimeSlot: string
  priceOfferPence: string
  contactMethod: string
  paymentMethod: TaskPaymentMethod
  categoryOptions: readonly string[]
  timeSlotOptions: readonly TimeSlotOption[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onPreferredDateChange: (value: string) => void
  onPreferredTimeSlotChange: (value: string) => void
  onPriceOfferPenceChange: (value: string) => void
  onContactMethodChange: (value: string) => void
  onPaymentMethodChange: (value: TaskPaymentMethod) => void
}

export function CreateTaskDetailsPanel({
  title,
  description,
  category,
  preferredDate,
  preferredTimeSlot,
  priceOfferPence,
  contactMethod,
  paymentMethod,
  categoryOptions,
  timeSlotOptions,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onPreferredDateChange,
  onPreferredTimeSlotChange,
  onPriceOfferPenceChange,
  onContactMethodChange,
  onPaymentMethodChange,
}: CreateTaskDetailsPanelProps) {
  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={6}>
        <Stack gap={1}>
          <Heading size="xl">Task details</Heading>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
          <FormField label="Task title">
            <TextInput
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="e.g. Fix a leaky tap"
            />
          </FormField>
          <FormField label="Category">
            <TextInput
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              placeholder="e.g. Plumbing"
            />
          </FormField>
        </SimpleGrid>

        <FormField label="What needs to be done?">
          <Textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Describe the task clearly so professionals can quote accurately."
            minH="120px"
            bg="surfaceContainerLowest"
            borderWidth="1px"
            borderColor="border"
            borderRadius="lg"
          />
        </FormField>

        <FormField label="Quick category picks">
          <HStack gap={2} flexWrap="wrap">
            {categoryOptions.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant="subtle"
                bg={
                  category === option ? 'secondaryFixed' : 'surfaceContainerLow'
                }
                color={category === option ? 'onSecondaryFixed' : 'fg'}
                boxShadow="none"
                onClick={() => onCategoryChange(option)}
              >
                {option}
              </Button>
            ))}
          </HStack>
        </FormField>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
          <FormField label="Preferred Date">
            <TextInput
              type="date"
              value={preferredDate}
              onChange={(event) => onPreferredDateChange(event.target.value)}
            />
          </FormField>
          <FormField label="Preferred Time">
            <NativeSelect.Root>
              <NativeSelect.Field
                bg="surfaceContainerLowest"
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                value={preferredTimeSlot}
                onChange={(event) =>
                  onPreferredTimeSlotChange(event.target.value)
                }
              >
                {timeSlotOptions.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          </FormField>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
          <FormField label="Expected budget (pence)">
            <TextInput
              type="number"
              min={1}
              value={priceOfferPence}
              onChange={(event) => onPriceOfferPenceChange(event.target.value)}
              placeholder="e.g. 4500"
            />
          </FormField>
          <FormField label="Preferred contact method">
            <TextInput
              value={contactMethod}
              onChange={(event) => onContactMethodChange(event.target.value)}
              placeholder="Phone, WhatsApp, Email"
            />
          </FormField>
        </SimpleGrid>

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
