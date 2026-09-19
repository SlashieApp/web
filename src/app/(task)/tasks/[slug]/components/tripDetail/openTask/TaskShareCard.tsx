'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { LuPencil, LuShare2 } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card, IconButton, Link } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import bag from '../../../i11n.json'
import { useShareTask } from './shareTask'

/** Owner mobile pin — share this task (quotes stay on the Quotes tab). */
export function TaskShareCard() {
  const { task, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  return (
    <Card layout="section" heading={t.share.pinHeading}>
      <Stack gap={3}>
        <Text fontSize="sm" color="text.muted" lineHeight="short">
          {t.share.pinBody}
        </Text>
        <HStack gap={2} align="center">
          <Button variant="primary" flex="1" onClick={() => void onShare()}>
            <LuShare2 />
            {t.cta.shareTask}
          </Button>
          {permissions.canEditTask ? (
            <IconButton asChild variant="ghost" aria-label={t.cta.editAria}>
              <Link
                href={`/tasks/${task.id}/edit`}
                _hover={{ textDecoration: 'none' }}
              >
                <LuPencil />
              </Link>
            </IconButton>
          ) : null}
        </HStack>
      </Stack>
    </Card>
  )
}
