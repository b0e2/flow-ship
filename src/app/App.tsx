import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { AppProviders } from './providers'

export function App() {
  return (
    <AppProviders>
      <DashboardPage />
    </AppProviders>
  )
}
