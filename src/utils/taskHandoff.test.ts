import { describe, expect, it } from 'vitest'

import {
  TASK_DRAFT_TITLE_MAX,
  buildCreateTaskHandoffPath,
  buildRegisterHandoffPath,
  createTaskHrefWithSearchCentre,
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

  it('adds the /search centre to 6 decimals and keeps existing params', () => {
    const centre = { lat: 51.50735123, lng: -0.1277583 }
    expect(createTaskHrefWithSearchCentre('/tasks/create', centre)).toBe(
      '/tasks/create?from=search&lat=51.507351&lng=-0.127758',
    )
    expect(
      createTaskHrefWithSearchCentre('/tasks/create?title=Fix%20tap', centre),
    ).toBe(
      '/tasks/create?title=Fix+tap&from=search&lat=51.507351&lng=-0.127758',
    )
  })

  it('leaves the href alone without a usable centre', () => {
    expect(createTaskHrefWithSearchCentre('/tasks/create', null)).toBe(
      '/tasks/create',
    )
    expect(
      createTaskHrefWithSearchCentre('/tasks/create', {
        lat: Number.NaN,
        lng: 0,
      }),
    ).toBe('/tasks/create')
  })
})
