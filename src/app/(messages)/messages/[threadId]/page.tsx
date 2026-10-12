'use client'

import { useParams } from 'next/navigation'

import { MessagesScreen } from '../components/MessagesScreen'

export default function MessageThreadPage() {
  const params = useParams<{ threadId: string }>()
  return <MessagesScreen threadId={params.threadId ?? null} />
}
