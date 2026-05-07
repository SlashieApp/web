'use client'

import { HStack, Heading, Text } from '@chakra-ui/react'
import { TaskContactMethod } from '@codegen/schema'

import { Button, FormField, SectionCard } from '@ui'

export type CreateTaskContactSectionProps = {
  preferredContactMethod: TaskContactMethod
  onPreferredContactMethodChange: (value: TaskContactMethod) => void
}

export function CreateTaskContactSection({
  preferredContactMethod,
  onPreferredContactMethodChange,
}: CreateTaskContactSectionProps) {
  return (
    <SectionCard
      bodyGap={4}
      header={
        <Heading size="lg" color="primary.700">
          6. Preferred contact
        </Heading>
      }
    >
      <Text fontSize="sm" color="formLabelMuted">
        We prefill this from your Slashie profile default when you start a new
        task. You can override it for this post. Update the default anytime in
        your account profile.
      </Text>

      <FormField label="How should workers reach you?">
        <HStack gap={2} flexWrap="wrap">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={
              preferredContactMethod === TaskContactMethod.InApp
                ? 'primary.600'
                : 'cardBg'
            }
            color={
              preferredContactMethod === TaskContactMethod.InApp
                ? 'white'
                : 'cardFg'
            }
            boxShadow="none"
            onClick={() =>
              onPreferredContactMethodChange(TaskContactMethod.InApp)
            }
          >
            In-app chat
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            bg={
              preferredContactMethod === TaskContactMethod.Phone
                ? 'primary.600'
                : 'cardBg'
            }
            color={
              preferredContactMethod === TaskContactMethod.Phone
                ? 'white'
                : 'cardFg'
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
            variant="ghost"
            bg={
              preferredContactMethod === TaskContactMethod.Email
                ? 'primary.600'
                : 'cardBg'
            }
            color={
              preferredContactMethod === TaskContactMethod.Email
                ? 'white'
                : 'cardFg'
            }
            boxShadow="none"
            onClick={() =>
              onPreferredContactMethodChange(TaskContactMethod.Email)
            }
          >
            Email
          </Button>
        </HStack>
      </FormField>
    </SectionCard>
  )
}
