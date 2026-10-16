'use client'

import { HStack, Stack, chakra } from '@chakra-ui/react'
import { useId, useState } from 'react'

import { TaskSearchBase } from '@/app/(task)/components/ui/TaskSearch'
import {
  FilterChip,
  OptionButton,
} from '@/app/(task)/components/ui/TaskSearchFilters'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'

import type { MyTaskRole } from '../../helpers/myTasksHub'
import bag from '../../i11n.json'

type Panel = 'category' | 'role'

const ROLES: readonly MyTaskRole[] = ['hosted', 'quoted']

export type MyTasksSearchProps = {
  /** Typed text, applied after a short pause or on Enter. */
  value: string
  /** Typed text not applied yet, or results loading: inline spinner. */
  pending: boolean
  onValueChange: (value: string) => void
  onCommit: () => void
  onClearSearch: () => void
  category: string
  categories: readonly { category: string; label: string }[]
  onCategoryChange: (category: string) => void
  role: MyTaskRole | ''
  /** Hosted / Quoted only shows when there are both kinds of task. */
  showRole: boolean
  onRoleChange: (role: MyTaskRole | '') => void
  onClearAll: () => void
}

function ChipPanel({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <chakra.fieldset
      id={id}
      m={0}
      minW={0}
      aria-label={label}
      p={3}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
    >
      <HStack gap={2} flexWrap="wrap">
        {children}
      </HStack>
    </chakra.fieldset>
  )
}

/**
 * The search page's search bar and filter chips, for My Tasks: text search
 * (pause or Enter), Category, and Hosted / Quoted. Status isn't a filter;
 * the list is grouped by it.
 */
export function MyTasksSearch({
  value,
  pending,
  onValueChange,
  onCommit,
  onClearSearch,
  category,
  categories,
  onCategoryChange,
  role,
  showRole,
  onRoleChange,
  onClearAll,
}: MyTasksSearchProps) {
  const t = useI11n(bag)
  const f = t.filters
  const [open, setOpen] = useState<Panel | null>(null)
  const baseId = useId()
  const toggle = (panel: Panel) => setOpen(open === panel ? null : panel)
  const categoryLabel = categories.find(
    (option) => option.category === category,
  )?.label

  return (
    <Stack gap={2}>
      <TaskSearchBase
        mode="input"
        value={value}
        pending={pending}
        onValueChange={onValueChange}
        onCommit={onCommit}
        onClear={onClearSearch}
        copy={{ placeholder: f.searchPlaceholder, clearSearch: f.clearSearch }}
      />
      {categories.length > 0 || showRole ? (
        <HStack gap={2} flexWrap="wrap">
          {categories.length > 0 ? (
            <FilterChip
              label={f.categoryChip}
              activeLabel={categoryLabel}
              expanded={open === 'category'}
              panelId={`${baseId}-category`}
              onToggle={() => toggle('category')}
              onClear={() => onCategoryChange('')}
              clearLabel={formatMessage(f.removeFilter, {
                label: f.categoryChip,
              })}
            />
          ) : null}
          {showRole ? (
            <FilterChip
              label={f.roleChip}
              activeLabel={role ? t.tags[role] : undefined}
              expanded={open === 'role'}
              panelId={`${baseId}-role`}
              onToggle={() => toggle('role')}
              onClear={() => onRoleChange('')}
              clearLabel={formatMessage(f.removeFilter, { label: f.roleChip })}
            />
          ) : null}
          {category || role ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              h={8}
              px={2}
              borderRadius="full"
              fontSize="xs"
              fontWeight={700}
              color="text.muted"
              onClick={() => {
                setOpen(null)
                onClearAll()
              }}
            >
              {f.clearAll}
            </Button>
          ) : null}
        </HStack>
      ) : null}
      {open === 'category' ? (
        <ChipPanel id={`${baseId}-category`} label={f.categoryChip}>
          {categories.map((option) => (
            <OptionButton
              key={option.category}
              pressed={category === option.category}
              onPress={() =>
                onCategoryChange(
                  category === option.category ? '' : option.category,
                )
              }
            >
              {option.label}
            </OptionButton>
          ))}
        </ChipPanel>
      ) : null}
      {open === 'role' ? (
        <ChipPanel id={`${baseId}-role`} label={f.roleChip}>
          {ROLES.map((option) => (
            <OptionButton
              key={option}
              pressed={role === option}
              onPress={() => onRoleChange(role === option ? '' : option)}
            >
              {t.tags[option]}
            </OptionButton>
          ))}
        </ChipPanel>
      ) : null}
    </Stack>
  )
}
