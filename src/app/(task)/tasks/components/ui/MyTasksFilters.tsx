'use client'

import {
  Box,
  HStack,
  Stack,
  chakra,
  useBreakpointValue,
} from '@chakra-ui/react'
import { type ReactNode, useRef, useState } from 'react'
import { LuSlidersHorizontal } from 'react-icons/lu'

import { TaskSearchBase } from '@/app/(task)/components/ui/TaskSearch'
import { OptionButton } from '@/app/(task)/components/ui/TaskSearchFilters'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Drawer, IconButton } from '@ui'

import type { MyTaskRole } from '../../helpers/myTasksHub'
import {
  EMPTY_MY_TASKS_QUERY,
  type MyTasksQuery,
  activeFilterCount,
} from '../../helpers/myTasksHubFilters'
import bag from '../../i11n.json'

export type MyTasksFiltersProps = {
  /** The filters in use (from the URL). */
  query: MyTasksQuery
  categories: readonly { category: string; label: string }[]
  /** Show (posted or quoted) only for someone with both kinds of task. */
  showRole: boolean
  onApply: (query: MyTasksQuery) => void
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <chakra.fieldset m={0} p={0} borderWidth={0} minW={0}>
      <chakra.legend
        p={0}
        mb={2}
        fontSize="sm"
        fontWeight={700}
        color="text.default"
      >
        {label}
      </chakra.legend>
      {children}
    </chakra.fieldset>
  )
}

/**
 * The filter icon next to the My Tasks title, with a count when filters are
 * on. It opens a drawer (a bottom sheet on phones and tablets, a side panel
 * on desktop): Search, Show (posted or quoted), Category, then Clear and
 * Apply. Changes wait for Apply (or Enter in the search); Clear turns every
 * filter off.
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
  const placement =
    useBreakpointValue({ base: 'bottom', lg: 'end' } as const, {
      fallback: 'base',
    }) ?? 'bottom'
  const count = activeFilterCount(query)
  const roles: readonly [MyTaskRole | '', string][] = [
    ['', f.roleAll],
    ['hosted', f.roleHosted],
    ['quoted', f.roleQuoted],
  ]
  const finish = (next: MyTasksQuery) => {
    onApply(next)
    setOpen(false)
  }
  const apply = () => finish({ ...draft, q: draft.q.trim() })

  return (
    <>
      <Box position="relative" flexShrink={0}>
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
            fontWeight={700}
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
        placement={placement}
        finalFocusEl={() => buttonRef.current}
      >
        <Stack gap={6} flex={1}>
          <Group label={f.searchLabel}>
            <TaskSearchBase
              mode="input"
              value={draft.q}
              onValueChange={(q) => setDraft({ ...draft, q })}
              onCommit={apply}
              onClear={() => setDraft({ ...draft, q: '' })}
              copy={{
                placeholder: f.searchPlaceholder,
                clearSearch: f.clearSearch,
              }}
            />
          </Group>
          {showRole ? (
            <Group label={f.roleLabel}>
              <HStack gap={2} flexWrap="wrap">
                {roles.map(([role, label]) => (
                  <OptionButton
                    key={label}
                    pressed={draft.role === role}
                    onPress={() => setDraft({ ...draft, role })}
                  >
                    {label}
                  </OptionButton>
                ))}
              </HStack>
            </Group>
          ) : null}
          {categories.length > 0 ? (
            <Group label={f.categoryLabel}>
              <HStack gap={2} flexWrap="wrap">
                {[{ category: '', label: f.categoryAll }, ...categories].map(
                  (option) => (
                    <OptionButton
                      key={option.category || 'all'}
                      pressed={draft.category === option.category}
                      onPress={() =>
                        setDraft({ ...draft, category: option.category })
                      }
                    >
                      {option.label}
                    </OptionButton>
                  ),
                )}
              </HStack>
            </Group>
          ) : null}
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
