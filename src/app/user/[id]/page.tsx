import { permanentRedirect } from 'next/navigation'

type Search = Record<string, string | string[] | undefined>

function searchString(search: Search): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === 'string') params.set(key, value)
    else if (Array.isArray(value)) {
      for (const item of value) params.append(key, item)
    }
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Retired public user URL. The segment is already `users._id`.
 * `proxy` 301s first; this is the fallback permanent redirect.
 */
export default async function LegacyUserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Search>
}) {
  const { id } = await params
  const search = await searchParams
  permanentRedirect(`/profile/${id}${searchString(search)}`)
}
