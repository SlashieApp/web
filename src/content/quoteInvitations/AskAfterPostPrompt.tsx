'use client'

import { Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Modal } from '@ui'

import bag from './i11n.json'

export type AskAfterPostPromptProps = {
  open: boolean
  /** Close without sending: Not now, Escape, the scrim. */
  onSkip: () => void
  /** The worker's first name. */
  workerName: string
  /** Sends the invitation; true once it went through. */
  onAsk: () => Promise<boolean>
  asking?: boolean
  error?: string | null
}

/**
 * On the new task's page, after Post a task carried a worker (FE-507). It
 * asks; nothing is sent until "Ask {name}" is tapped.
 */
export function AskAfterPostPrompt({
  open,
  onSkip,
  workerName,
  onAsk,
  asking = false,
  error = null,
}: AskAfterPostPromptProps) {
  const t = useI11n(bag).prompt
  const vars = { name: workerName }
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next && !asking) onSkip()
      }}
      title={formatMessage(t.title, vars)}
      description={formatMessage(t.description, vars)}
      cancelLabel={t.notNow}
      onCancel={onSkip}
      submitLabel={formatMessage(t.submit, vars)}
      submitLoading={asking}
      submitDisabled={asking}
      onSubmit={() => void onAsk()}
    >
      {error ? (
        <Text fontSize="sm" color="status.danger.fg" role="alert">
          {error}
        </Text>
      ) : null}
    </Modal>
  )
}
