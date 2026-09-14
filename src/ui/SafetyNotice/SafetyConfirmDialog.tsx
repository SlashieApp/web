'use client'

import { Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'

import { Modal } from '../Modal/Modal'
import { SafetyNotice } from './SafetyNotice'
import bag from './i11n.json'

export type SafetyConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  confirmLoading?: boolean
  title?: string
  confirmLabel?: string
}

/** Accept-quote confirm: C2C + meet-safely one-liner before the mutation. */
export function SafetyConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmLoading = false,
  title,
  confirmLabel,
}: SafetyConfirmDialogProps) {
  const t = useI11n(bag)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? t.acceptTitle}
      submitLabel={confirmLabel ?? t.acceptCta}
      onSubmit={onConfirm}
      submitLoading={confirmLoading}
    >
      <SafetyNotice variant="inline" />
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {t.acceptHint}
      </Text>
    </Modal>
  )
}
