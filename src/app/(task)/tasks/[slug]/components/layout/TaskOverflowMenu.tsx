'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Stack, Text } from '@chakra-ui/react'
import {
  LuCircleHelp,
  LuEllipsisVertical,
  LuPencil,
  LuShare2,
  LuShieldCheck,
  LuTrash2,
} from 'react-icons/lu'
import bag from '../../i11n.json'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { Button, Card, Dropdown, IconButton, Link, useDropdownClose } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskReportControl } from '../ui/TaskReportControl'
import { useShareTask } from '../ui/openTask/shareTask'

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
  const color = danger ? 'status.danger.fg' : undefined
  if (href) {
    return (
      <Button
        asChild
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        color={color}
      >
        <Link href={href} _hover={{ textDecoration: 'none' }} onClick={onClick}>
          {icon}
          {label}
        </Link>
      </Button>
    )
  }
  return (
    <Button
      variant="ghost"
      justifyContent="flex-start"
      w="full"
      onClick={onClick}
      loading={loading}
      color={color}
    >
      {icon}
      {label}
    </Button>
  )
}

export function TaskOverflowActions({
  onDone,
  packed = false,
}: {
  onDone?: () => void
  packed?: boolean
}) {
  const close = onDone ?? (() => {})
  const t = useI11n(bag)
  const { task, permissions, onCancelTask, cancelingTask, cancelError } =
    useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  return (
    <Stack
      gap={1}
      p={packed ? 1 : 0}
      minW={packed ? '220px' : undefined}
      w="full"
    >
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
      <TaskReportControl variant="menu" onOpened={close} />
      {permissions.canCancelTask ? (
        <>
          <MenuAction
            icon={<LuTrash2 />}
            label={t.actions.cancelTask}
            danger
            loading={cancelingTask}
            onClick={() => {
              // `onCancelTask` confirms before mutating; keep the menu open
              // state out of the way first.
              close()
              void onCancelTask()
            }}
          />
          {cancelError ? (
            <Text fontSize="sm" color="status.danger.fg" px={1}>
              {cancelError}
            </Text>
          ) : null}
        </>
      ) : null}
    </Stack>
  )
}

/**
 * Shared task-detail overflow menu. Holds every task-level action: share,
 * owner edit/cancel, safety, support, and report.
 */
export function TaskOverflowMenu() {
  const close = useDropdownClose()
  return <TaskOverflowActions onDone={close} packed />
}

/**
 * Mobile overflow: three-dots next to the overview intro, same actions as the
 * desktop Help & actions card.
 */
export function TaskHelpOverflowTrigger() {
  const t = useI11n(bag)

  return (
    <Dropdown
      contentLabel={t.nav.taskOptionsAria}
      align="end"
      mobilePlacement="bottom"
      trigger={
        <IconButton
          type="button"
          variant="ghost"
          aria-label={t.nav.taskOptionsAria}
        >
          <LuEllipsisVertical />
        </IconButton>
      }
    >
      <TaskOverflowMenu />
    </Dropdown>
  )
}

/** Desktop Help & actions card. Mobile uses {@link TaskHelpOverflowTrigger}. */
export function TaskHelpActions() {
  const t = useI11n(bag)

  return (
    <Box display={{ base: 'none', lg: 'block' }}>
      <Card layout="section" heading={t.actions.helpHeading}>
        <TaskOverflowActions />
      </Card>
    </Box>
  )
}
