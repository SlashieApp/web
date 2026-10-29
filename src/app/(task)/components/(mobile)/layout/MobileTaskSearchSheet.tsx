'use client'

import { Stack, useBreakpointValue } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Drawer, FormStack } from '@ui'

import { TaskList } from '../../(web)/layout/TaskList'
import { useTaskBrowseLayout } from '../../../context/TaskBrowseProvider'
import bag from '../../i11n.json'
import { TaskSearch } from '../../ui/TaskSearch'
import { TaskSearchFilters } from '../../ui/TaskSearchFilters'

/**
 * Mobile task search (FE-201): a full-height gesture sheet with the search
 * field, Date / Budget chips and results nearest first. Closing keeps the
 * filter applied to the carousel and map pins. Tapping a card closes the
 * sheet and opens the task (FE-263).
 */
export function MobileTaskSearchSheet({
  listHeader,
}: {
  listHeader?: ReactNode
}) {
  const t = useI11n(bag)
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()
  // Search dual-mounts this under `display: none` at `lg`, but `@ui` Drawer
  // portals to `document.body`, so CSS hiding does not apply. Only open below
  // `lg`; fallback `lg` avoids a desktop flash before the breakpoint hydrates.
  const showMobileSheet =
    useBreakpointValue({ base: true, lg: false }, { fallback: 'lg' }) ?? false

  if (!showMobileSheet) return null

  return (
    <Drawer
      open={isFilterOpen}
      onOpenChange={setIsFilterOpen}
      title={t.searchSheetTitle}
      placement="bottom"
      size="full"
    >
      <Stack gap={3} flex={1} minH={0}>
        {/* The search and its filters are fields of a form (FE-481): the frame
            puts 24 under the title, and the two are `fieldGap` (20) apart. */}
        <FormStack>
          <TaskSearch mode="input" autoFocus />
          <TaskSearchFilters />
        </FormStack>
        <TaskList
          header={listHeader}
          onOpenTask={() => setIsFilterOpen(false)}
        />
      </Stack>
    </Drawer>
  )
}
