import { createBrowserRouter, Navigate } from 'react-router-dom'
import { BackofficeLayout } from './layouts/BackofficeLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SegmentsPage } from './features/segments/SegmentsPage'
import { NewSegmentPage } from './features/segments/NewSegmentPage'
import { GuidePage } from './features/guide/GuidePage'
import { ReadingTodayPage } from './features/reading/ReadingTodayPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { AnnouncementsPage } from './features/announcements/AnnouncementsPage'
import { ResourcesPage } from './features/resources/ResourcesPage'
import { ResourcesAdminPage } from './features/resources/ResourcesAdminPage'
import { ResourcesHubPage } from './features/resources/ResourcesHubPage'
import { ReadingGuideAdminPage } from './features/resources/ReadingGuideAdminPage'
import { SettingsAdminPage } from './features/settings/SettingsAdminPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Navigate to="/guia" replace /> },
      { path: '/guia', element: <GuidePage /> },
      { path: '/lectura-hoy', element: <ReadingTodayPage /> },
      { path: '/configuracion', element: <SettingsPage /> },
      { path: '/recursos', element: <ResourcesPage /> },
    ],
  },
  {
    element: <BackofficeLayout />,
    children: [
      { path: '/admin', element: <DashboardPage /> },
      { path: '/admin/segmentos', element: <SegmentsPage /> },
      { path: '/admin/segmentos/nuevo', element: <NewSegmentPage /> },
      { path: '/admin/anuncios', element: <AnnouncementsPage /> },
      { path: '/admin/recursos', element: <ResourcesHubPage /> },
      { path: '/admin/recursos/por-mes', element: <ResourcesAdminPage /> },
      { path: '/admin/recursos/guia-lectura', element: <ReadingGuideAdminPage /> },
      { path: '/admin/configuracion', element: <SettingsAdminPage /> },
    ],
  },
])
