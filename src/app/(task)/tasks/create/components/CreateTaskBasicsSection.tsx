'use client'

import { Stack, Textarea } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { TextInput } from '@/ui/Input'
import { Heading } from '@ui'
import type { CreateTaskFormValues } from '../createTaskFormSchema'

export type CreateTaskBasicsSectionProps = {
  register: UseFormRegister<CreateTaskFormValues>
  fieldErrors?: {
    title?: string
    description?: string
  }
}

export function CreateTaskBasicsSection({
  register,
  fieldErrors,
}: CreateTaskBasicsSectionProps) {
  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={5}>
        <Heading size="lg" color="primary.700">
          1. Task basics
        </Heading>

        <FormField label="Task title" errorText={fieldErrors?.title}>
          <TextInput
            {...register('title')}
            placeholder="e.g., Fix leaking pipe in master bathroom"
          />
        </FormField>

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
      </Stack>
    </GlassCard>
  )
}
