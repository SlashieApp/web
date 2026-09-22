'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'

export type TaskDetailMainCtaCardProps = {
  eyebrow: string
  /** Text block under the eyebrow (budget, description, owner). */
  children?: ReactNode
  /** Primary action on the right. */
  action?: ReactNode
  busy?: boolean
}

/**
 * Web main CTA: same padding as the tab cards, text on the left and the
 * primary action on the right.
 */
export function TaskDetailMainCtaCard({
  eyebrow,
  children,
  action,
  busy = false,
}: TaskDetailMainCtaCardProps) {
  return (
    <Card {...TASK_DETAIL_SECTION_CARD} aria-busy={busy || undefined}>
      <HStack gap={4} align="center" justify="space-between" w="full" minW={0}>
        <Stack gap={1} flex="1 1 auto" minW={0}>
          <Text
            fontSize="xs"
            fontWeight={500}
            color="text.muted"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            {eyebrow}
          </Text>
          {children}
        </Stack>
        {action ? <Box flexShrink={0}>{action}</Box> : null}
      </HStack>
    </Card>
  )
}
