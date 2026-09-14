'use client'

import {
  Toaster as ChakraToaster,
  Portal,
  createToaster,
} from '@chakra-ui/react'

import { Toast } from '@ui'
import {
  ACCOUNT_DISABLED_ERROR_CODE,
  ACCOUNT_DISABLED_FRIENDLY_MESSAGE,
} from './graphqlErrors'

export const appToaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
  overlap: true,
  gap: 12,
})

export type AppToastOptions = {
  title: string
  description?: string
  type?: 'success' | 'error' | 'info' | 'warning' | 'loading'
  duration?: number
}

function isAccountDisabledToast(title: string, description?: string) {
  const haystack = [title, description ?? '']
  return haystack.some(
    (value) =>
      value === ACCOUNT_DISABLED_FRIENDLY_MESSAGE ||
      value.trim().toUpperCase() === ACCOUNT_DISABLED_ERROR_CODE,
  )
}

export function showAppToast({
  title,
  description,
  type = 'success',
  duration = 5000,
}: AppToastOptions) {
  // Disabled accounts already see the persistent banner — skip toast loops.
  if (isAccountDisabledToast(title, description)) return

  appToaster.create({
    title,
    description,
    type,
    duration,
  })
}

export function AppToastHost() {
  return (
    <Portal>
      <ChakraToaster toaster={appToaster} insetInline={{ mdDown: '4' }}>
        {(toast) => <Toast toast={toast} />}
      </ChakraToaster>
    </Portal>
  )
}
