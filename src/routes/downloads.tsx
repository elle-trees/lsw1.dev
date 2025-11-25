import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Lazy load Downloads page to reduce initial bundle size
const Downloads = lazy(() => import('@/pages/Downloads').then(m => ({ default: m.default })))

export const Route = createFileRoute('/downloads')({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <Downloads />
    </Suspense>
  ),
})

