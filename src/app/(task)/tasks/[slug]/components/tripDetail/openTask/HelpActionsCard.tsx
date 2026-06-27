'use client'

import { Stack, Text, Wrap } from '@chakra-ui/react'
import { useCallback } from 'react'
import {
  LuCircleHelp,
  LuPencil,
  LuShieldCheck,
  LuTrash2,
  LuWallet,
} from 'react-icons/lu'

import { showAppToast } from '@/utils/appToast'
import { Button, Card, Link } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'

const SUPPORT_MAILTO = 'mailto:support@slashie.app'
const SAFETY_MAILTO = 'mailto:safety@slashie.app'

function ActionButton({
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
      onClick={onClick}
      loading={loading}
      color={danger ? 'status.danger.fg' : undefined}
    >
      {icon}
      {label}
    </Button>
  )
  return href ? (
    <Link href={href} _hover={{ textDecoration: 'none' }}>
      {button}
    </Link>
  ) : (
    button
  )
}

/**
 * "Help & actions" — one card for all viewers; the CTA list is driven by
 * permissions (owner gets Edit / Cancel; everyone gets the help actions).
 */
export function HelpActionsCard() {
  const { task, permissions, onCancelTask, cancelingTask, cancelError } =
    useTaskDetail()

  const onCancel = useCallback(() => {
    const ok =
      typeof window === 'undefined'
        ? true
        : window.confirm('Cancel this task? This cannot be undone.')
    if (ok) void onCancelTask()
  }, [onCancelTask])

  const onPaymentsInfo = useCallback(() => {
    showAppToast({
      title: 'How payments work',
      description:
        'You pay (or get paid) directly. Slashie never handles job payment.',
      type: 'info',
    })
  }, [])

  if (!task) return null

  return (
    <Card layout="section" heading="Help & actions">
      <Stack gap={2} w="full">
        <Wrap gap={1}>
          {permissions.canEditTask ? (
            <ActionButton
              icon={<LuPencil />}
              label="Edit task"
              href={`/tasks/${task.id}/edit`}
            />
          ) : null}
          <ActionButton
            icon={<LuWallet />}
            label="How payments work"
            onClick={onPaymentsInfo}
          />
          <ActionButton
            icon={<LuShieldCheck />}
            label="Report a safety issue"
            href={SAFETY_MAILTO}
          />
          <ActionButton
            icon={<LuCircleHelp />}
            label="Get help"
            href={SUPPORT_MAILTO}
          />
          {permissions.canCancelTask ? (
            <ActionButton
              icon={<LuTrash2 />}
              label="Cancel task"
              danger
              loading={cancelingTask}
              onClick={onCancel}
            />
          ) : null}
        </Wrap>
        {cancelError ? (
          <Text fontSize="sm" color="status.danger.fg" px={1}>
            {cancelError}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}
