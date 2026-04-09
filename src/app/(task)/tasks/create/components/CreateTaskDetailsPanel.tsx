'use client'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import {
  HStack,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import {
  type TaskCategory,
  TaskContactMethod,
  TaskPaymentMethod,
} from '@codegen/schema'

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
  streetAddress: string
  category: TaskCategory
  preferredDate: string
  preferredTimeSlot: string
  budgetMajor: string
  preferredContactMethod: TaskContactMethod
  paymentMethod: TaskPaymentMethod
  categoryOptions: readonly TaskCategory[]
  timeSlotOptions: readonly TimeSlotOption[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStreetAddressChange: (value: string) => void
  onCategoryChange: (value: TaskCategory) => void
  onPreferredDateChange: (value: string) => void
  onPreferredTimeSlotChange: (value: string) => void
  onBudgetMajorChange: (value: string) => void
  onPreferredContactMethodChange: (value: TaskContactMethod) => void
  onPaymentMethodChange: (value: TaskPaymentMethod) => void
}

export function CreateTaskDetailsPanel({
  title,
  description,
  streetAddress,
  category,
  preferredDate,
  preferredTimeSlot,
  budgetMajor,
  preferredContactMethod,
  paymentMethod,
  categoryOptions,
  timeSlotOptions,
  onTitleChange,
  onDescriptionChange,
  onStreetAddressChange,
  onCategoryChange,
  onPreferredDateChange,
  onPreferredTimeSlotChange,
  onBudgetMajorChange,
  onPreferredContactMethodChange,
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
            <NativeSelect.Root>
              <NativeSelect.Field
                bg="surfaceContainerLowest"
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                value={category}
                onChange={(event) =>
                  onCategoryChange(event.target.value as TaskCategory)
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatTaskCategoryLabel(option)}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
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

        <FormField label="Property address (shared with your tradesperson)">
          <TextInput
            value={streetAddress}
            onChange={(event) => onStreetAddressChange(event.target.value)}
            placeholder="e.g. 12 Example Street, London E2"
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
                {formatTaskCategoryLabel(option)}
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
          <FormField label="Expected budget (£)">
            <TextInput
              type="number"
              min={1}
              step="0.01"
              value={budgetMajor}
              onChange={(event) => onBudgetMajorChange(event.target.value)}
              placeholder="e.g. 45"
            />
          </FormField>
        </SimpleGrid>

        <FormField label="How should workers reach you?">
          <Text fontSize="sm" color="muted" mb={2}>
            We use the contact details saved on your profile when you post.
          </Text>
          <HStack gap={2} flexWrap="wrap">
            <Button
              type="button"
              size="sm"
              variant="subtle"
              bg={
                preferredContactMethod === TaskContactMethod.Phone
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                preferredContactMethod === TaskContactMethod.Phone
                  ? 'onSecondaryFixed'
                  : 'fg'
              }
              boxShadow="none"
              onClick={() =>
                onPreferredContactMethodChange(TaskContactMethod.Phone)
              }
            >
              Phone
            </Button>
            <Button
              type="button"
              size="sm"
              variant="subtle"
              bg={
                preferredContactMethod === TaskContactMethod.Email
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                preferredContactMethod === TaskContactMethod.Email
                  ? 'onSecondaryFixed'
                  : 'fg'
              }
              boxShadow="none"
              onClick={() =>
                onPreferredContactMethodChange(TaskContactMethod.Email)
              }
            >
              Email
            </Button>
            <Button
              type="button"
              size="sm"
              variant="subtle"
              bg={
                preferredContactMethod === TaskContactMethod.InApp
                  ? 'secondaryFixed'
                  : 'surfaceContainerLow'
              }
              color={
                preferredContactMethod === TaskContactMethod.InApp
                  ? 'onSecondaryFixed'
                  : 'fg'
              }
              boxShadow="none"
              onClick={() =>
                onPreferredContactMethodChange(TaskContactMethod.InApp)
              }
            >
              In app only
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
