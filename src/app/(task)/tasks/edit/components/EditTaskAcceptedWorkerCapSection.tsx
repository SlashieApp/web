'use client'

import { Heading, Text } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { Card, FormField, Input } from '@ui'

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
    <Card
      layout="section"
      bodyGap={4}
      header={
        <Heading size="lg" color="text.link">
          Worker slots
        </Heading>
      }
    >
      <Text fontSize="sm" color="text.muted">
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
    </Card>
  )
}
