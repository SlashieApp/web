'use client'

import { Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useI11n } from '@/i18n/useI11n'

import { FormStack } from '../FormStack/FormStack'
import { Modal } from '../Modal/Modal'
import { SafetyNotice } from './SafetyNotice'
import bag from './i11n.json'

export type SafetyConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  confirmLoading?: boolean
  /** Block confirm until the content above is complete (e.g. a slot pick). */
  confirmDisabled?: boolean
  title?: string
  confirmLabel?: string
  /** Extra content above the safety notice (e.g. choosing a time). */
  children?: ReactNode
}

/**
 * Accept-quote confirm: C2C + meet-safely one-liner before the mutation. The
 * body is a `FormStack`: the choice above (a time), the notice and the hint sit
 * `formSpace.fieldGap` (20) apart, and the body ends 20 above the buttons.
 */
export function SafetyConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  confirmLoading = false,
  confirmDisabled = false,
  title,
  confirmLabel,
  children,
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
      submitDisabled={confirmDisabled}
    >
      <FormStack>
        {children}
        <SafetyNotice variant="inline" />
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {t.acceptHint}
        </Text>
      </FormStack>
    </Modal>
  )
}
