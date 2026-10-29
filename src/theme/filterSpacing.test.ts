import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The filter panels on the form spacing (wiki: Foundations-Form-Spacing, FE-481
 * filter-panels): the Workers and My tasks filter drawers, the search sheet and
 * the Date and Budget panels. The gaps are measured in each surface's stories;
 * these pin that the numbers come from the form pieces and tokens, so a filter
 * panel does not go back to typing its own steps.
 */
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

const TASK = 'src/app/(task)'
const WORKERS = 'src/app/(worker)/workers/components'

const SURFACES = {
  WorkersFiltersDrawer: read(`${WORKERS}/layout/WorkersFiltersDrawer.tsx`),
  WorkersSearchFields: read(`${WORKERS}/ui/WorkersSearchFields.tsx`),
  MyTasksFilters: read(`${TASK}/tasks/components/ui/MyTasksFilters.tsx`),
  MyTasksFilterFields: read(
    `${TASK}/tasks/components/ui/MyTasksFilterFields.tsx`,
  ),
  MyTasksFiltersRail: read(
    `${TASK}/tasks/components/ui/MyTasksFiltersRail.tsx`,
  ),
  TaskSearchFilters: read(`${TASK}/components/ui/TaskSearchFilters.tsx`),
  MobileTaskSearchSheet: read(
    `${TASK}/components/(mobile)/layout/MobileTaskSearchSheet.tsx`,
  ),
} as const

describe('filter panels: one rhythm from the form pieces', () => {
  it.each(Object.entries(SURFACES))(
    '%s types no stack or grid gap of its own for a form gap',
    (_name, source) => {
      // The step numbers the old filters used between blocks (12 is gap 3,
      // 24 is gap 6, 20 is gap 5) and the old two-column grid. Gap 2 (8) and
      // 3 (12) stay the toolbar's own rhythm in the search column and the
      // sheet, which are not form gaps, so only the form steps are pinned.
      expect(source).not.toMatch(/<(?:Stack|HStack)\s+gap=\{(?:5|6)\}/)
      expect(source).not.toContain('SimpleGrid')
    },
  )

  it.each(Object.entries(SURFACES))(
    '%s uses no font weight above 600',
    (_name, source) => {
      for (const [, weight] of source.matchAll(/fontWeight=\{(\d+)\}/g)) {
        expect(Number(weight)).toBeLessThanOrEqual(600)
      }
    },
  )

  it('the Workers drawer lays its filters out in a FormStack, label 8 above each control', () => {
    const drawer = SURFACES.WorkersFiltersDrawer
    expect(drawer).toContain('<FormStack>')
    expect(drawer).toContain('gap="form.labelToControl"')
    // The frame ends the body 20 above Apply: no padding of its own.
    expect(drawer).not.toMatch(/pb=\{2\}/)
    expect(SURFACES.WorkersSearchFields).toContain('gap="form.labelToControl"')
  })

  it('the Skills search is a field (48) in the drawer and the bar keeps 44', () => {
    expect(SURFACES.WorkersSearchFields).toContain(
      "rootProps={asField ? { minH: 'form.controlHeight' } : undefined}",
    )
    expect(SURFACES.WorkersFiltersDrawer).toContain(
      '<WorkersSkillsInput asField />',
    )
  })

  it('My tasks: the groups are a FormStack and the legend is the form label', () => {
    const fields = SURFACES.MyTasksFilterFields
    expect(fields).toContain('<FormStack>')
    expect(fields).toContain('{...formControlLabelProps}')
    expect(fields).toContain('asField')
    expect(fields).toContain('gap="form.alternativesGap"')
    expect(fields).not.toMatch(/mb=\{2\}/)
  })

  it('My tasks drawer: Clear and Apply are the frame bar, not a bar of its own', () => {
    const drawer = SURFACES.MyTasksFilters
    expect(drawer).toContain('primaryActionLabel={f.apply}')
    expect(drawer).toContain('secondaryActionLabel={f.clear}')
    // The hand-built bar had a top line and sat in the scrolling body.
    expect(drawer).not.toContain('borderTopWidth')
    expect(drawer).not.toContain('mt="auto"')
  })

  it('My tasks rail: the first filter is 24 under the heading', () => {
    const rail = SURFACES.MyTasksFiltersRail
    expect(rail).toContain('gap="form.headerToBody"')
    expect(rail).toContain('lineHeight="28px"')
    expect(rail).not.toContain('minH="36px"')
  })

  it('Date and Budget: panels are FormStack and FormRow, the pair error is 4 under the row', () => {
    const filters = SURFACES.TaskSearchFilters
    expect(filters).toContain('<FormStack>')
    expect(filters.match(/<FormRow>/g)).toHaveLength(2)
    expect(filters).toContain('gap="form.controlToHelper"')
    expect(filters).toContain('gap="form.alternativesGap"')
  })

  it('the search sheet puts the search and its filters in a FormStack', () => {
    expect(SURFACES.MobileTaskSearchSheet).toContain('<FormStack>')
  })
})
