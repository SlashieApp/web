import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import type { TaskQuery } from '@codegen/schema'

import { TaskDetailLayout } from './components/TaskDetailPageClient'
import { TaskDetailProvider } from './context/TaskDetailProvider'

const AUTH_COOKIE_NAME = 'auth'

const TASK_DETAIL_SSR_QUERY = `
  query TaskDetailSsr($id: ID!) {
    task(id: $id) {
      id
      title
      description
      budget {
        amount
        currency
        type
        paymentMethod
      }
      datetime {
        date
        time
        type
      }
      contactMethod
      images
      status
      completedAt
      confirmedAt
      createdAt
      location {
        lat
        lng
        name
        address
      }
      poster {
        id
        firstName
        lastName
        profile {
          name
        }
      }
      quotes {
        id
        taskId
        workerUserId
        price {
          currency
          amount
        }
        message
        status
        createdAt
        professional {
          id
          firstName
          lastName
          profile {
            name
            avatarUrl
          }
        }
      }
    }
  }
`

async function fetchTaskForSsr(taskId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? ''
  const graphqlUrl = `${process.env.NEXT_PUBLIC_GRAPHQL_URL}/graphql`

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? { authorization: `Bearer ${decodeURIComponent(token)}` }
        : {}),
    },
    body: JSON.stringify({
      query: TASK_DETAIL_SSR_QUERY,
      variables: { id: taskId },
    }),
    next: { revalidate: 0 },
  })

  if (!response.ok) return null
  const json = (await response.json()) as {
    data?: TaskQuery
  }
  return json.data?.task ?? null
}

function absoluteUrlFromEnv(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
      : '')
  if (!base) return pathOrUrl
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const task = await fetchTaskForSsr(slug)
  const title = task ? `${task.title} | Slashie Task` : 'Task Details | Slashie'
  const rawDescription = task?.description?.trim()
  const description = rawDescription
    ? rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}…`
      : rawDescription
    : 'Browse task details, worker quotes, and availability on Slashie.'
  const firstImage = task?.images?.[0]
  const ogImageUrl = firstImage ? absoluteUrlFromEnv(firstImage) : undefined
  const canonicalPath = `/task/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      url: absoluteUrlFromEnv(canonicalPath),
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const task = await fetchTaskForSsr(slug)

  return (
    <TaskDetailProvider taskId={slug} initialTask={task}>
      <TaskDetailLayout taskId={slug} />
    </TaskDetailProvider>
  )
}
