import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { VersionMonitor } from './shared/components/version-monitor/VersionMonitor'
import { QueryProvider } from './shared/providers/QueryProvider'

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <VersionMonitor />
    </QueryProvider>
  )
}
