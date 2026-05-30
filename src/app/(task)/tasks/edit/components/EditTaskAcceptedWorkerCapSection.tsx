'use client'

import { Heading, Text } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { FormField, Input, SectionCard } from '@ui'

import type { EditTaskFormFieldValues } from '../editTaskFormSchema'

export type EditTaskAcceptedWorkerCapSectionProps = {
  register: UseFormRegister<EditTaskFormFieldValues>
  minAcceptedCap: number
  errorText?: string
}

export function EditTaskAcceptedWorkerCapSection({
  register,
  minAcceptedCap,
  errorText,
}: EditTaskAcceptedWorkerCapSectionProps) {
  return (
    <SectionCard
      bodyGap={4}
      header={
        <Heading size="lg" color="primary.700">
          Worker slots
        </Heading>
      }
    >
      <Text fontSize="sm" color="formLabelMuted">
        How many workers can be accepted on this task before it leaves
        discovery.
        {minAcceptedCap > 0
          ? ` You already have ${minAcceptedCap} accepted quote${minAcceptedCap === 1 ? '' : 's'}, so the cap cannot go lower.`
          : null}
      </Text>
      <FormField
        label="Accepted worker cap"
        errorText={errorText}
        helperText="Must be a positive whole number."
      >
        <Input
          {...register('acceptedWorkerCap')}
          inputMode="numeric"
          min={minAcceptedCap}
          maxW="200px"
        />
      </FormField>
    </SectionCard>
  )
}
