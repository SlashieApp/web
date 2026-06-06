'use client'

import { MyRequestsLayout } from './components/MyRequestsLayout'
import { MyRequestsProvider } from './context/MyRequestsProvider'

export default function MyRequestsPage() {
  return (
    <MyRequestsProvider>
      <MyRequestsLayout />
    </MyRequestsProvider>
  )
}
