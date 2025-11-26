import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'

// Lazy load PointsLeaderboard page to reduce initial bundle size
const PointsLeaderboard = lazy(() => import('@/pages/PointsLeaderboard').then(m => ({ default: m.default })))

export const Route = createFileRoute('/points')({
  component: () => (
    <Suspense fallback={<PageSkeleton variant="default" />}>
      <PointsLeaderboard />
    </Suspense>
  ),
})

