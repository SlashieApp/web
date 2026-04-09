'use client'

import { HStack, Stack } from '@chakra-ui/react'
import { TaskContactMethod } from '@codegen/schema'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { Heading, Text } from '@ui'

export type CreateTaskContactSectionProps = {
  preferredContactMethod: TaskContactMethod
  onPreferredContactMethodChange: (value: TaskContactMethod) => void
}

export function CreateTaskContactSection({
  preferredContactMethod,
  onPreferredContactMethodChange,
}: CreateTaskContactSectionProps) {
  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={4}>
        <Heading size="lg" color="primary.700">
          4. Preferred contact
        </Heading>
        <Text fontSize="sm" color="muted">
          We share contact details from your Slashie profile using the method
          you choose below. Update your phone, email, or in-app preferences in
          account settings if needed.
        </Text>

        <FormField label="How should workers reach you?">
          <HStack gap={2} flexWrap="wrap">
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
              In-app chat
            </Button>
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
          </HStack>
        </FormField>
      </Stack>
    </GlassCard>
  )
}
