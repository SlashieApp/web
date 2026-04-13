import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import type { TaskQuery } from '@codegen/schema'

import { TaskDetailPageClient } from './components/TaskDetailPageClient'

const AUTH_COOKIE_NAME = 'auth'

const TASK_DETAIL_SSR_QUERY = `
  query TaskDetailSsr($id: ID!) {
    task(id: $id) {
      id
      title
      description
      address
      location {
        lat
        lng
        name
      }
      locationLat
      locationLng
      locationName
      status
      workerUserId
      selectedQuoteId
      createdByUserId
      createdAt
      completedAt
      confirmedAt
      dateTime
      category
      budget {
        currency
        amount
      }
      budgetRange {
        min {
          currency
          amount
        }
        max {
          currency
          amount
        }
      }
      paymentMethod
      contactMethod
      images
      availability {
        day
        slots
      }
      poster {
        id
        firstName
        lastName
        profile {
          name
        }
      }
      selectedQuote {
        id
        price {
          currency
          amount
        }
        message
        workerUserId
        status
        createdAt
      }
      review {
        id
        rating
        comment
        createdAt
        workerUserId
        reviewer {
          id
          firstName
          lastName
          profile {
            name
          }
        }
      }
      comments {
        id
        body
        createdAt
        userId
      }
      quotes {
        id
        taskId
        price {
          currency
          amount
        }
        message
        workerUserId
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const task = await fetchTaskForSsr(slug)
  const title = task ? `${task.title} | Slashie Task` : 'Task Details | Slashie'
  const description = task?.description
    ? task.description.slice(0, 160)
    : 'Browse task details, worker quotes, and availability on Slashie.'
  const firstImage = task?.images?.[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: firstImage ? [{ url: firstImage }] : undefined,
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

  return <TaskDetailPageClient taskId={slug} initialTask={task} />
}
