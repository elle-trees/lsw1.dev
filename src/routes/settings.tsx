import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Lazy load UserSettings page to reduce initial bundle size
const UserSettings = lazy(() => import('@/pages/UserSettings').then(m => ({ default: m.default })))

export const Route = createFileRoute('/settings')({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <UserSettings />
    </Suspense>
  ),
})

