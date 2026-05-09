import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { AuthGate } from '../features/auth/components/AuthGate'
import { AppProviders } from './providers'

export function App() {
  return (
    <AppProviders>
      <AuthGate>
        <DashboardPage />
      </AuthGate>
    </AppProviders>
  )
}
