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
import { AnnouncementListPage } from './features/announcements/pages/admin/AnnouncementListPage'
import { ResourcesPage } from './features/resources/ResourcesPage'
import { ResourcesAdminPage } from './features/resources/ResourcesAdminPage'
import { ResourcesHubPage } from './features/resources/ResourcesHubPage'
import { ReadingGuideAdminPage } from './features/resources/ReadingGuideAdminPage'
import { SettingsAdminPage } from './features/settings/SettingsAdminPage'
import { AuthGate } from './shared/components/auth/AuthGate'
import { PublicSegmentDetailPage } from './features/segments/pages/public/PublicSegmentDetailPage'
import { PublicSegmentDayPage } from './features/segments/pages/public/PublicSegmentDayPage'
import type { AdminRouteHandle } from './layouts/BackofficeLayout'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Navigate to="/guia" replace /> },
      { path: '/guia', element: <GuidePage /> },
      { path: '/lectura-hoy', element: <ReadingTodayPage /> },
      { path: '/configuracion', element: <SettingsPage /> },
      { path: '/recursos', element: <ResourcesPage /> },
      { path: '/segmentos', element: <Navigate to="/guia" replace /> },
      { path: '/segmentos/:id', element: <PublicSegmentDetailPage /> },
      { path: '/segmentos/:id/dias/:day', element: <PublicSegmentDayPage /> },
    ],
  },
  {
    element: (
      <AuthGate>
        <BackofficeLayout />
      </AuthGate>
    ),
    children: [
      { path: '/admin', element: <DashboardPage /> },
      {
        path: '/admin/segmentos',
        element: <SegmentsPage />,
        handle: {
          breadcrumb: {
            items: [{ label: 'Inicio', to: '/admin' }],
            currentLabel: 'Segmentos',
            backTo: '/admin',
          },
        } satisfies AdminRouteHandle,
      },
      {
        element: <SegmentAdminLayout />,
        children: [
          {
            path: '/admin/segmentos/nuevo',
            element: <SegmentFormPage />,
            handle: {
              segmentTitle: 'Nuevo segmento',
              breadcrumb: {
                items: [{ label: 'Segmentos', to: '/admin/segmentos' }],
                currentLabel: 'Nuevo segmento',
                backTo: '/admin/segmentos',
              },
            } satisfies AdminRouteHandle,
          },
          {
            path: '/admin/segmentos/:id/editar',
            element: <SegmentFormPage />,
            handle: {
              segmentTitle: 'Editar segmento',
              breadcrumb: {
                items: [{ label: 'Segmentos', to: '/admin/segmentos' }],
                currentLabel: 'Editar segmento',
                backTo: '/admin/segmentos',
              },
            } satisfies AdminRouteHandle,
          },
        ],
      },
      {
        path: '/admin/anuncios',
        element: <AnnouncementListPage />,
        handle: {
          breadcrumb: {
            items: [{ label: 'Inicio', to: '/admin' }],
            currentLabel: 'Anuncios',
            backTo: '/admin',
          },
        } satisfies AdminRouteHandle,
      },
      {
        path: '/admin/recursos',
        element: <ResourcesHubPage />,
        handle: {
          breadcrumb: {
            items: [{ label: 'Inicio', to: '/admin' }],
            currentLabel: 'Recursos',
            backTo: '/admin',
          },
        } satisfies AdminRouteHandle,
      },
      {
        path: '/admin/recursos/por-mes',
        element: <ResourcesAdminPage />,
        handle: {
          breadcrumb: {
            items: [{ label: 'Recursos', to: '/admin/recursos' }],
            currentLabel: 'Recursos por mes',
            backTo: '/admin/recursos',
          },
        } satisfies AdminRouteHandle,
      },
      {
        path: '/admin/recursos/guia-lectura',
        element: <ReadingGuideAdminPage />,
        handle: {
          breadcrumb: {
            items: [{ label: 'Recursos', to: '/admin/recursos' }],
            currentLabel: 'Guía de lectura',
            backTo: '/admin/recursos',
          },
        } satisfies AdminRouteHandle,
      },
      {
        path: '/admin/configuracion',
        element: <SettingsAdminPage />,
        handle: {
          breadcrumb: {
            items: [{ label: 'Inicio', to: '/admin' }],
            currentLabel: 'Configuración',
            backTo: '/admin',
          },
        } satisfies AdminRouteHandle,
      },
    ],
  },
])
