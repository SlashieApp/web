import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The step flows on the form spacing (wiki: Foundations-Form-Spacing, FE-481
 * step-flows): post a task, edit task, send quote, leave review and worker
 * setup. The gaps are measured in each surface's stories; these pin that the
 * numbers come from the form pieces and tokens, so a step does not go back to
 * typing its own steps, or to a line over the action bar.
 */
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

const FLOW = 'src/app/(stepflow)'
const CREATE = `${FLOW}/tasks/create/components`
const QUOTE = `${FLOW}/tasks/[slug]/quote/components`
const SETUP = `${FLOW}/worker/setup/components`

const SURFACES = {
  StepFlowLayout: read('src/ui/StepFlowLayout/StepFlowLayout.tsx'),
  CreateTaskMapLayout: read(`${CREATE}/layout/shared/CreateTaskMapLayout.tsx`),
  CreateTaskSection: read(`${CREATE}/layout/shared/CreateTaskSection.tsx`),
  CreateTaskLocationSection: read(
    `${CREATE}/ui/sections/CreateTaskLocationSection.tsx`,
  ),
  CreateTaskAddressSection: read(
    `${CREATE}/ui/sections/CreateTaskAddressSection.tsx`,
  ),
  CreateTaskCategoriesInput: read(
    `${CREATE}/ui/sections/CreateTaskCategoriesInput.tsx`,
  ),
  CreateTaskConsentSection: read(
    `${CREATE}/ui/sections/CreateTaskConsentSection.tsx`,
  ),
  CreateTaskVisualsSection: read(
    `${CREATE}/ui/sections/CreateTaskVisualsSection.tsx`,
  ),
  EditTaskScreen: read(
    `${FLOW}/tasks/[slug]/edit/components/EditTaskScreen.tsx`,
  ),
  TaskQuoteStepContent: read(`${QUOTE}/ui/steps/TaskQuoteStepContent.tsx`),
  TaskQuoteReviewStep: read(`${QUOTE}/ui/steps/TaskQuoteReviewStep.tsx`),
  TaskQuoteFlow: read(`${QUOTE}/TaskQuoteFlow.tsx`),
  TaskReviewStep: read(
    `${FLOW}/tasks/[slug]/review/components/ui/TaskReviewStep.tsx`,
  ),
  WorkerSetupStepContent: read(`${SETUP}/ui/steps/WorkerSetupStepContent.tsx`),
  WorkerSetupChipsField: read(`${SETUP}/ui/inputs/WorkerSetupChipsField.tsx`),
  WorkerSetupBioComposer: read(`${SETUP}/ui/inputs/WorkerSetupBioComposer.tsx`),
  WorkerSetupPortfolioInput: read(
    `${SETUP}/ui/inputs/WorkerSetupPortfolioInput.tsx`,
  ),
  WorkerSetupCategoryTiles: read(
    `${SETUP}/ui/inputs/WorkerSetupCategoryTiles.tsx`,
  ),
  WorkerSetupAreaLocationInput: read(
    `${SETUP}/ui/inputs/WorkerSetupAreaLocationInput.tsx`,
  ),
  ContactMethodsPanel: read(
    'src/app/(dashboard)/components/ui/ContactMethodsPanel.tsx',
  ),
  RadioButtonGroup: read('src/ui/RadioButton/RadioButtonGroup.tsx'),
} as const

describe('step flows: one rhythm from the form pieces', () => {
  it.each(Object.entries(SURFACES))(
    '%s types no stack gap of its own for a field or section gap',
    (_name, source) => {
      // The steps the old flows used between blocks: 20 (gap 5), 24 (gap 6)
      // and 32 (gap 8). Gaps 2 to 4 stay inside a control or a row (a chip's
      // icon, the photo beside its button), which is not a form gap.
      expect(source).not.toMatch(/<(?:Stack|HStack)\s+gap=\{(?:5|6|8)\}/)
      expect(source).not.toMatch(/\bbodyGap=\{/)
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
})

describe('the step flow frame', () => {
  const layout = SURFACES.StepFlowLayout

  it('is title 8 description, 24 to the first field, fields 20 apart', () => {
    expect(layout).toContain("'form.titleToSubtitle'")
    expect(layout).toContain("mb={compact ? 0 : 'form.headerToBody'}")
    expect(layout).toContain('<FormStack>')
  })

  it('keeps the compact map step header at 4 (the tighter header)', () => {
    expect(layout).toContain('gap={compact ? 1 :')
  })

  it('ends the body 20 above Continue and draws no line over the bar', () => {
    expect(layout.match(/pb="form\.bodyToAction"/g)).toHaveLength(2)
    const bar = layout.slice(layout.indexOf('export function StepFlowActions'))
    expect(bar.slice(0, bar.indexOf('<HStack'))).not.toContain('borderTopWidth')
    expect(bar).toContain('pt={0}')
    expect(bar).toContain('size="form"')
  })

  it('post a task: the form steps share it, the map step keeps its tight card', () => {
    const map = SURFACES.CreateTaskMapLayout
    expect(map).toContain('<StepFlowBody errorText={errorText}>')
    expect(map.match(/pb="form\.bodyToAction"/g)).toHaveLength(2)
    // The compact card's header-to-block gaps stay 8 (phone) and 16 (lg).
    expect(map).toContain('gap={{ base: 2, lg: 4 }}')
  })
})

describe('sections and fields', () => {
  it('edit task: the groups are FormSections in a section stack, with no rules', () => {
    const edit = SURFACES.EditTaskScreen
    expect(edit).toContain('<FormStack gap="section">')
    expect(edit.match(/<FormSection /g)).toHaveLength(6)
    expect(edit).not.toContain('borderTopWidth')
    expect(edit).not.toContain('EditTaskGroup')
  })

  it('task sections are a FormStack, 20 apart', () => {
    expect(SURFACES.CreateTaskSection).toContain('<FormStack>')
    expect(SURFACES.CreateTaskSection).toContain('bodyGap="form.fieldGap"')
  })

  it('a choice group lays out like a field', () => {
    const radios = SURFACES.RadioButtonGroup
    expect(radios).toContain('{...formControlLabelProps}')
    expect(radios).toContain('gap="form.alternativesGap"')
    expect(radios).toContain('mt="form.controlToHelper"')
    expect(radios).toContain('gap="form.helperGap"')
    expect(SURFACES.WorkerSetupCategoryTiles).toContain(
      '{...formControlLabelProps}',
    )
    expect(SURFACES.WorkerSetupCategoryTiles).toContain(
      'gap="form.alternativesGap"',
    )
  })

  it('composite fields: pieces 8 apart, the add row 12 apart and 48 tall', () => {
    for (const name of [
      'CreateTaskCategoriesInput',
      'WorkerSetupChipsField',
      'WorkerSetupPortfolioInput',
    ] as const) {
      const source = SURFACES[name]
      expect(source, name).toContain('gap="form.labelToControl"')
      expect(source, name).toContain('gap="form.inlineGap"')
      expect(source, name).toContain('size="form"')
    }
    expect(SURFACES.WorkerSetupBioComposer).toContain(
      'gap="form.labelToControl"',
    )
  })

  it('worker setup: fields 20 apart, the review is a long form of sections', () => {
    const content = SURFACES.WorkerSetupStepContent
    expect(content).toContain(
      "<FormStack gap={view.screen === 'review' ? 'section' : 'field'}>",
    )
    expect(content).toContain('<FormRow')
    expect(content).toContain('<FormSection title={t.review.previewTitle}>')
  })

  it('hit areas that grow into the gaps add no space', () => {
    for (const name of [
      'CreateTaskConsentSection',
      'TaskQuoteFlow',
      'WorkerSetupBioComposer',
      'WorkerSetupStepContent',
    ] as const) {
      expect(SURFACES[name], name).toContain('hitAreaGrowth(')
    }
    // The Withdraw button no longer adds its own 24 on top of the stack's gap.
    expect(SURFACES.TaskQuoteFlow).not.toContain('mt={6}')
  })

  it('a textarea is a block, so its helper is 4 under it', () => {
    expect(read('src/ui/Textarea/Textarea.tsx')).toContain('display="block"')
  })

  it('the gates in front of the post-a-task and send-quote flows are form columns with 48 buttons', () => {
    const verify = read(`${CREATE}/layout/shared/CreateTaskVerifyEmailGate.tsx`)
    // The heading owns the 24 under it: no gapped stack around it.
    expect(verify).not.toContain('<Stack')
    expect(verify).toContain('<FormStack>')
    expect(verify).toContain('size="form"')

    const gate = read(`${QUOTE}/ui/shared/TaskQuoteGateView.tsx`)
    expect(gate).toContain('<FormHeader')
    expect(gate).toContain('<FormStack>')
    expect(gate).not.toContain('<Stack')

    const flow = SURFACES.TaskQuoteFlow
    expect(flow.match(/<Button asChild w="full" size="form">/g)).toHaveLength(3)
    expect(flow).not.toContain('<Button asChild w="full">')
    const paywall = read(
      'src/app/(task)/tasks/[slug]/components/quotes/QuoteLimitPaywall.tsx',
    )
    expect(paywall).toContain('bodyGap="form.bodyToAction"')
    expect(paywall).toContain('size="form"')
  })

  it('the address: the field is the input alone, the Use pin address button is the next piece', () => {
    const address = SURFACES.CreateTaskAddressSection
    const field = address.slice(
      address.indexOf('<FormField'),
      address.indexOf('</FormField>'),
    )
    expect(field).toContain('<Input')
    expect(field).not.toContain('<Button')
    expect(address).toContain('<Stack gap="form.alternativesGap">')
  })

  it('a choice group and the category tiles draw their error with the shared error line', () => {
    for (const file of [
      'src/ui/RadioButton/RadioButtonGroup.tsx',
      `${SETUP}/ui/inputs/WorkerSetupCategoryTiles.tsx`,
    ]) {
      expect(read(file), file).toContain('<FormErrorText id={errorId}>')
    }
  })
})
