import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'

import { DEMO_TASK_ICONS } from './demoTaskIcons'

const landing = 'src/app/(marketing)/components/ui/landing'
const read = (path: string) =>
  readFileSync(join(process.cwd(), landing, path), 'utf8')

describe('DEMO_TASK_ICONS', () => {
  it('has an icon for every demo task, and no two tasks share one', () => {
    const ids = Object.keys(messages.en.landing.phone.tasks).sort()
    expect(Object.keys(DEMO_TASK_ICONS).sort()).toEqual(ids)
    expect(new Set(Object.values(DEMO_TASK_ICONS)).size).toBe(ids.length)
  })

  it('is the table the phone search card reads', () => {
    // The same demo task wears the same icon wherever it is drawn.
    for (const file of ['phone/screens/SearchScreen.tsx']) {
      const source = read(file)
      expect(source).toContain('DEMO_TASK_ICONS')
      expect(source).not.toMatch(
        /LuSprout|LuPackage|LuHammer|LuPaintRoller|LuSparkles/,
      )
    }
  })
})
