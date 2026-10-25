import { createBrowserRouter } from 'react-router-dom'
import { BackofficeLayout } from './layouts/BackofficeLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SegmentsPage } from './features/segments/SegmentsPage'
import { NewSegmentPage } from './features/segments/NewSegmentPage'
import { PlaceholderPage } from './features/placeholder/PlaceholderPage'

export const router = createBrowserRouter([
  {
    element: <BackofficeLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/segmentos', element: <SegmentsPage /> },
      { path: '/segmentos/nuevo', element: <NewSegmentPage /> },
      { path: '/usuarios', element: <PlaceholderPage segment="usuarios" /> },
      { path: '/reportes', element: <PlaceholderPage segment="reportes" /> },
      { path: '/configuracion', element: <PlaceholderPage segment="configuracion" /> },
    ],
  },
])
