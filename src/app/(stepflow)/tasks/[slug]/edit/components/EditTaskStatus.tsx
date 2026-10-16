'use client'

import { StatusScreen } from '@/app/StatusScreen'
import { useI11n } from '@/i18n/useI11n'
import { repostTaskHref } from '@/utils/taskHandoff'
import { Button, Link } from '@ui'

import bag from '../i11n.json'
import type { EditTaskViewConfig } from '../views'

type StatusConfig = Extract<EditTaskViewConfig, { layout: 'status' }>

/** Why the task can't be edited, and where to go instead (first action leads). */
export function EditTaskStatus({
  config,
  taskId,
  onRetry,
}: {
  config: StatusConfig
  taskId: string
  onRetry: () => void
}) {
  const t = useI11n(bag)

  return (
    <StatusScreen
      title={t.status[config.title]}
      body={t.status[config.body]}
      actions={config.actions.map((action, index) => {
        const variant = index === 0 ? 'primary' : 'ghost'
        if (action === 'retry') {
          return (
            <Button key={action} variant={variant} onClick={onRetry}>
              {t.actions.retry}
            </Button>
          )
        }
        const href =
          action === 'viewTask'
            ? `/tasks/${taskId}`
            : action === 'repost'
              ? repostTaskHref(taskId)
              : '/tasks'
        return (
          <Button key={action} asChild variant={variant}>
            <Link href={href} _hover={{ textDecoration: 'none' }}>
              {t.actions[action]}
            </Link>
          </Button>
        )
      })}
    />
  )
}
