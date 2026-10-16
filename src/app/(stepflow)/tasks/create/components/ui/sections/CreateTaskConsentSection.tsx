'use client'

import { Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { LuShieldAlert } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { InfoBar } from '@ui'

import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskConsentSectionProps = {
  accepted: boolean
  onChange: (accepted: boolean) => void
  /** Copy key from the form schema. */
  errorText?: string
}

/** The allowed-tasks notice and the confirmation posting needs. */
export function CreateTaskConsentSection({
  accepted,
  onChange,
  errorText,
}: CreateTaskConsentSectionProps) {
  const t = useI11n(bag)
  const f = t.fields

  return (
    <Stack gap={3}>
      <InfoBar
        tone="warning"
        icon={<LuShieldAlert size={20} />}
        heading={f.allowedHeading}
        badgeLabel={f.allowedBadge}
      >
        {f.allowedBody}
      </InfoBar>
      <Stack gap={1}>
        <Checkbox.Root
          checked={accepted}
          onCheckedChange={(detail) => onChange(Boolean(detail.checked))}
          invalid={Boolean(errorText)}
        >
          <Checkbox.HiddenInput />
          <HStack gap={3} align="flex-start" minH="44px">
            <Checkbox.Control
              mt={0.5}
              borderRadius="md"
              borderWidth="1px"
              borderColor="border.strong"
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
              {f.allowedConfirm}
            </Checkbox.Label>
          </HStack>
        </Checkbox.Root>
        {errorText ? (
          <Text color="status.danger.fg" fontSize="sm" role="alert">
            {taskFieldError(t.errors, errorText)}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )
}
