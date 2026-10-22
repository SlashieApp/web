'use client'

import { HStack, chakra } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { TaskSearchBase } from '@/app/(task)/components/ui/TaskSearch'
import { OptionButton } from '@/app/(task)/components/ui/TaskSearchFilters'
import { useI11n } from '@/i18n/useI11n'

import type { MyTaskRole } from '../../helpers/myTasksHub'
import type { MyTasksQuery } from '../../helpers/myTasksHubFilters'
import bag from '../../i11n.json'

export type MyTasksFilterFieldsProps = {
  /** What the controls show: the filters in use, or the drawer's draft. */
  query: MyTasksQuery
  categories: readonly { category: string; label: string }[]
  /** Show (posted or quoted) only for someone with both kinds of task. */
  showRole: boolean
  onSearchChange: (q: string) => void
  /** Enter in the search. */
  onSearchCommit: () => void
  /** The X in the search field. */
  onSearchClear: () => void
  onRoleChange: (role: MyTaskRole | '') => void
  onCategoryChange: (category: string) => void
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
 * The three filter groups of My tasks: Search, Show (posted or quoted) and
 * Category. The phone drawer and the desktop rail both render them, so the
 * controls and their copy are the same; each decides when a change applies.
 * The groups sit in the caller's stack, which sets the spacing.
 */
export function MyTasksFilterFields({
  query,
  categories,
  showRole,
  onSearchChange,
  onSearchCommit,
  onSearchClear,
  onRoleChange,
  onCategoryChange,
}: MyTasksFilterFieldsProps) {
  const f = useI11n(bag).filters
  const roles: readonly [MyTaskRole | '', string][] = [
    ['', f.roleAll],
    ['hosted', f.roleHosted],
    ['quoted', f.roleQuoted],
  ]

  return (
    <>
      <Group label={f.searchLabel}>
        <TaskSearchBase
          mode="input"
          value={query.q}
          onValueChange={onSearchChange}
          onCommit={onSearchCommit}
          onClear={onSearchClear}
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
                pressed={query.role === role}
                onPress={() => onRoleChange(role)}
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
                  pressed={query.category === option.category}
                  onPress={() => onCategoryChange(option.category)}
                >
                  {option.label}
                </OptionButton>
              ),
            )}
          </HStack>
        </Group>
      ) : null}
    </>
  )
}
