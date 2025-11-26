import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'

// Lazy load Admin page to reduce initial bundle size
const Admin = lazy(() => import('@/pages/Admin').then(m => ({ default: m.default })))

export const Route = createFileRoute('/admin')({
  component: () => (
    <Suspense fallback={<PageSkeleton variant="admin" />}>
      <Admin />
    </Suspense>
  ),
})

