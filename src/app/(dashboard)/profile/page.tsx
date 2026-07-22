'use client'

import { useUserStore } from '@/app/(auth)/store/user'

import { ProfileHub } from './components'

export default function ProfilePage() {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  return <ProfileHub me={me} />
}
