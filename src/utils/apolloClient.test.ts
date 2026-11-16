import { gql } from '@apollo/client/core'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Analytics only records the failure; its UI imports don't load in node.
vi.mock('@/utils/analytics', () => ({
  captureApiError: vi.fn(),
  getCurrentRoute: () => '/',
}))

/** A one-cookie jar, enough for the auth token helpers. */
const jar = new Map<string, string>()
const documentStub = {
  get cookie() {
    return [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
  },
  set cookie(line: string) {
    const [pair, ...attrs] = line.split(';').map((s) => s.trim())
    const [name, value = ''] = (pair ?? '').split('=')
    if (!name) return
    if (attrs.some((a) => a.toLowerCase() === 'max-age=0') || !value) {
      jar.delete(name)
    } else {
      jar.set(name, value)
    }
  },
}

/** The API answers every request with "your session is over". */
const fetchStub = vi.fn(
  async () =>
    new Response(
      JSON.stringify({
        data: null,
        errors: [
          {
            message: 'UNAUTHENTICATED',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ),
)

const SEED = gql`
  query Seed {
    me {
      id
      email
    }
  }
`
const OTHER = gql`
  query Other {
    me {
      id
    }
  }
`

let client: typeof import('./apolloClient')
let auth: typeof import('./auth')

beforeAll(async () => {
  vi.stubGlobal('document', documentStub)
  vi.stubGlobal('fetch', fetchStub)
  client = await import('./apolloClient')
  auth = await import('./auth')
})

afterAll(() => {
  vi.unstubAllGlobals()
})

beforeEach(() => {
  jar.clear()
  client.apolloClient.cache.writeQuery({
    query: SEED,
    data: { me: { __typename: 'User', id: 'u1', email: 'a@example.com' } },
  })
})

const cached = () =>
  client.apolloClient.cache.extract() as Record<string, unknown>

/** FE-474: what one person's session cached never reaches the next person. */
describe('session cache', () => {
  it('clearSessionCache empties the cache', async () => {
    expect(Object.keys(cached())).not.toHaveLength(0)
    await client.clearSessionCache()
    expect(cached()).toEqual({})
  })

  it('a request the API refuses as signed out drops the token and the cache', async () => {
    auth.setAuthToken('old-token')
    expect(auth.getAuthToken()).toBe('old-token')
    await client.apolloClient
      .query({ query: OTHER, fetchPolicy: 'network-only' })
      .catch(() => undefined)
    expect(auth.getAuthToken()).toBeNull()
    await vi.waitFor(() => expect(cached()).toEqual({}))
  })
})
