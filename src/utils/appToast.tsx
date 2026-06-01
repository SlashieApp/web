'use client'

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react'

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
        {(toast) => (
          <Toast.Root width={{ md: 'sm' }}>
            {toast.type === 'loading' ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title ? <Toast.Title>{toast.title}</Toast.Title> : null}
              {toast.description ? (
                <Toast.Description>{toast.description}</Toast.Description>
              ) : null}
            </Stack>
            {toast.action ? (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            ) : null}
            {toast.closable ? <Toast.CloseTrigger /> : null}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
