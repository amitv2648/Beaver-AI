import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PublicRouteLayout } from './layouts/PublicRouteLayout'

export const router = createBrowserRouter([
  {
    element: <PublicRouteLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
