'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import {
  LuCircleHelp,
  LuFlag,
  LuPencil,
  LuShieldCheck,
  LuTrash2,
  LuWallet,
} from 'react-icons/lu'

import { showAppToast } from '@/utils/appToast'
import { Button, Card, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

const SUPPORT_MAILTO = 'mailto:support@slashie.app'
const SAFETY_MAILTO = 'mailto:safety@slashie.app'

/** Uber-style stacked help/actions footer. */
export function TaskActionsFooter() {
  const { task, permissions, onCancelTask, cancelingTask, cancelError } =
    useTaskDetail()

  const onCancel = useCallback(() => {
    if (!task) return
    const ok =
      typeof window === 'undefined'
        ? true
        : window.confirm('Cancel this task? This cannot be undone.')
    if (ok) void onCancelTask()
  }, [task, onCancelTask])

  const onPaymentsInfo = useCallback(() => {
    showAppToast({
      title: 'How payments work',
      description:
        'You pay your worker directly (cash, bank transfer, or card). Slashie never handles job payment.',
      type: 'info',
    })
  }, [])

  if (!task) return null

  return (
    <Card layout="default" p={{ base: 3, md: 4 }}>
      <Stack gap={2} w="full">
        <Text fontSize="xs" fontWeight={700} color="text.muted" px={1}>
          Help &amp; actions
        </Text>

        {permissions.canEditTask ? (
          <Link
            href={`/tasks/${task.id}/edit`}
            _hover={{ textDecoration: 'none' }}
          >
            <Button variant="ghost" w="full" justifyContent="flex-start">
              <LuPencil />
              Edit task
            </Button>
          </Link>
        ) : null}

        <Button
          variant="ghost"
          w="full"
          justifyContent="flex-start"
          onClick={onPaymentsInfo}
        >
          <LuWallet />
          How payments work
        </Button>

        <Link href={SAFETY_MAILTO} _hover={{ textDecoration: 'none' }}>
          <Button variant="ghost" w="full" justifyContent="flex-start">
            <LuShieldCheck />
            Report a safety issue
          </Button>
        </Link>

        <Link href={SUPPORT_MAILTO} _hover={{ textDecoration: 'none' }}>
          <Button variant="ghost" w="full" justifyContent="flex-start">
            <LuCircleHelp />
            Get help
          </Button>
        </Link>

        {permissions.canCancelTask ? (
          <>
            <Button
              variant="ghost"
              w="full"
              justifyContent="flex-start"
              color="status.danger.fg"
              loading={cancelingTask}
              onClick={onCancel}
            >
              <LuTrash2 />
              Cancel task
            </Button>
            {cancelError ? (
              <Text fontSize="sm" color="status.danger.fg" px={1}>
                {cancelError}
              </Text>
            ) : null}
          </>
        ) : null}

        <Text fontSize="xs" color="text.subtle" px={1} pt={1}>
          <LuFlag
            style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }}
          />
          Slashie is a marketplace; payment and work are arranged directly
          between you and the other party.
        </Text>
      </Stack>
    </Card>
  )
}
