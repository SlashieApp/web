'use client'

import { HStack, Heading, Stack } from '@chakra-ui/react'
import { useCallback, useId, useRef, useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'

import {
  EMPTY_MY_TASKS_QUERY,
  type MyTasksQuery,
  activeFilterCount,
  sameMyTasksQuery,
} from '../../helpers/myTasksHubFilters'
import {
  SEARCH_DEBOUNCE_MS,
  createDebouncer,
} from '../../helpers/searchDebounce'
import bag from '../../i11n.json'
import { MyTasksFilterFields } from './MyTasksFilterFields'

/** The rail's width. The page leaves this much room beside the list. */
export const MY_TASKS_RAIL_W = '19rem'

export type MyTasksFiltersRailProps = {
  /** The filters in use (from the URL). */
  query: MyTasksQuery
  categories: readonly { category: string; label: string }[]
  /** Show (posted or quoted) only for someone with both kinds of task. */
  showRole: boolean
  /** Called only when the filters change. Typing waits for a pause. */
  onChange: (query: MyTasksQuery) => void
}

/**
 * Desktop (`lg` and up): the My Tasks filters as an always-open rail left of
 * the list, with the same Search, Show and Category as the phone drawer. A
 * change applies straight away: chips at once, the search once typing stops
 * (300 ms) or on Enter. Clear filters shows only while a filter is on. Below
 * `lg` the rail is hidden and `MyTasksFilters` (icon and drawer) takes over.
 */
export function MyTasksFiltersRail({
  query,
  categories,
  showRole,
  onChange,
}: MyTasksFiltersRailProps) {
  const t = useI11n(bag)
  const f = t.filters
  const headingId = useId()
  const [text, setText] = useState(query.q)
  const [seenQ, setSeenQ] = useState(query.q)
  const [debouncer] = useState(() => createDebouncer(SEARCH_DEBOUNCE_MS))
  const rootRef = useRef<HTMLElement | null>(null)
  // The typing timer fires later. It reads the filters as they are then, so a
  // chip pressed in between is not undone.
  const latest = useRef({ query, onChange })
  latest.current = { query, onChange }

  // The search was changed elsewhere (Clear filters under the list, the phone
  // drawer): show it. Our own apply comes back trimmed, so keep the text as typed.
  if (query.q !== seenQ) {
    setSeenQ(query.q)
    if (query.q !== text.trim()) setText(query.q)
  }

  /** Keeps the rail as the focus target, and stops a waiting search when it goes. */
  const onRootRef = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node
      return () => {
        rootRef.current = null
        debouncer.cancel()
      }
    },
    [debouncer],
  )

  const commit = (next: MyTasksQuery) => {
    debouncer.cancel()
    if (!sameMyTasksQuery(next, query)) onChange(next)
  }

  /** Applies the typed search along with `patch`, now. */
  const apply = (patch: Partial<MyTasksQuery> = {}) =>
    commit({ ...query, q: text.trim(), ...patch })

  const typeSearch = (value: string) => {
    setText(value)
    debouncer.schedule(() => {
      const { query: current, onChange: change } = latest.current
      const q = value.trim()
      if (q !== current.q) change({ ...current, q })
    })
  }

  const clearSearch = () => {
    setText('')
    apply({ q: '' })
  }

  const clearAll = () => {
    setText('')
    // The button leaves with the filters, so the keyboard stays in the rail.
    rootRef.current?.focus()
    commit(EMPTY_MY_TASKS_QUERY)
  }

  const filtered = activeFilterCount({ ...query, q: text }) > 0

  return (
    <Stack
      as="aside"
      ref={onRootRef}
      aria-labelledby={headingId}
      tabIndex={-1}
      gap={6}
      w={MY_TASKS_RAIL_W}
      flexShrink={0}
      display={{ base: 'none', lg: 'flex' }}
      outline="none"
    >
      <HStack justify="space-between" align="center" gap={2} minH="36px">
        <Heading
          as="h2"
          id={headingId}
          fontSize="lg"
          fontWeight={700}
          color="text.default"
          letterSpacing="-0.01em"
        >
          {f.title}
        </Heading>
        {filtered ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            h="36px"
            onClick={clearAll}
          >
            {t.views.actions.clearFilters}
          </Button>
        ) : null}
      </HStack>
      <MyTasksFilterFields
        query={{ ...query, q: text }}
        categories={categories}
        showRole={showRole}
        onSearchChange={typeSearch}
        onSearchCommit={() => apply()}
        onSearchClear={clearSearch}
        onRoleChange={(role) => apply({ role })}
        onCategoryChange={(category) => apply({ category })}
      />
    </Stack>
  )
}
