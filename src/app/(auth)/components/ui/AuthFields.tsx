'use client'

import { Box, Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, type Ref, useState } from 'react'
import { LuEye, LuEyeOff, LuLock, LuMail } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { hitAreaGrowth } from '@/theme/styles'
import { IconButton, Input, type InputProps } from '@ui'

import bag from '../i11n.json'

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <Box as="span" color="text.muted" display="flex" aria-hidden>
      {children}
    </Box>
  )
}

const FIELD_ROOT = { minH: 'form.controlHeight', w: 'full' } as const

/** Email field for every auth form (spread `register('email')` onto it). */
export function EmailInput(props: InputProps) {
  const t = useI11n(bag).fields
  return (
    <Input
      startElement={
        <FieldIcon>
          <LuMail size={18} />
        </FieldIcon>
      }
      type="email"
      placeholder={t.emailPlaceholder}
      rootProps={FIELD_ROOT}
      {...props}
    />
  )
}

/** Password field with show / hide (spread `register(name)` onto it). */
export function PasswordInput(props: InputProps) {
  const t = useI11n(bag).fields
  const [visible, setVisible] = useState(false)
  return (
    <Input
      startElement={
        <FieldIcon>
          <LuLock size={18} />
        </FieldIcon>
      }
      endElement={
        <IconButton
          type="button"
          variant="ghost"
          aria-label={visible ? t.hidePassword : t.showPassword}
          onClick={() => setVisible((v) => !v)}
        >
          <FieldIcon>
            {visible ? <LuEyeOff size={18} /> : <LuEye size={18} />}
          </FieldIcon>
        </IconButton>
      }
      placeholder="••••••••"
      rootProps={FIELD_ROOT}
      {...props}
      type={visible ? 'text' : 'password'}
    />
  )
}

/** A checkbox row is one line of its label: 20 tall, like the control. */
const ROW_LINE_HEIGHT = 20

/**
 * Checkbox for every auth form (remember me, consent). Use with a `Controller`.
 *
 * It is a field group in the form rhythm (FE-481): the visible row is the
 * label's lines (20 each), so the gap above and below it is the field gap, and
 * its error sits `controlToHelper` (4) under it. The 44px hit area grows past
 * the row into the gaps around it, so it adds no space. A label may wrap: the
 * box stays level with its first line.
 */
export function AuthCheckbox({
  name,
  checked,
  onCheckedChange,
  inputRef,
  label,
  errorText,
}: {
  name: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  inputRef?: Ref<HTMLInputElement>
  label: ReactNode
  errorText?: string
}) {
  return (
    <Stack gap="form.controlToHelper">
      <Checkbox.Root
        name={name}
        checked={checked}
        onCheckedChange={(detail) => onCheckedChange(Boolean(detail.checked))}
        colorPalette="green"
      >
        <Checkbox.HiddenInput ref={inputRef} />
        <HStack gap={3} align="flex-start" {...hitAreaGrowth(ROW_LINE_HEIGHT)}>
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
            {label}
          </Checkbox.Label>
        </HStack>
      </Checkbox.Root>
      {errorText ? (
        <Text color="status.danger.fg" fontSize="sm">
          {errorText}
        </Text>
      ) : null}
    </Stack>
  )
}
