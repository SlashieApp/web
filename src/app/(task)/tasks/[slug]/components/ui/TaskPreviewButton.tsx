'use client'

import { LuEye } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/** Owner main CTA: open the task as a signed-out visitor sees it. */
export function TaskPreviewButton() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)

  if (!task) return null

  return (
    <Button asChild variant="primary" boxShadow="e3">
      <Link
        href={`/tasks/${task.id}/preview`}
        _hover={{ textDecoration: 'none' }}
      >
        <LuEye />
        {t.cta.preview}
      </Link>
    </Button>
  )
}
