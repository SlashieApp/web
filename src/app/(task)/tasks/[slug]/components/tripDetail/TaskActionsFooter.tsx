'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import { LuCircleHelp, LuPencil, LuShieldCheck, LuTrash2 } from 'react-icons/lu'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { useI11n } from '@/i18n/useI11n'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { Button, Card, Link, ReportControl, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/** Help/actions footer: edit/cancel, safety page, report, support. */
export function TaskActionsFooter() {
  const t = useI11n(bag)
  const { task, permissions, onCancelTask, cancelingTask, cancelError } =
    useTaskDetail()

  const onCancel = useCallback(() => {
    if (!task) return
    const ok =
      typeof window === 'undefined'
        ? true
        : window.confirm(t.actions.cancelConfirm)
    if (ok) void onCancelTask()
  }, [task, onCancelTask, t.actions.cancelConfirm])

  if (!task) return null

  return (
    <Card layout="default" p={{ base: 3, md: 4 }}>
      <Stack gap={2} w="full">
        <Text fontSize="xs" fontWeight={700} color="text.muted" px={1}>
          {t.actions.helpHeading}
        </Text>

        {permissions.canEditTask ? (
          <Link
            href={`/tasks/${task.id}/edit`}
            _hover={{ textDecoration: 'none' }}
          >
            <Button variant="ghost" w="full" justifyContent="flex-start">
              <LuPencil />
              {t.actions.editTask}
            </Button>
          </Link>
        ) : null}

        <Link href={SAFETY_HREF} _hover={{ textDecoration: 'none' }}>
          <Button variant="ghost" w="full" justifyContent="flex-start">
            <LuShieldCheck />
            {t.actions.payingMeetingSafely}
          </Button>
        </Link>

        <Link
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          _hover={{ textDecoration: 'none' }}
        >
          <Button variant="ghost" w="full" justifyContent="flex-start">
            <LuCircleHelp />
            {t.actions.getHelp}
          </Button>
        </Link>

        <ReportControl
          kind="task"
          targetId={task.id}
          targetTitle={task.title?.trim() || undefined}
          variant="menu"
        />

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
              {t.actions.cancelTask}
            </Button>
            {cancelError ? (
              <Text fontSize="sm" color="status.danger.fg" px={1}>
                {cancelError}
              </Text>
            ) : null}
          </>
        ) : null}

        <SafetyNotice variant="inline" />
      </Stack>
    </Card>
  )
}
