'use client'

import { Box } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'

import bag from '../../i11n.json'
import { TaskOverflowActions } from '../layout/TaskOverflowMenu'

/** Desktop Help & actions card. Mobile uses the tab icon-button overflow. */
export function TaskHelpCard() {
  const t = useI11n(bag)

  return (
    <Box display={{ base: 'none', lg: 'block' }}>
      <Card layout="section" heading={t.actions.helpHeading}>
        <TaskOverflowActions />
      </Card>
    </Box>
  )
}
