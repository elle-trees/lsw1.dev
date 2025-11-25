import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'
import { GameDetails } from '@/components/GameDetails'

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen bg-[#1e1e2e]">
      <GameDetails />
      <main className="flex-grow bg-[#1e1e2e]">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  ),
})

