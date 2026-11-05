import { describe, expect, it } from 'vitest'

import { PAGE_GUTTER_X } from '@/theme/pageContainer'

import { PAGE_CONTAINER_GUTTERS } from './PageContainer'

describe('PAGE_CONTAINER_GUTTERS', () => {
  it('all: the page gutters, as the site header has them', () => {
    expect(PAGE_CONTAINER_GUTTERS.all).toEqual(PAGE_GUTTER_X)
  })

  it('lg: none below lg, the lg gutter from lg (Messages, the create-task map)', () => {
    expect(PAGE_CONTAINER_GUTTERS.lg).toEqual({ base: 0, lg: PAGE_GUTTER_X.lg })
  })

  it('none: no gutters', () => {
    expect(PAGE_CONTAINER_GUTTERS.none).toBe(0)
  })
})
