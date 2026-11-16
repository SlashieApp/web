import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const store = readFileSync(
  join(process.cwd(), 'src/app/(auth)/store/user.ts'),
  'utf8',
)

/** Where the user store ends what one person's session cached (FE-474). */
describe('the user store clears the cache when a session ends or the person changes', () => {
  it('log out clears it', () => {
    const logout = store.slice(store.indexOf('logout: () => {'))
    expect(logout.slice(0, logout.indexOf('},'))).toContain(
      'void clearSessionCache()',
    )
  })

  it('a session the API ended clears it in the session check', () => {
    const getUser = store.slice(store.indexOf('getUser: async () => {'))
    expect(getUser).toMatch(
      /set\(\{ user: null, me: null, isLoading: false \}\)\s+\/\/[^\n]*\n\s+await clearSessionCache\(\)/,
    )
  })

  it('signing in as someone else clears it before loading them, and sign up checks too', () => {
    const hydrate = store.slice(
      store.indexOf('async function hydrateMeAfterAuth'),
    )
    expect(hydrate.indexOf('await clearCacheIfUserChanged(')).toBeLessThan(
      hydrate.indexOf('apolloClient.query'),
    )
    expect(store).toContain('await clearCacheIfUserChanged(synced.user?.id)')
    expect(store).toMatch(
      /if \(previous && nextUserId && previous !== nextUserId\) \{\s+await clearSessionCache\(\)/,
    )
  })
})
