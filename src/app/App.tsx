import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { VersionMonitor } from './shared/components/version-monitor/VersionMonitor'

export function App() {
  return <><RouterProvider router={router} /><VersionMonitor /></>
}
