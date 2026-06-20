'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { TaskContactMethod } from '@codegen/schema'

import type { ContactOption } from '@/app/(dashboard)/profile/profileEligibility'
import { Button, Card, FormField, Link } from '@ui'

export type CreateTaskContactSectionProps = {
  preferredContactMethod: TaskContactMethod
  onPreferredContactMethodChange: (value: TaskContactMethod) => void
  contactOptions: ContactOption[]
}

function contactButtonProps(
  method: TaskContactMethod,
  preferredContactMethod: TaskContactMethod,
  enabled: boolean,
) {
  const selected = preferredContactMethod === method
  return {
    type: 'button' as const,
    size: 'sm' as const,
    variant: 'ghost' as const,
    bg: selected && enabled ? 'primary.600' : 'cardBg',
    color:
      selected && enabled ? 'white' : enabled ? 'cardFg' : 'formLabelMuted',
    boxShadow: 'none',
    disabled: !enabled,
    opacity: enabled ? 1 : 0.55,
    title: enabled ? undefined : 'Verify this contact method in Account first',
  }
}

export function CreateTaskContactSection({
  preferredContactMethod,
  onPreferredContactMethodChange,
  contactOptions,
}: CreateTaskContactSectionProps) {
  const optionByMethod = Object.fromEntries(
    contactOptions.map((option) => [option.value, option]),
  ) as Partial<Record<TaskContactMethod, ContactOption>>

  const phoneOption = optionByMethod[TaskContactMethod.Phone]
  const emailOption = optionByMethod[TaskContactMethod.Email]
  const needsPhoneVerify =
    preferredContactMethod === TaskContactMethod.Phone &&
    phoneOption &&
    !phoneOption.enabled

  return (
    <Card
      layout="section"
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
            {...contactButtonProps(
              TaskContactMethod.InApp,
              preferredContactMethod,
              true,
            )}
            onClick={() =>
              onPreferredContactMethodChange(TaskContactMethod.InApp)
            }
          >
            In-app chat
          </Button>
          <Button
            {...contactButtonProps(
              TaskContactMethod.Phone,
              preferredContactMethod,
              phoneOption?.enabled ?? false,
            )}
            onClick={() => {
              if (phoneOption?.enabled) {
                onPreferredContactMethodChange(TaskContactMethod.Phone)
              }
            }}
          >
            Phone
          </Button>
          <Button
            {...contactButtonProps(
              TaskContactMethod.Email,
              preferredContactMethod,
              emailOption?.enabled ?? false,
            )}
            onClick={() => {
              if (emailOption?.enabled) {
                onPreferredContactMethodChange(TaskContactMethod.Email)
              }
            }}
          >
            Email
          </Button>
        </HStack>
      </FormField>

      {phoneOption && !phoneOption.enabled ? (
        <Text fontSize="sm" color="formLabelMuted">
          {phoneOption.disabledHint}
        </Text>
      ) : null}

      {emailOption && !emailOption.enabled ? (
        <Text fontSize="sm" color="formLabelMuted">
          {emailOption.disabledHint}
        </Text>
      ) : null}

      {needsPhoneVerify ? (
        <Stack gap={2}>
          <Text fontSize="sm" color="formLabelMuted">
            Phone contact requires a verified mobile number on your account.
          </Text>
          <Link
            href="/account"
            alignSelf="flex-start"
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm" variant="secondary">
              Verify phone in Account
            </Button>
          </Link>
        </Stack>
      ) : null}
    </Card>
  )
}
