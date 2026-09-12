'use client'

import { useState } from 'react'
import { LuEllipsisVertical, LuFlag } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import { Button } from '../Button/Button'
import { Dropdown, useDropdownClose } from '../Dropdown/Dropdown'
import { IconButton } from '../IconButton/IconButton'
import { ReportDialog } from './ReportDialog'
import bag from './i11n.json'
import type { ReportFormValues, ReportTargetKind } from './reportFormSchema'

export type ReportControlVariant = 'button' | 'menu' | 'icon' | 'overflow'

export type ReportControlProps = {
  kind: ReportTargetKind
  targetId: string
  targetTitle?: string
  variant?: ReportControlVariant
  /** Called after the trigger opens the dialog (e.g. close a parent menu). */
  onOpened?: () => void
  /** Return false to block opening (e.g. redirect to login). */
  onRequestOpen?: () => boolean
  onSubmit: (values: ReportFormValues) => Promise<boolean>
  submitting?: boolean
  submitError?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function ReportTrigger({
  kind,
  variant,
  onOpen,
}: {
  kind: ReportTargetKind
  variant: Exclude<ReportControlVariant, 'overflow'>
  onOpen: () => void
}) {
  const t = useI11n(bag)
  const label = kind === 'worker' ? t.reportWorker : t.reportTask
  const aria = kind === 'worker' ? t.reportWorkerAria : t.reportTaskAria

  if (variant === 'icon') {
    return (
      <IconButton
        type="button"
        aria-label={aria}
        variant="ghost"
        onClick={onOpen}
      >
        <LuFlag size={18} />
      </IconButton>
    )
  }

  if (variant === 'menu') {
    return (
      <Button
        type="button"
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        onClick={onOpen}
      >
        <LuFlag />
        {label}
      </Button>
    )
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onOpen}>
      <LuFlag />
      {label}
    </Button>
  )
}

/**
 * Presentational report entry. The connected adapter supplies `onSubmit`
 * (GraphQL `createReport`) and auth gating via `onRequestOpen`.
 */
export function ReportControl({
  kind,
  variant = 'button',
  onOpened,
  onRequestOpen,
  onSubmit,
  submitting,
  submitError,
  open: openProp,
  onOpenChange,
}: ReportControlProps) {
  const t = useI11n(bag)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const closeDropdown = useDropdownClose()
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const openDialog = () => {
    if (onRequestOpen && !onRequestOpen()) return
    if (variant === 'overflow') closeDropdown()
    onOpened?.()
    setOpen(true)
  }

  const dialog = (
    <ReportDialog
      open={open}
      onOpenChange={setOpen}
      kind={kind}
      onSubmit={onSubmit}
      submitting={submitting}
      submitError={submitError}
    />
  )

  if (variant === 'overflow') {
    return (
      <>
        <Dropdown
          contentLabel={t.moreActionsAria}
          trigger={
            <IconButton
              type="button"
              aria-label={t.moreActionsAria}
              variant="ghost"
            >
              <LuEllipsisVertical />
            </IconButton>
          }
        >
          <ReportTrigger kind={kind} variant="menu" onOpen={openDialog} />
        </Dropdown>
        {dialog}
      </>
    )
  }

  return (
    <>
      <ReportTrigger kind={kind} variant={variant} onOpen={openDialog} />
      {dialog}
    </>
  )
}
