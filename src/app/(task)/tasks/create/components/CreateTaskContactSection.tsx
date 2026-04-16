'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { TaskContactMethod } from '@codegen/schema'

import { Button } from '@/ui/Button'
import { FormField } from '@/ui/FormField/FormField'

export type CreateTaskContactSectionProps = {
  preferredContactMethod: TaskContactMethod
  onPreferredContactMethodChange: (value: TaskContactMethod) => void
}

export function CreateTaskContactSection({
  preferredContactMethod,
  onPreferredContactMethodChange,
}: CreateTaskContactSectionProps) {
  return (
    <Box p={{ base: 5, md: 6 }} bg="neutral.100">
      <Stack gap={4}>
        <Heading size="lg" color="primary.700">
          4. Preferred contact
        </Heading>
        <Text fontSize="sm" color="formLabelMuted">
          We share contact details from your Slashie profile using the method
          you choose below. Update your phone, email, or in-app preferences in
          account settings if needed.
        </Text>

        <FormField label="How should workers reach you?">
          <HStack gap={2} flexWrap="wrap">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              bg={
                preferredContactMethod === TaskContactMethod.InApp
                  ? 'jobCardBg'
                  : 'jobCardBg'
              }
              color={
                preferredContactMethod === TaskContactMethod.InApp
                  ? 'jobCardTitle'
                  : 'jobCardTitle'
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
                  ? 'jobCardBg'
                  : 'jobCardBg'
              }
              color={
                preferredContactMethod === TaskContactMethod.Phone
                  ? 'jobCardTitle'
                  : 'jobCardTitle'
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
                  ? 'jobCardBg'
                  : 'jobCardBg'
              }
              color={
                preferredContactMethod === TaskContactMethod.Email
                  ? 'jobCardTitle'
                  : 'jobCardTitle'
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
    </Box>
  )
}
