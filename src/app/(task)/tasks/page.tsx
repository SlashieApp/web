import { Suspense } from 'react'

import { MyTasksScreen } from './components/MyTasksScreen'

/** My Tasks hub (`/tasks`); who sees what is in views/README.md. */
export default function MyTasksPage() {
  return (
    <Suspense>
      <MyTasksScreen />
    </Suspense>
  )
}
