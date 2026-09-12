'use client'

import { Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { TaskContactMethod } from '@codegen/schema'
import { LuShieldAlert } from 'react-icons/lu'

import type { ContactOption } from '@/app/(dashboard)/profile/profileEligibility'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, InfoBar, Link } from '@ui'

import bag from '../../i11n.json'
import { CreateTaskSection } from '../shared/CreateTaskSection'

export type CreateTaskContactSectionProps = {
  /** Bare mode for the stepped create flow (no Card/heading). */
  bare?: boolean
  /** Card header text (card mode only). */
  sectionHeading?: string
  preferredContactMethod: TaskContactMethod
  onPreferredContactMethodChange: (value: TaskContactMethod) => void
  contactOptions: ContactOption[]
  acceptedProhibitedUse?: boolean
  onAcceptedProhibitedUseChange?: (value: boolean) => void
  prohibitedError?: string
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
    bg: selected && enabled ? 'action.primary' : 'bg.surface',
    color:
      selected && enabled
        ? 'text.onGreen'
        : enabled
          ? 'text.default'
          : 'text.muted',
    boxShadow: 'none',
    disabled: !enabled,
    opacity: enabled ? 1 : 0.55,
    title: enabled ? undefined : 'Verify this contact method in Account first',
  }
}

export function CreateTaskContactSection({
  bare = false,
  sectionHeading = '6. Preferred contact',
  preferredContactMethod,
  onPreferredContactMethodChange,
  contactOptions,
  acceptedProhibitedUse,
  onAcceptedProhibitedUseChange,
  prohibitedError,
}: CreateTaskContactSectionProps) {
  const t = useI11n(bag)
  const showProhibitedNotice = Boolean(onAcceptedProhibitedUseChange)
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
    <CreateTaskSection bare={bare} heading={sectionHeading} bodyGap={4}>
      <Text fontSize="sm" color="text.muted">
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
        <Text fontSize="sm" color="text.muted">
          {phoneOption.disabledHint}
        </Text>
      ) : null}

      {emailOption && !emailOption.enabled ? (
        <Text fontSize="sm" color="text.muted">
          {emailOption.disabledHint}
        </Text>
      ) : null}

      {needsPhoneVerify ? (
        <Stack gap={2}>
          <Text fontSize="sm" color="text.muted">
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

      {showProhibitedNotice ? (
        <Stack gap={3}>
          <InfoBar
            tone="warning"
            icon={<LuShieldAlert size={20} />}
            heading={t.prohibitedHeading}
          >
            {t.prohibitedBody}
          </InfoBar>
          <Stack gap={1}>
            <Checkbox.Root
              checked={Boolean(acceptedProhibitedUse)}
              onCheckedChange={(detail) =>
                onAcceptedProhibitedUseChange?.(Boolean(detail.checked))
              }
              colorPalette="blue"
            >
              <Checkbox.HiddenInput />
              <HStack gap={3} align="flex-start">
                <Checkbox.Control
                  mt={0.5}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="border.default"
                  bg="bg.surface"
                  _checked={{
                    bg: 'action.primary',
                    borderColor: 'action.primary',
                    color: 'text.onGreen',
                  }}
                >
                  <Checkbox.Indicator color="inherit" />
                </Checkbox.Control>
                <Checkbox.Label
                  fontSize="sm"
                  fontWeight={500}
                  color="text.default"
                  lineHeight="1.5"
                >
                  {t.prohibitedConfirm}
                </Checkbox.Label>
              </HStack>
            </Checkbox.Root>
            {prohibitedError ? (
              <Text color="status.danger.fg" fontSize="sm">
                {prohibitedError}
              </Text>
            ) : null}
          </Stack>
        </Stack>
      ) : null}
    </CreateTaskSection>
  )
}
