import { renderToPipeableStream, renderToString } from 'react-dom/server'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { App } from './app'
import './lib/i18n' // Initialize i18n for SSR
import type { Readable } from 'stream'
import { createHTMLTemplate as createHTMLTemplateFn } from './server-html'

// Re-export for server entry
export { createHTMLTemplateFn as createHTMLTemplate }

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter<typeof routeTree>>
  }
}

// Create a new QueryClient for each request to avoid state leakage
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

export interface RenderResult {
  html?: string
  stream?: Readable
  dehydratedState: unknown
  error?: Error
}

/**
 * Render with streaming support for partial prerendering
 * Returns a stream for better performance with Suspense boundaries
 */
export async function renderStream(url: string): Promise<RenderResult> {
  const queryClient = createQueryClient()
  
  // Parse URL
  const [pathname, search] = url.split('?')
  const fullPath = pathname || '/'
  
  // Create a new router instance for this request to avoid state leakage
  const requestRouter = createRouter({ 
    routeTree,
    context: {
      queryClient,
    },
  })
  
  try {
    // Navigate to the requested URL
    await requestRouter.navigate({
      to: fullPath,
      search: search ? new URLSearchParams(search) : undefined,
    })

    // Wait for router to load route data
    await requestRouter.load()

    // Create a promise to track when streaming completes
    let resolveStream: () => void
    let rejectStream: (error: Error) => void
    const streamPromise = new Promise<void>((resolve, reject) => {
      resolveStream = resolve
      rejectStream = reject
    })

    let streamError: Error | null = null

    // Render with streaming for partial prerendering
    const { pipe } = renderToPipeableStream(
      <ErrorBoundary>
        <App queryClient={queryClient} />
      </ErrorBoundary>,
      {
        // Don't specify bootstrapScripts - let the HTML template handle it
        onShellReady() {
          // Shell is ready - static parts are rendered
          // This allows streaming the static shell immediately
        },
        onAllReady() {
          // All content is ready
          resolveStream()
        },
        onError(error: Error) {
          streamError = error
          rejectStream(error)
        },
      }
    )

    // Dehydrate React Query state for hydration on client
    const dehydratedState = dehydrate(queryClient)

    // Create a readable stream from the pipe function
    // The pipe function needs to be called with a writable stream
    // We'll handle this in the server.js by creating a PassThrough stream
    return {
      stream: { pipe, abort } as any, // Store pipe and abort functions
      dehydratedState,
      error: streamError || undefined,
    }
  } catch (error) {
    return {
      dehydratedState: dehydrate(queryClient),
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Fallback render function for non-streaming environments
 * Returns complete HTML string
 */
export async function render(url: string): Promise<RenderResult> {
  const queryClient = createQueryClient()
  
  // Parse URL
  const [pathname, search] = url.split('?')
  const fullPath = pathname || '/'
  
  // Create a new router instance for this request to avoid state leakage
  const requestRouter = createRouter({ 
    routeTree,
    context: {
      queryClient,
    },
  })
  
  try {
    // Navigate to the requested URL
    await requestRouter.navigate({
      to: fullPath,
      search: search ? new URLSearchParams(search) : undefined,
    })

    // Wait for router to load route data
    await requestRouter.load()

    // Render the app to string with the request-specific router
    const html = renderToString(
      <ErrorBoundary>
        <App queryClient={queryClient} />
      </ErrorBoundary>
    )

    // Dehydrate React Query state for hydration on client
    const dehydratedState = dehydrate(queryClient)

    return { html, dehydratedState }
  } catch (error) {
    return {
      dehydratedState: dehydrate(queryClient),
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

