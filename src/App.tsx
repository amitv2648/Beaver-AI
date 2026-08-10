import { RouterProvider } from 'react-router-dom'

import { ApplicationErrorBoundary } from './components/errors/ApplicationErrorBoundary'
import { DevelopmentErrorTrigger } from './components/errors/DevelopmentErrorTrigger'
import { router } from './routes/router'

export function App() {
  return (
    <ApplicationErrorBoundary>
      <DevelopmentErrorTrigger />
      <RouterProvider router={router} />
    </ApplicationErrorBoundary>
  )
}
