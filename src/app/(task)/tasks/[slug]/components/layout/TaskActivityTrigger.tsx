'use client'

import { useState } from 'react'
import { LuHistory } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Drawer, IconButton } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { TaskActivitySections } from '../overview/TaskActivitySections'

/**
 * Compact Activity control: icon in the sticky title row, drawer for the
 * timeline / booking / complete-job blocks.
 */
export function TaskActivityTrigger() {
  const t = useI11n(bag)
  const { task, pending } = useTaskDetail()
  const [open, setOpen] = useState(false)

  if (!task && !pending) return null

  return (
    <>
      <IconButton
        type="button"
        variant="ghost"
        aria-label={t.nav.taskActivityAria}
        onClick={() => setOpen(true)}
      >
        <LuHistory />
      </IconButton>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={t.activity.heading}
        placement="end"
        size="md"
      >
        <TaskActivitySections />
      </Drawer>
    </>
  )
}
