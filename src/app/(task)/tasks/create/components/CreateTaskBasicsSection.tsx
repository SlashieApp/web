'use client'

import { Box, Heading, Input, Stack, Textarea } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { FormField } from '@/ui/FormField/FormField'
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
    <Box p={{ base: 5, md: 6 }} bg="neutral.100">
      <Stack gap={5}>
        <Heading size="lg" color="primary.700">
          1. Task basics
        </Heading>

        <FormField label="Task title" errorText={fieldErrors?.title}>
          <Input
            {...register('title')}
            placeholder="e.g., Fix leaking pipe in master bathroom"
            bg="neutral.100"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="formControlBorder"
            _placeholder={{ color: 'formControlPlaceholder' }}
            _focusVisible={{ borderColor: 'formControlFocusBorder' }}
          />
        </FormField>

        <FormField label="Description" errorText={fieldErrors?.description}>
          <Textarea
            {...register('description')}
            placeholder="Describe the specific problem or work needed..."
            minH="120px"
            bg="neutral.100"
            borderWidth="1px"
            borderColor="jobCardBorder"
            borderRadius="lg"
          />
        </FormField>
      </Stack>
    </Box>
  )
}
