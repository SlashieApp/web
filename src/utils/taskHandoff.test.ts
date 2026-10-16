import { describe, expect, it } from 'vitest'

import { createTaskHrefWithSearchCentre, repostTaskHref } from './taskHandoff'

describe('taskHandoff', () => {
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

  it('builds the repost link', () => {
    expect(repostTaskHref('t 1')).toBe('/tasks/create?repost=t%201')
  })
})
