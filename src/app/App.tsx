import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { VersionMonitor } from './shared/components/version-monitor/VersionMonitor'
import { QueryProvider } from './shared/providers/QueryProvider'
import { ModalProvider } from './shared/components/modal/composed/ModalProvider'

export function App() {
  return (
    <QueryProvider>
      <ModalProvider>
        <RouterProvider router={router} />
        <VersionMonitor />
      </ModalProvider>
    </QueryProvider>
  )
}
