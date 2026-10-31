import { createBrowserRouter, Navigate } from 'react-router-dom'
import { BackofficeLayout } from './layouts/BackofficeLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SegmentsPage } from './features/segments/pages/admin/SegmentListPage'
import { SegmentFormPage } from './features/segments/pages/admin/SegmentFormPage'
import { SegmentAdminLayout } from './features/segments/layouts/SegmentAdminLayout'
import { GuidePage } from './features/guide/GuidePage'
import { ReadingTodayPage } from './features/reading/ReadingTodayPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { AnnouncementsPage } from './features/announcements/AnnouncementsPage'
import { ResourcesPage } from './features/resources/ResourcesPage'
import { ResourcesAdminPage } from './features/resources/ResourcesAdminPage'
import { ResourcesHubPage } from './features/resources/ResourcesHubPage'
import { ReadingGuideAdminPage } from './features/resources/ReadingGuideAdminPage'
import { SettingsAdminPage } from './features/settings/SettingsAdminPage'
import { AuthGate } from './shared/components/auth/AuthGate'
import { PublicSegmentListPage } from './features/segments/pages/public/PublicSegmentListPage'
import { PublicSegmentDetailPage } from './features/segments/pages/public/PublicSegmentDetailPage'
import { PublicSegmentDayPage } from './features/segments/pages/public/PublicSegmentDayPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Navigate to="/guia" replace /> },
      { path: '/guia', element: <GuidePage /> },
      { path: '/lectura-hoy', element: <ReadingTodayPage /> },
      { path: '/configuracion', element: <SettingsPage /> },
      { path: '/recursos', element: <ResourcesPage /> },
      { path: '/segmentos', element: <PublicSegmentListPage /> },
      { path: '/segmentos/:id', element: <PublicSegmentDetailPage /> },
      { path: '/segmentos/:id/dias/:day', element: <PublicSegmentDayPage /> },
    ],
  },
  {
    element: <AuthGate><BackofficeLayout /></AuthGate>,
    children: [
      { path: '/admin', element: <DashboardPage /> },
      { path: '/admin/segmentos', element: <SegmentsPage /> },
      {
        element: <SegmentAdminLayout />,
        children: [
          { path: '/admin/segmentos/nuevo', element: <SegmentFormPage />, handle: { segmentTitle: 'Nuevo segmento' } },
          { path: '/admin/segmentos/:id/editar', element: <SegmentFormPage />, handle: { segmentTitle: 'Editar segmento' } },
        ],
      },
      { path: '/admin/anuncios', element: <AnnouncementsPage /> },
      { path: '/admin/recursos', element: <ResourcesHubPage /> },
      { path: '/admin/recursos/por-mes', element: <ResourcesAdminPage /> },
      { path: '/admin/recursos/guia-lectura', element: <ReadingGuideAdminPage /> },
      { path: '/admin/configuracion', element: <SettingsAdminPage /> },
    ],
  },
])
