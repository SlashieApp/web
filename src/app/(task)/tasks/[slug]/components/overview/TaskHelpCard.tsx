'use client'

import { Box } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'
import { TaskOverflowActions } from '../layout/TaskOverflowMenu'

/** Desktop Help & actions card. Compact uses the sticky title overflow. */
export function TaskHelpCard() {
  const t = useI11n(bag)

  return (
    <Box display={{ base: 'none', lg: 'block' }}>
      <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={t.actions.helpHeading}>
        <TaskOverflowActions />
      </Card>
    </Box>
  )
}
