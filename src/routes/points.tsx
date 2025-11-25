import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Lazy load PointsLeaderboard page to reduce initial bundle size
const PointsLeaderboard = lazy(() => import('@/pages/PointsLeaderboard').then(m => ({ default: m.default })))

export const Route = createFileRoute('/points')({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <PointsLeaderboard />
    </Suspense>
  ),
})

