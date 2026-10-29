'use client'

import { Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { LuShieldAlert } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { hitAreaGrowth } from '@/theme/styles'
import { FormStack, InfoBar } from '@ui'

import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

/** A checkbox row is one line of its label: 20 tall, like the control. */
const ROW_LINE_HEIGHT = 20

export type CreateTaskConsentSectionProps = {
  accepted: boolean
  onChange: (accepted: boolean) => void
  /** Copy key from the form schema. */
  errorText?: string
}

/**
 * The allowed-tasks notice and the confirmation posting needs.
 *
 * Form spacing (FE-481): the notice and the checkbox are field groups, `fieldGap`
 * (20) apart. The row is the label's lines (20 each), so the gap above and below
 * it is the field gap, and its error sits `controlToHelper` (4) under it. The
 * 44px hit area grows past the row into the gaps around it, so it adds no space.
 */
export function CreateTaskConsentSection({
  accepted,
  onChange,
  errorText,
}: CreateTaskConsentSectionProps) {
  const t = useI11n(bag)
  const f = t.fields

  return (
    <FormStack>
      <InfoBar
        tone="warning"
        icon={<LuShieldAlert size={20} />}
        heading={f.allowedHeading}
        badgeLabel={f.allowedBadge}
      >
        {f.allowedBody}
      </InfoBar>
      <Stack gap="form.controlToHelper">
        <Checkbox.Root
          checked={accepted}
          onCheckedChange={(detail) => onChange(Boolean(detail.checked))}
          invalid={Boolean(errorText)}
        >
          <Checkbox.HiddenInput />
          <HStack
            gap={3}
            align="flex-start"
            {...hitAreaGrowth(ROW_LINE_HEIGHT)}
          >
            <Checkbox.Control
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
              lineHeight={`${ROW_LINE_HEIGHT}px`}
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
    </FormStack>
  )
}
