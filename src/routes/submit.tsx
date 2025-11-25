import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Lazy load SubmitRun page to reduce initial bundle size (contains form libraries)
const SubmitRun = lazy(() => import('@/pages/SubmitRun').then(m => ({ default: m.default })))

export const Route = createFileRoute('/submit')({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <SubmitRun />
    </Suspense>
  ),
})

