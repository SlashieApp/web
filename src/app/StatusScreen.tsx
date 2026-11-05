import type { ReactNode } from 'react'

import { StatusCard } from '@ui'

/**
 * Branded full-page message for the root 404 and error screens, the
 * unsubscribe page and the step-flow gates. The card is the shared
 * `StatusCard` (R6): centred in the page container, one width.
 */
export function StatusScreen({
  code,
  title,
  body,
  actions,
}: {
  code?: string
  title: string
  body: string
  actions: ReactNode
}) {
  return (
    <StatusCard
      fullPage
      logo
      code={code}
      title={title}
      body={body}
      actions={actions}
    />
  )
}
