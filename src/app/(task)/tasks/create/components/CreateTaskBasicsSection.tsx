'use client'

import { Heading, Textarea } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { FormField, Input, SectionCard } from '@ui'
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
    <SectionCard
      bodyGap={5}
      header={
        <Heading size="lg" color="primary.700">
          1. Task basics
        </Heading>
      }
    >
      <FormField label="Task title" errorText={fieldErrors?.title}>
        <Input
          {...register('title')}
          placeholder="e.g., Fix leaking pipe in master bathroom"
        />
      </FormField>

      <FormField label="Description" errorText={fieldErrors?.description}>
        <Textarea
          {...register('description')}
          placeholder="Describe the specific problem or work needed..."
          minH="120px"
          bg="neutral.100"
          borderWidth="1px"
          borderColor="cardBorder"
          borderRadius="lg"
          _focusVisible={{ borderColor: 'formControlFocusBorder' }}
        />
      </FormField>
    </SectionCard>
  )
}
