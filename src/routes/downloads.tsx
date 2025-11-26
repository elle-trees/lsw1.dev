import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'

// Lazy load Downloads page to reduce initial bundle size
const Downloads = lazy(() => import('@/pages/Downloads').then(m => ({ default: m.default })))

export const Route = createFileRoute('/downloads')({
  component: () => (
    <Suspense fallback={<PageSkeleton variant="downloads" />}>
      <Downloads />
    </Suspense>
  ),
})

