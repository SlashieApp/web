'use client'

import {
  HStack,
  NativeSelect,
  SimpleGrid,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import type { TaskCategory } from '@codegen/schema'
import type { UseFormRegister } from 'react-hook-form'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { TextInput } from '@/ui/Input'
import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import { Heading } from '@ui'
import type { CreateTaskFormValues } from '../createTaskFormSchema'

export type CreateTaskBasicsSectionProps = {
  register: UseFormRegister<CreateTaskFormValues>
  category: TaskCategory
  categoryOptions: readonly TaskCategory[]
  onCategoryChange: (value: TaskCategory) => void
  fieldErrors?: {
    title?: string
    description?: string
  }
}

export function CreateTaskBasicsSection({
  register,
  category,
  categoryOptions,
  onCategoryChange,
  fieldErrors,
}: CreateTaskBasicsSectionProps) {
  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={5}>
        <Heading size="lg" color="primary.700">
          1. Task basics
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
          <FormField label="Task title" errorText={fieldErrors?.title}>
            <TextInput
              {...register('title')}
              placeholder="e.g., Fix leaking pipe in master bathroom"
            />
          </FormField>
          <FormField label="Category">
            <NativeSelect.Root>
              <NativeSelect.Field
                bg="surfaceContainerLowest"
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                {...register('category')}
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

        <FormField label="Description" errorText={fieldErrors?.description}>
          <Textarea
            {...register('description')}
            placeholder="Describe the specific problem or work needed..."
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
                {formatTaskCategoryLabel(option)}
              </Button>
            ))}
          </HStack>
        </FormField>
      </Stack>
    </GlassCard>
  )
}
