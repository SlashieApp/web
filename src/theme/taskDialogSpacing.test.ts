import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The task dialogs on the form spacing (wiki: Foundations-Form-Spacing, FE-481
 * task-dialogs). The gaps are measured in each dialog's stories; these pin that
 * the numbers come from the form pieces and tokens, so a dialog does not go
 * back to typing its own steps.
 */
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

const OVERVIEW = 'src/app/(task)/tasks/[slug]/components/overview'
const QUOTES = 'src/app/(task)/tasks/[slug]/components/quotes'

const FORMS = {
  ReportDialog: read('src/ui/ReportDialog/ReportDialog.tsx'),
  FeedbackDialog: read('src/ui/FeedbackDialog/FeedbackDialog.tsx'),
  ReviewForm: read('src/ui/ReviewForm/ReviewForm.tsx'),
  SafetyConfirmDialog: read('src/ui/SafetyNotice/SafetyConfirmDialog.tsx'),
  TimeSlotPicker: read('src/ui/TimeSlotPicker/TimeSlotPicker.tsx'),
  OrderFailedDialog: read(`${OVERVIEW}/OrderFailedDialog.tsx`),
} as const

const ALL = {
  ...FORMS,
  StarRatingInput: read('src/ui/FeedbackDialog/StarRatingInput.tsx'),
  TaskReviewStep: read(
    'src/app/(stepflow)/tasks/[slug]/review/components/ui/TaskReviewStep.tsx',
  ),
  OrderRequestDialogs: read(`${OVERVIEW}/OrderRequestDialogs.tsx`),
  OrderCloseControls: read(`${OVERVIEW}/OrderCloseControls.tsx`),
  TaskConfirmDialogs: read(`${OVERVIEW}/TaskConfirmDialogs.tsx`),
  ReopenTaskDialog: read(`${OVERVIEW}/ReopenTaskDialog.tsx`),
  useAcceptQuoteSafety: read(`${QUOTES}/useAcceptQuoteSafety.tsx`),
} as const

describe('task dialogs: one rhythm from the form pieces', () => {
  it.each(Object.entries(FORMS))(
    '%s lays its body out in a FormStack',
    (_name, source) => {
      expect(source).toContain('<FormStack')
    },
  )

  it.each(Object.entries(ALL))(
    '%s types no stack gap of its own for a form gap',
    (_name, source) => {
      // The step numbers the old bodies used between blocks (12 is gap 3, 16 is
      // gap 4, 20 is gap 5, 24 is gap 6) and the half-step list margin. Gap 2
      // (8) is the rhythm of stacked tap boxes and a day strip, and 0 is none.
      expect(source).not.toMatch(/<Stack\s+gap=\{(?:1\.5|3|4|5|6)\}/)
    },
  )

  it.each(Object.entries(ALL))(
    '%s uses no font weight above 600',
    (_name, source) => {
      for (const [, weight] of source.matchAll(/fontWeight=\{(\d+)\}/g)) {
        expect(Number(weight)).toBeLessThanOrEqual(600)
      }
    },
  )

  it.each(['ReportDialog', 'FeedbackDialog'] as const)(
    '%s puts its intro in the Modal description slot',
    (name) => {
      expect(ALL[name]).toContain('description={t.description}')
    },
  )

  it('the reschedule dialog puts its sentence in the description slot', () => {
    expect(ALL.OrderRequestDialogs).toContain('description={formatMessage(')
  })

  it.each(['TaskConfirmDialogs', 'ReopenTaskDialog'] as const)(
    '%s keeps its one sentence as the body (nothing follows it, so it is not a description)',
    (name) => {
      expect(ALL[name]).not.toContain('description=')
    },
  )
})

describe('choice groups and helpers: label 8, rows 8, helper 4', () => {
  it('the star tiles are 32 with the 44 tap target grown into the gaps (a rating is not a text field)', () => {
    expect(ALL.StarRatingInput).toContain('export const STAR_TILE = 32')
    expect(ALL.StarRatingInput).toContain(
      'hitAreaGrowth(STAR_TILE, formSpace.labelToControl)',
    )
    expect(ALL.StarRatingInput).toContain('minHitArea')
    expect(ALL.StarRatingInput).not.toContain('form.controlHeight')
    expect(ALL.StarRatingInput).not.toContain('minH="44px"')
  })

  it('a failed send, report or accept is announced (role alert), as ReviewForm already did', () => {
    for (const name of [
      'ReportDialog',
      'FeedbackDialog',
      'ReviewForm',
    ] as const) {
      expect(ALL[name], name).toContain('role="alert"')
    }
    expect(ALL.useAcceptQuoteSafety).toContain('role="alert"')
  })

  it('the stars are a named radio group in all three forms', () => {
    expect(ALL.StarRatingInput).toContain('role="radiogroup"')
    for (const name of [
      'FeedbackDialog',
      'ReviewForm',
      'TaskReviewStep',
    ] as const) {
      expect(ALL[name], name).toMatch(/<StarRatingInput[^>]*\s+aria-label=/)
    }
  })

  it.each(['OrderFailedDialog', 'useAcceptQuoteSafety'] as const)(
    '%s puts its note under the rows as a compact helper, 4 under them',
    (name) => {
      expect(ALL[name]).toContain('formControlHelperTextProps')
      expect(ALL[name]).toContain('form.controlToHelper')
    },
  )

  it('the accept dialog labels its group with the shared label treatment', () => {
    expect(ALL.useAcceptQuoteSafety).toContain('formControlLabelProps')
  })

  it('the Done dialog puts "what Done means" 4 under the slide', () => {
    expect(ALL.OrderCloseControls).toContain(
      '<Stack gap="form.controlToHelper">',
    )
  })
})

describe('the time slot picker', () => {
  const picker = ALL.TimeSlotPicker

  it('labels its fields with FormField, not a wrapping label with margins', () => {
    expect(picker).toContain('<FormField label={copy.startTime}>')
    expect(picker).toContain('<FormField label={copy.duration}>')
    expect(picker).not.toContain('as="label"')
    expect(picker).not.toMatch(/\bmt=\{1\}|\bmb=\{1\}|rootProps=\{\{ mt/)
  })

  it('puts the heading 12 above the first field, and the pair 12 apart (20 when stacked)', () => {
    expect(picker).toContain('mb="form.sectionTitleToField"')
    expect(picker).toContain('columnGap="form.inlineGap"')
    expect(picker).toContain('rowGap="form.fieldGap"')
  })

  it('puts a slot error 4 under the fields', () => {
    expect(picker).toContain('<Stack gap="form.controlToHelper">')
  })
})
