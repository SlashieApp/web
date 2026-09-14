'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack } from '@chakra-ui/react'
import {
  LuCircleHelp,
  LuPencil,
  LuShare2,
  LuShieldCheck,
  LuTrash2,
} from 'react-icons/lu'
import bag from '../../i11n.json'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { ReportControl } from '@/content/trust/ReportControl'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { Button, Link, useDropdownClose } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { useShareTask } from './openTask/shareTask'

function MenuAction({
  icon,
  label,
  href,
  onClick,
  danger,
  loading,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  danger?: boolean
  loading?: boolean
}) {
  const button = (
    <Button
      variant="ghost"
      justifyContent="flex-start"
      w="full"
      onClick={onClick}
      loading={loading}
      color={danger ? 'status.danger.fg' : undefined}
    >
      {icon}
      {label}
    </Button>
  )
  return href ? (
    <Link href={href} _hover={{ textDecoration: 'none' }} display="block">
      {button}
    </Link>
  ) : (
    button
  )
}

/**
 * Shared task-detail overflow menu (the "⋮" dropdown). Holds every task-level
 * action: share, owner edit/cancel, safety, support, and report. Used by the
 * desktop header, the compact app bar, and the mobile collapsed header.
 */
export function TaskOverflowMenu() {
  const close = useDropdownClose()
  const t = useI11n(bag)
  const { task, permissions, onCancelTask, cancelingTask } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  return (
    <Stack gap={1} p={1} minW="220px">
      <MenuAction
        icon={<LuShare2 />}
        label={t.actions.shareTask}
        onClick={() => {
          close()
          void onShare()
        }}
      />
      {permissions.canEditTask ? (
        <MenuAction
          icon={<LuPencil />}
          label={t.actions.editTask}
          href={`/tasks/${task.id}/edit`}
          onClick={close}
        />
      ) : null}
      <MenuAction
        icon={<LuShieldCheck />}
        label={t.actions.payingMeetingSafely}
        href={SAFETY_HREF}
        onClick={close}
      />
      <MenuAction
        icon={<LuCircleHelp />}
        label={t.actions.getHelp}
        href={`mailto:${LEGAL_CONTACT_EMAIL}`}
        onClick={close}
      />
      <ReportControl
        kind="task"
        targetId={task.id}
        targetTitle={task.title?.trim() || undefined}
        variant="menu"
      />
      {permissions.canCancelTask ? (
        <MenuAction
          icon={<LuTrash2 />}
          label={t.actions.cancelTask}
          danger
          loading={cancelingTask}
          onClick={() => {
            // `onCancelTask` confirms before mutating; keep the menu open state
            // out of the way first.
            close()
            void onCancelTask()
          }}
        />
      ) : null}
    </Stack>
  )
}
