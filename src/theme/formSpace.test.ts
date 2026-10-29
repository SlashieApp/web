import { describe, expect, it } from 'vitest'

import { darkSystem, lightSystem } from './chakraSystem'
import { formSpace, sdlSpace } from './styles'

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
