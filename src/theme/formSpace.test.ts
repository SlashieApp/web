import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { darkSystem, lightSystem } from './chakraSystem'
import { formSpace, overlayDescriptionStyle, sdlSpace } from './styles'

/**
 * The form spacing table (wiki: Foundations-Form-Spacing, FE-481). The Expo app
 * pins the same literal table in `src/theme/formSpace.test.ts`: keys and values
 * stay identical across the two apps.
 */
const TABLE = {
  titleToSubtitle: 8,
  headerToBody: 24,
  labelToControl: 8,
  fieldGap: 20,
  controlToHelper: 4,
  helperGap: 4,
  bodyToAction: 20,
  actionToDivider: 24,
  dividerToAlternatives: 24,
  alternativesGap: 8,
  sectionGap: 32,
  sectionTitleToField: 12,
  inlineGap: 12,
  controlHeight: 48,
} as const

describe('formSpace', () => {
  it('is the spec table, key for key', () => {
    expect(formSpace).toEqual(TABLE)
  })

  it('sits on the existing 4px scale: no new step', () => {
    const steps = Object.values(sdlSpace) as number[]
    for (const [key, px] of Object.entries(formSpace)) {
      expect(steps, `${key} = ${px}`).toContain(px)
    }
  })
})

describe('form tokens in the Chakra system', () => {
  const gapKeys = Object.keys(TABLE).filter((key) => key !== 'controlHeight')

  it.each([
    ['light', lightSystem],
    ['dark', darkSystem],
  ] as const)(
    '%s: every gap is a spacing.form token at its rem value',
    (_mode, system) => {
      for (const key of gapKeys) {
        const px = TABLE[key as keyof typeof TABLE]
        expect(system.token(`spacing.form.${key}`), key).toBe(`${px / 16}rem`)
      }
    },
  )

  it.each([
    ['light', lightSystem],
    ['dark', darkSystem],
  ] as const)(
    '%s: the control height is a 48px sizes.form token',
    (_mode, system) => {
      expect(system.token('sizes.form.controlHeight')).toBe('48px')
    },
  )

  it('a form gap is a CSS variable, so a theme can still move it', () => {
    expect(lightSystem.token.var('spacing.form.fieldGap')).toBe(
      'var(--chakra-spacing-form-field-gap)',
    )
    expect(lightSystem.token.var('sizes.form.controlHeight')).toBe(
      'var(--chakra-sizes-form-control-height)',
    )
  })

  it('keeps the default spacing scale beside the form tokens', () => {
    expect(lightSystem.token('spacing.5')).toBe('1.25rem')
    expect(lightSystem.token('sizes.12')).toBe('3rem')
  })
})

describe('dialog and drawer frames read the form tokens (FE-481 overlay-chrome)', () => {
  // The frames' geometry is measured in the Modal and Drawer stories; these pin
  // that the numbers come from the tokens, and that no dividing line returns.
  const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')
  const modal = read('src/ui/Modal/Modal.tsx')
  const drawer = read('src/ui/Drawer/Drawer.tsx')

  it.each([
    ['Modal', modal],
    ['Drawer', drawer],
  ] as const)(
    '%s: description 8 under the title, 24 to the first field, 20 to the bar',
    (_name, source) => {
      expect(source).toContain('gap="form.titleToSubtitle"')
      expect(source).toContain('pt="form.headerToBody"')
      expect(source).toContain('form.bodyToAction')
      expect(source).toContain('{...overlayDescriptionStyle}')
    },
  )

  it.each([
    ['Modal', modal],
    ['Drawer', drawer],
  ] as const)(
    '%s: no dividing line on the header or the footer',
    (_name, source) => {
      expect(source).not.toContain('borderTopWidth')
      expect(source).not.toContain('borderBottomWidth')
    },
  )

  it('the Modal bar stays put: the body scrolls inside the dialog', () => {
    expect(modal).toContain('scrollBehavior="inside"')
  })

  it('the description style is muted 14px, weight 500 at most', () => {
    expect(overlayDescriptionStyle).toEqual({
      color: 'text.muted',
      fontSize: 'sm',
      lineHeight: 'tall',
      fontWeight: 500,
    })
  })
})
