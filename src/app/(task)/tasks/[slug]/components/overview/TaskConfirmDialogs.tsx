'use client'

import { useI11n } from '@/i18n/useI11n'
import { Modal } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ConfirmDialogProps = DialogProps & {
  title: string
  body: string
  /** The secondary button, on the left: it keeps things as they are. */
  keepLabel: string
  confirmLabel: string
  /** The call is running: the confirm button shows busy. */
  busy: boolean
  /**
   * The action. Resolves true once it worked and the dialog closes; a failure
   * keeps it open (the caller shows the error in a toast).
   */
  onConfirm: () => Promise<boolean>
}

/**
 * One title, one sentence, Keep and a red confirm button: the pattern of
 * Cancel booking, Cancel task and Withdraw quote (the app's `ConfirmDialog`).
 * The sentence is the Modal's description (8 under the title, and what the
 * dialog is described by, so a screen reader hears what will happen before it
 * reaches the buttons); there is no body, and the buttons sit 24 under it.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  keepLabel,
  confirmLabel,
  busy,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={body}
      size="sm"
      cancelLabel={keepLabel}
      submitLabel={confirmLabel}
      submitVariant="danger"
      submitLoading={busy}
      onSubmit={() => {
        void onConfirm().then((ok) => {
          if (ok) onOpenChange(false)
        })
      }}
    />
  )
}

/** Cancel the task the owner posted; workers can no longer send quotes. */
export function CancelTaskDialog({ open, onOpenChange }: DialogProps) {
  const { onCancelTask, cancelingTask } = useTaskDetail()
  const a = useI11n(bag).actions

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={a.cancelTask}
      body={a.cancelConfirm}
      keepLabel={a.keep}
      confirmLabel={a.cancelTask}
      busy={cancelingTask}
      onConfirm={onCancelTask}
    />
  )
}

/** Withdraw the viewer's own pending quote. */
export function WithdrawQuoteDialog({
  open,
  onOpenChange,
  onWithdrawn,
}: DialogProps & {
  /** Runs once the quote is withdrawn (the quote page leaves for the task). */
  onWithdrawn?: () => void
}) {
  const { onWithdrawQuote, withdrawingQuote } = useTaskDetail()
  const a = useI11n(bag).actions

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={a.withdrawQuote}
      body={a.withdrawQuoteConfirm}
      keepLabel={a.keep}
      confirmLabel={a.withdrawQuote}
      busy={withdrawingQuote}
      onConfirm={async () => {
        const withdrawn = await onWithdrawQuote()
        if (withdrawn) onWithdrawn?.()
        return withdrawn
      }}
    />
  )
}
