import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Menus on the form spacing (wiki: Foundations-Form-Spacing, FE-481 menus): the
 * Dropdown panel, the account, task, message and card menus, and the list
 * sheets. The gaps are measured in each surface's stories; these pin that the
 * numbers come from one place and from the tokens, so a menu does not go back
 * to typing its own steps. Rows stay rows: nothing here touches a row.
 */
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

const DROPDOWN = read('src/ui/Dropdown/Dropdown.tsx')
const ACCOUNT_HEADER = read('src/ui/Header/account/AccountMenuHeader.tsx')
const TASK_MENU = read(
  'src/app/(task)/tasks/[slug]/components/layout/TaskOverflowMenu.tsx',
)
const LANGUAGE = read('src/ui/LanguageSwitcher/LanguageSwitcher.tsx')
const PHOTO_SOURCE = read('src/ui/PhotoSourcePicker/PhotoSourcePicker.tsx')
const THREAD_LIST = read(
  'src/app/(messages)/messages/components/ThreadList.tsx',
)

const SURFACES = {
  Dropdown: DROPDOWN,
  AccountMenuHeader: ACCOUNT_HEADER,
  TaskOverflowMenu: TASK_MENU,
  LanguageSwitcher: LANGUAGE,
  PhotoSourcePicker: PHOTO_SOURCE,
  ThreadList: THREAD_LIST,
} as const

describe('menus: one frame from the form spacing', () => {
  it.each(Object.entries(SURFACES))(
    '%s uses no font weight above 600',
    (_name, source) => {
      for (const [, weight] of source.matchAll(/fontWeight=\{(\d+)\}/g)) {
        expect(Number(weight)).toBeLessThanOrEqual(600)
      }
    },
  )

  it('the Dropdown pads both panel modes with one constant, the 8 step', () => {
    expect(DROPDOWN).toContain('const PANEL_PADDING = 2')
    expect(DROPDOWN.match(/p=\{PANEL_PADDING\}/g)).toHaveLength(2)
    // The old frames: the click panel's p 1 (4), the hover panel's px 1 (4).
    expect(DROPDOWN).not.toMatch(/\bp=\{1\}/)
    expect(DROPDOWN).not.toMatch(/\bpx=\{1\}/)
  })

  it('the task menu adds no padding inside the panel: the panel owns it', () => {
    expect(TASK_MENU).not.toContain('p={packed')
    expect(TASK_MENU).toContain(
      '<Stack gap={1} minW={packed ? \'220px\' : undefined} w="full">',
    )
  })

  it('the account menu header reads the header tokens and draws no rule', () => {
    expect(ACCOUNT_HEADER).toContain('gap="form.titleToSubtitle"')
    expect(ACCOUNT_HEADER).toContain('gap="form.controlToHelper"')
    expect(ACCOUNT_HEADER).toContain('mb="form.headerToBody"')
    // The old 2px stack and the rule under the block.
    expect(ACCOUNT_HEADER).not.toMatch(/gap=\{0\.5\}/)
    expect(ACCOUNT_HEADER).not.toContain('borderTopWidth')
    expect(ACCOUNT_HEADER).not.toContain('borderBottomWidth')
  })

  it('the language list is a title block: description in the header, then the header gap, no rule', () => {
    expect(LANGUAGE).toContain('gap="form.titleToSubtitle"')
    expect(LANGUAGE).toContain('pt="form.headerToBody"')
    expect(LANGUAGE).toContain('gap="form.alternativesGap"')
    // The description is the dialog's own, in the style the Modal and Drawer share.
    expect(LANGUAGE).toContain(
      '<DialogDescription {...overlayDescriptionStyle}>',
    )
    // The old rule under the header, the body's 32 above the description, and the 24 stack.
    expect(LANGUAGE).not.toContain('borderBottomWidth')
    expect(LANGUAGE).not.toMatch(/\bpy=\{8\}/)
    expect(LANGUAGE).not.toMatch(/<Stack gap=\{6\}/)
  })

  it('the choice lists stack their rows with the alternatives gap', () => {
    expect(PHOTO_SOURCE).toContain('<Stack gap="form.alternativesGap">')
    expect(PHOTO_SOURCE).not.toMatch(/<Stack gap=\{3\}/)
    expect(THREAD_LIST).toContain('gap="form.alternativesGap"')
  })
})
