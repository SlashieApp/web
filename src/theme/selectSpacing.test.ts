import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Select fields on the form spacing (wiki: Foundations-Form-Spacing, FE-481
 * select-fields): label 8 above, helper 4 below, 20 to the next field, 48 tall.
 * The numbers are measured in the Select, FormField and consumer stories; these
 * pin the structure that keeps them true, so a select does not drift back to its
 * own shell or its own gaps.
 */
const ROOT = process.cwd()
const read = (file: string) => readFileSync(join(ROOT, file), 'utf8')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(name) && !/\.(stories|test)\.tsx?$/.test(name)
      ? [path]
      : []
  })
}

const SELECT = 'src/ui/Select/Select.tsx'
const select = read(SELECT)

describe('select fields: one primitive', () => {
  it('no other source file builds its own native select', () => {
    const others = sourceFiles(join(ROOT, 'src'))
      .map((path) => relative(ROOT, path))
      .filter((path) => path !== SELECT)
      .filter((path) => {
        const source = read(path)
        return /NativeSelect|<select[\s>]/.test(source)
      })
    expect(others).toEqual([])
  })

  it('every select in a form is the control of a FormField', () => {
    for (const file of [
      'src/ui/ReportDialog/ReportDialog.tsx',
      'src/ui/FeedbackDialog/FeedbackDialog.tsx',
      'src/ui/TimeSlotPicker/TimeSlotPicker.tsx',
    ]) {
      const source = read(file)
      expect(source, file).toContain('<Select')
      expect(source, file).toContain('<FormField')
    }
  })

  it('the quote sort is the shared Select with a real label, not a field', () => {
    const sort = read(
      'src/app/(task)/tasks/[slug]/components/quotes/QuotesModule.tsx',
    )
    expect(sort).toContain("import { Badge, Card, Select } from '@ui'")
    expect(sort).toContain('<chakra.label')
    expect(sort).toContain('htmlFor={sortId}')
    expect(sort).toContain('id={sortId}')
  })

  it('a failed accept above the quotes is announced (role alert)', () => {
    const quotes = read(
      'src/app/(task)/tasks/[slug]/components/quotes/QuotesModule.tsx',
    )
    expect(quotes).toMatch(
      /color="status\.danger\.fg" fontSize="sm" role="alert">\s*\{acceptError\}/,
    )
  })
})

describe('Select: the shell is 48 in a field and the whole shell is the target', () => {
  it('reads its height from the field, not from a number of its own', () => {
    expect(select).toContain('useFormControlMinH()')
    expect(select).toContain('minH={minH}')
    expect(select).not.toMatch(/minH=\{?['"]?(44|48)/)
  })

  it('the native control fills the shell and the chevron sits over it', () => {
    // Shell: the frame the chevron is placed in, stretching its children.
    expect(select).toMatch(/position="relative"[\s\S]*?alignItems="stretch"/)
    // Control: no padding of the shell around it, room kept for the chevron.
    expect(select).toContain('pr={9}')
    // Chevron: over the control and out of the hit test.
    expect(select).toMatch(
      /position="absolute"[\s\S]*?pointerEvents="none"[\s\S]*?aria-hidden/,
    )
    // The old layout put the chevron beside the control, which left it dead.
    expect(select).not.toMatch(/pl=\{3\}\s*\n\s*pr=\{2\}/)
  })

  it('types no field gap of its own: label and messages come from FormField', () => {
    expect(select).not.toMatch(/\b(?:mt|mb)=\{?['"]?(?:1|2|4|5|20)\b/)
    expect(select).not.toContain('form.fieldGap')
  })
})
