import { createBrowserRouter, Navigate } from 'react-router-dom'
import { BackofficeLayout } from './layouts/BackofficeLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SegmentsPage } from './features/segments/SegmentsPage'
import { NewSegmentPage } from './features/segments/NewSegmentPage'
import { PlaceholderPage } from './features/placeholder/PlaceholderPage'
import { GuidePage } from './features/guide/GuidePage'
import { ReadingTodayPage } from './features/reading/ReadingTodayPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { AnnouncementsPage } from './features/announcements/AnnouncementsPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Navigate to="/guia" replace /> },
      { path: '/guia', element: <GuidePage /> },
      { path: '/lectura-hoy', element: <ReadingTodayPage /> },
      { path: '/configuracion', element: <SettingsPage /> },
    ],
  },
  {
    element: <BackofficeLayout />,
    children: [
      { path: '/admin', element: <DashboardPage /> },
      { path: '/admin/segmentos', element: <SegmentsPage /> },
      { path: '/admin/segmentos/nuevo', element: <NewSegmentPage /> },
      { path: '/admin/anuncios', element: <AnnouncementsPage /> },
      { path: '/admin/usuarios', element: <PlaceholderPage segment="usuarios" /> },
      { path: '/admin/reportes', element: <PlaceholderPage segment="reportes" /> },
      { path: '/admin/configuracion', element: <PlaceholderPage segment="configuracion" /> },
    ],
  },
])
