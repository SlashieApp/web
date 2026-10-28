'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { LuSlidersHorizontal } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure } from '@/theme/styles'
import { Button, Drawer, IconButton } from '@ui'

import {
  EMPTY_MY_TASKS_QUERY,
  type MyTasksQuery,
  activeFilterCount,
} from '../../helpers/myTasksHubFilters'
import bag from '../../i11n.json'
import { MyTasksFilterFields } from './MyTasksFilterFields'

export type MyTasksFiltersProps = {
  /** The filters in use (from the URL). */
  query: MyTasksQuery
  categories: readonly { category: string; label: string }[]
  /** Show (posted or quoted) only for someone with both kinds of task. */
  showRole: boolean
  onApply: (query: MyTasksQuery) => void
}

/**
 * Phones and tablets (below `lg`): the filter icon next to the My Tasks
 * title, with a count when filters are on. It opens a bottom sheet with
 * Search, Show (posted or quoted) and Category, then Clear and Apply. Changes
 * wait for Apply (or Enter in the search); Clear turns every filter off. From
 * `lg` up the icon is hidden: `MyTasksFiltersRail` shows the same fields,
 * always open.
 */
export function MyTasksFilters({
  query,
  categories,
  showRole,
  onApply,
}: MyTasksFiltersProps) {
  const f = useI11n(bag).filters
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(query)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const count = activeFilterCount(query)
  const finish = (next: MyTasksQuery) => {
    onApply(next)
    setOpen(false)
  }
  const apply = () => finish({ ...draft, q: draft.q.trim() })

  return (
    <>
      <Box
        position="relative"
        flexShrink={0}
        display={{ base: 'block', lg: 'none' }}
      >
        <IconButton
          ref={buttonRef}
          type="button"
          aria-label={
            count === 0
              ? f.button
              : count === 1
                ? f.buttonActiveOne
                : formatMessage(f.buttonActive, { count })
          }
          aria-haspopup="dialog"
          bg={count ? 'status.success.soft' : undefined}
          color={count ? 'status.success.fg' : 'text.muted'}
          onClick={() => {
            setDraft(query)
            setOpen(true)
          }}
        >
          <LuSlidersHorizontal size={20} />
        </IconButton>
        {count ? (
          <Box
            aria-hidden
            position="absolute"
            top={0.5}
            right={0.5}
            minW="18px"
            h="18px"
            px={1}
            borderRadius="full"
            bg="action.primary"
            color="text.onGreen"
            fontSize="xs"
            {...sdlFigure}
            lineHeight="18px"
            textAlign="center"
            pointerEvents="none"
          >
            {count}
          </Box>
        ) : null}
      </Box>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={f.title}
        placement="bottom"
        finalFocusEl={() => buttonRef.current}
      >
        <Stack gap={6} flex={1}>
          <MyTasksFilterFields
            query={draft}
            categories={categories}
            showRole={showRole}
            onSearchChange={(q) => setDraft({ ...draft, q })}
            onSearchCommit={apply}
            onSearchClear={() => setDraft({ ...draft, q: '' })}
            onRoleChange={(role) => setDraft({ ...draft, role })}
            onCategoryChange={(category) => setDraft({ ...draft, category })}
          />
          <HStack
            gap={3}
            mt="auto"
            pt={4}
            pb="env(safe-area-inset-bottom, 0px)"
            borderTopWidth="1px"
            borderColor="border.default"
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => finish(EMPTY_MY_TASKS_QUERY)}
            >
              {f.clear}
            </Button>
            <Button type="button" flex={1} onClick={apply}>
              {f.apply}
            </Button>
          </HStack>
        </Stack>
      </Drawer>
    </>
  )
}
