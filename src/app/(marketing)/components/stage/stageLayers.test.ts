import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

import { system } from '@/theme/chakraSystem'

const SRC = join(process.cwd(), 'src')
const STAGE = join(SRC, 'app/(marketing)/components/stage')
const KIT = join(STAGE, 'kit')

function filesUnder(dir: string, keep: (path: string) => boolean): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return filesUnder(path, keep)
    return keep(path) ? [path] : []
  })
}

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

describe('the stage kit and the cascade layers', () => {
  const layers = withoutComments(
    readFileSync(join(STAGE, 'layers.css'), 'utf8'),
  )

  it("names Chakra's layers in Chakra's order, then the kit's", () => {
    // Chakra states `@layer reset, base, tokens, recipes;` itself. If a
    // release renames or reorders them, this line has to follow.
    const chakra = system.layers.names
    expect(chakra).toEqual(['reset', 'base', 'tokens', 'recipes'])
    expect(layers.trim()).toBe(`@layer ${[...chakra, 'stageshow'].join(', ')};`)
  })

  it('is stated before any of the kit, by the one module scenes import', () => {
    const entry = readFileSync(join(STAGE, 'index.ts'), 'utf8')
    const imports = entry.match(/^(?:import|export)\s[^\n]*$/gm) ?? []
    expect(imports[0]).toBe("import './layers.css'")
    // The kit's modules (and their styles) all come after it.
    expect(imports.slice(1).every((line) => line.includes("'./kit/"))).toBe(
      true,
    )
  })

  it('has every kit rule inside the `stageshow` layer', () => {
    const sheets = filesUnder(KIT, (path) => path.endsWith('.css'))
    expect(sheets.length).toBeGreaterThan(10)
    for (const sheet of sheets) {
      const css = withoutComments(readFileSync(sheet, 'utf8')).trim()
      expect(css.startsWith('@layer stageshow {'), sheet).toBe(true)
      // Whatever else sits at the top level is one of the kit's guards
      // against a host page's element rules: scoped to a stage, and weaker
      // than any class (`:where(.ss-stage)`).
      let depth = 0
      let prelude = ''
      const topLevel: string[] = []
      for (const char of css) {
        if (char === '{') {
          if (depth === 0) topLevel.push(prelude.trim())
          depth += 1
          prelude = ''
        } else if (char === '}') {
          depth -= 1
          prelude = ''
        } else prelude += char
      }
      expect(depth, sheet).toBe(0)
      const [layer, ...guards] = topLevel
      expect(layer, sheet).toBe('@layer stageshow')
      for (const guard of guards) {
        expect(guard.startsWith(':where(.ss-stage'), `${sheet}: ${guard}`).toBe(
          true,
        )
      }
    }
  })

  it('is only reached through the entry module', () => {
    const sources = filesUnder(
      SRC,
      (path) => /\.(ts|tsx|mts|mdx)$/.test(path) && !path.startsWith(KIT + sep),
    )
    const direct = sources.filter((path) => {
      if (path === join(STAGE, 'index.ts')) return false
      if (path === join(STAGE, 'stageLayers.test.ts')) return false
      return /components\/stage\/kit\/|from '\.\/kit\/|from '\.\.\/stage\/kit\//.test(
        readFileSync(path, 'utf8'),
      )
    })
    expect(direct.map((path) => relative(SRC, path))).toEqual([])
  })
})
