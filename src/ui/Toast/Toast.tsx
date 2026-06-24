'use client'

import {
  Toast as ChakraToast,
  Spinner,
  Stack,
  type ToastRootProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuX } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'

/**
 * SDL Toast — presentational chrome for a single toast. Render it inside a
 * Chakra `Toaster` callback (the toaster machine keeps placement, stacking,
 * auto-dismiss timing, swipe and enter/exit animation); this component supplies
 * SDL surface + status styling.
 *
 * Status is never colour alone: `Toast.Indicator` renders a type icon (and the
 * title is the label), so meaning survives without colour. Green/solid fills are
 * not used for text, so no green-ink concern applies here.
 */
export type UiToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

type SdlStatusFamily = 'success' | 'danger' | 'info' | 'warning'

const familyByType: Record<UiToastType, SdlStatusFamily> = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
  loading: 'info',
}

/**
 * Minimal shape of the Ark/Chakra toast object passed to the Toaster render fn.
 * `type` is widened to `string` so the raw toaster payload assigns cleanly; it is
 * narrowed back to a known {@link UiToastType} (default `info`) at render.
 */
export type UiToastData = {
  id?: string
  type?: string
  title?: ReactNode
  description?: ReactNode
  action?: { label: ReactNode }
  closable?: boolean
}

export type UiToastProps = ToastRootProps & {
  toast: UiToastData
}

function toToastType(value: string | undefined): UiToastType {
  return value && value in familyByType ? (value as UiToastType) : 'info'
}

export function Toast({ toast, ...rootProps }: UiToastProps) {
  const type = toToastType(toast.type)
  const family = familyByType[type]

  return (
    <ChakraToast.Root
      width={{ md: 'sm' }}
      bg="bg.surface"
      color="text.default"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      boxShadow="e3"
      gap="3"
      p="4"
      alignItems="flex-start"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
      {...rootProps}
    >
      {type === 'loading' ? (
        <Spinner
          size="sm"
          color={`status.${family}.solid`}
          borderWidth="2px"
          mt="0.5"
        />
      ) : (
        <ChakraToast.Indicator color={`status.${family}.solid`} mt="0.5" />
      )}

      <Stack gap="1" flex="1" maxWidth="100%">
        {toast.title ? (
          <ChakraToast.Title
            color="text.default"
            fontSize="sm"
            fontWeight={600}
            lineHeight="1.35"
          >
            {toast.title}
          </ChakraToast.Title>
        ) : null}
        {toast.description ? (
          <ChakraToast.Description color="text.muted" fontSize="sm">
            {toast.description}
          </ChakraToast.Description>
        ) : null}
      </Stack>

      {toast.action ? (
        <ChakraToast.ActionTrigger
          color="text.link"
          fontWeight={600}
          fontSize="sm"
        >
          {toast.action.label}
        </ChakraToast.ActionTrigger>
      ) : null}

      {toast.closable ? (
        <ChakraToast.CloseTrigger
          aria-label="Dismiss notification"
          color="text.muted"
          borderRadius="md"
          _hover={{ color: 'text.default', bg: 'bg.subtle' }}
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'border.focus',
            outlineOffset: '2px',
          }}
        >
          <LuX />
        </ChakraToast.CloseTrigger>
      ) : null}
    </ChakraToast.Root>
  )
}
