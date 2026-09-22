'use client'

import { LuShare2 } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'
import { useShareTask } from './shareTask'

type TaskShareCardProps = {
  compact?: boolean
  rail?: boolean
}

/**
 * Owner share. As the main CTA (mobile pin or web) it is just the primary
 * button; the in-flow variant keeps the card.
 */
export function TaskShareCard({
  compact = false,
  rail = false,
}: TaskShareCardProps) {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  const mainCta = compact || rail
  const shareButton = (
    <Button
      variant="primary"
      w={mainCta ? undefined : 'full'}
      boxShadow={mainCta ? 'e3' : undefined}
      onClick={() => void onShare()}
    >
      <LuShare2 />
      {t.cta.shareTask}
    </Button>
  )

  if (mainCta) return shareButton

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={t.share.pinHeading}
      description={t.share.pinBody}
    >
      {shareButton}
    </Card>
  )
}
