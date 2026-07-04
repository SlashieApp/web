'use client'

import { Stack } from '@chakra-ui/react'
import {
  LuCircleHelp,
  LuFlag,
  LuPencil,
  LuShare2,
  LuShieldCheck,
  LuTrash2,
  LuWallet,
} from 'react-icons/lu'

import { showAppToast } from '@/utils/appToast'
import { Button, Link, useDropdownClose } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { useShareTask } from './openTask/shareTask'

const SUPPORT_MAILTO = 'mailto:support@slashie.app'
const SAFETY_MAILTO = 'mailto:safety@slashie.app'

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
 * action: share, owner edit/cancel, payments info, safety and support links,
 * and report. Used by the desktop header, the compact app bar, and the mobile
 * collapsed header.
 */
export function TaskOverflowMenu() {
  const close = useDropdownClose()
  const { task, permissions, onCancelTask, cancelingTask } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || 'Task')

  if (!task) return null

  return (
    <Stack gap={1} p={1} minW="220px">
      <MenuAction
        icon={<LuShare2 />}
        label="Share task"
        onClick={() => {
          close()
          void onShare()
        }}
      />
      {permissions.canEditTask ? (
        <MenuAction
          icon={<LuPencil />}
          label="Edit task"
          href={`/tasks/${task.id}/edit`}
          onClick={close}
        />
      ) : null}
      <MenuAction
        icon={<LuWallet />}
        label="How payments work"
        onClick={() => {
          close()
          showAppToast({
            title: 'How payments work',
            description:
              'You pay (or get paid) directly. Slashie never handles job payment.',
            type: 'info',
          })
        }}
      />
      <MenuAction
        icon={<LuShieldCheck />}
        label="Report a safety issue"
        href={SAFETY_MAILTO}
        onClick={close}
      />
      <MenuAction
        icon={<LuCircleHelp />}
        label="Get help"
        href={SUPPORT_MAILTO}
        onClick={close}
      />
      <MenuAction
        icon={<LuFlag />}
        label="Report task"
        onClick={() => {
          close()
          showAppToast({
            title: 'Report received',
            description: 'Thanks — our safety team will review this task.',
            type: 'info',
          })
        }}
      />
      {permissions.canCancelTask ? (
        <MenuAction
          icon={<LuTrash2 />}
          label="Cancel task"
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
