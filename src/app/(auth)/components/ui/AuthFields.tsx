'use client'

import { Box } from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'
import { LuEye, LuEyeOff, LuLock, LuMail } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import {
  FormCheckbox,
  type FormCheckboxProps,
  IconButton,
  Input,
  type InputProps,
} from '@ui'

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

/**
 * Checkbox for every auth form (remember me, consent). Use with a `Controller`.
 * It is the shared {@link FormCheckbox}: a field group in the form rhythm, its
 * error announced and tied to the box.
 */
export function AuthCheckbox(props: FormCheckboxProps) {
  return <FormCheckbox {...props} />
}
