'use client'

import {
  Toaster as ChakraToaster,
  Portal,
  createToaster,
} from '@chakra-ui/react'

import { Toast } from '@ui'

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

export function showAppToast({
  title,
  description,
  type = 'success',
  duration = 5000,
}: AppToastOptions) {
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
