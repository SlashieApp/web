'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Stack } from '@chakra-ui/react'
import { LuEye, LuPoundSterling, LuTag } from 'react-icons/lu'
import bag from '../../../i11n.json'

import { formatMessage } from '@/i18n/loadPageI11n'
import { Badge, Card, DetailRow } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  budgetKindLabel,
  taskBudgetDisplayLine,
  taskCategoryLabel,
} from '../../../helpers/taskDetailUtils'

/**
 * Details meta card — views, category, and budget. Photos and booking live
 * beside this in `TaskDetailsSections`.
 */
export function TaskDetailsCard() {
  const { task, me, permissions } = useTaskDetail()
  const t = useI11n(bag)
  if (!task) return null

  const category = taskCategoryLabel(task)
  const budgetLine = taskBudgetDisplayLine(
    task,
    permissions.isOwner ? 'owner' : 'visitor',
    me?.id,
  )
  const budgetKind = budgetKindLabel(task.budget?.type)
  const viewsCount = task.views
  const viewsLabel =
    viewsCount == null
      ? t.details.viewsColdStart
      : formatMessage(
          viewsCount === 1 ? t.details.viewsOne : t.details.viewsMany,
          { count: viewsCount },
        )
  const hasBudget = Boolean(task.budget)

  return (
    <Card layout="section" heading={t.details.heading}>
      <Stack gap={0}>
        {viewsLabel ? (
          <DetailRow
            icon={<LuEye />}
            label={t.details.views}
            withDivider={Boolean(category || hasBudget)}
          >
            {viewsLabel}
          </DetailRow>
        ) : null}
        {category ? (
          <DetailRow
            icon={<LuTag />}
            label={t.details.category}
            withDivider={hasBudget}
          >
            {category}
          </DetailRow>
        ) : null}
        <DetailRow icon={<LuPoundSterling />} label={t.details.budget}>
          <HStack as="span" gap={2} align="center">
            <span>{budgetLine}</span>
            {budgetKind ? <Badge variant="success">{budgetKind}</Badge> : null}
          </HStack>
        </DetailRow>
      </Stack>
    </Card>
  )
}
