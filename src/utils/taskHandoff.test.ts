import { describe, expect, it } from 'vitest'

import {
  TASK_DRAFT_TITLE_MAX,
  buildCreateTaskHandoffPath,
  buildRegisterHandoffPath,
} from './taskHandoff'

describe('taskHandoff', () => {
  it('builds create path without title when query is empty', () => {
    expect(buildCreateTaskHandoffPath('')).toBe('/tasks/create')
    expect(buildCreateTaskHandoffPath('   ')).toBe('/tasks/create')
  })

  it('encodes draft title on create path', () => {
    expect(buildCreateTaskHandoffPath('Fix my sink')).toBe(
      '/tasks/create?title=Fix%20my%20sink',
    )
  })

  it('truncates long titles', () => {
    const long = 'a'.repeat(TASK_DRAFT_TITLE_MAX + 40)
    const path = buildCreateTaskHandoffPath(long)
    const title = new URL(path, 'https://slashie.app').searchParams.get('title')
    expect(title?.length).toBe(TASK_DRAFT_TITLE_MAX)
  })

  it('builds register next handoff', () => {
    expect(buildRegisterHandoffPath('/tasks/create?title=Help')).toBe(
      '/register?next=%2Ftasks%2Fcreate%3Ftitle%3DHelp',
    )
  })
})
