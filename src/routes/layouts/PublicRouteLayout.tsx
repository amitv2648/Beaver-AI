import { Outlet } from 'react-router-dom'

import { AppShell } from '../../components/layout/AppShell'

export function PublicRouteLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
