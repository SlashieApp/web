'use client'

import { useState } from 'react'
import { LuEllipsisVertical, LuFlag } from 'react-icons/lu'

import type { ReportTargetKind } from '@/content/trust/reportMailto'
import { useI11n } from '@/i18n/useI11n'

import { Button } from '../Button/Button'
import { Dropdown, useDropdownClose } from '../Dropdown/Dropdown'
import { IconButton } from '../IconButton/IconButton'
import { ReportDialog } from './ReportDialog'
import bag from './i11n.json'

export type ReportControlVariant = 'button' | 'menu' | 'icon' | 'overflow'

export type ReportControlProps = {
  kind: ReportTargetKind
  targetId: string
  targetTitle?: string
  pageUrl?: string
  variant?: ReportControlVariant
  /** Called after the trigger opens the dialog (e.g. close a parent menu). */
  onOpened?: () => void
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
 * Report entry: opens {@link ReportDialog}, then a prefilled admin mailto.
 * `overflow` is the search-card ⋮ menu (report only).
 */
export function ReportControl({
  kind,
  targetId,
  targetTitle,
  pageUrl,
  variant = 'button',
  onOpened,
}: ReportControlProps) {
  const t = useI11n(bag)
  const [open, setOpen] = useState(false)
  const closeDropdown = useDropdownClose()

  const openDialog = () => {
    // Only close *this* overflow dropdown. A `menu` trigger lives inside a
    // parent ⋮ panel — closing that parent would unmount this control and
    // kill the dialog before it opens.
    if (variant === 'overflow') closeDropdown()
    onOpened?.()
    setOpen(true)
  }

  const dialog = (
    <ReportDialog
      open={open}
      onOpenChange={setOpen}
      kind={kind}
      targetId={targetId}
      targetTitle={targetTitle}
      pageUrl={pageUrl}
    />
  )

  if (variant === 'overflow') {
    return (
      <>
        <Dropdown
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
