/**
 * Vercel serverless function for SSR
 * This handles all non-API routes and performs server-side rendering
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Only handle GET requests
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    // Skip SSR for static assets and API routes
    const url = req.url || '/'
    const pathname = url.split('?')[0]
    
    // Check if it's a static asset
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.map']
    const isStaticAsset = staticExtensions.some(ext => pathname.endsWith(ext))
    
    if (isStaticAsset || pathname.startsWith('/api/')) {
      // Let Vercel handle static assets and API routes
      res.status(404).json({ error: 'Not found' })
      return
    }

    // Dynamically import SSR render function
    // Try multiple paths to handle different build outputs
    const possiblePaths = [
      '../../../dist/server/server.js', // Vite SSR build output
      '../../../dist/entry-server.js', // Alternative output location
      '../../../src/entry-server.tsx', // Development
    ]
    
    let render: ((url: string) => Promise<any>) | null = null
    let createHTMLTemplate: ((html: string, state: unknown) => string) | null = null
    let importError: Error | null = null

    for (const serverPath of possiblePaths) {
      try {
        const serverModule = await import(serverPath)
        render = serverModule.render || serverModule.default?.render
        createHTMLTemplate = serverModule.createHTMLTemplate || serverModule.default?.createHTMLTemplate
        if (render) {
          break // Successfully loaded
        }
      } catch (error) {
        importError = error as Error
        continue // Try next path
      }
    }

    if (!render) {
      console.error('Failed to load SSR module from all paths:', importError)
      // Fallback to static HTML - let Vercel serve the static index.html
      // This ensures the app still works even if SSR fails
      res.status(200).send('<!doctype html><html><head><title>Loading...</title></head><body><div id="root"></div><script type="module" src="/assets/js/client.js"></script></body></html>')
      return
    }

    if (!render) {
      // Fallback to static HTML
      res.status(200).send('<!doctype html><html><head><title>Loading...</title></head><body><div id="root"></div><script type="module" src="/src/client.tsx"></script></body></html>')
      return
    }

    // Perform SSR
    const result = await render(url)

    if (result.error) {
      console.error('SSR render error:', result.error)
      // Fallback to static HTML on error
      res.status(200).send('<!doctype html><html><head><title>Loading...</title></head><body><div id="root"></div><script type="module" src="/src/client.tsx"></script></body></html>')
      return
    }

    // Generate HTML with dehydrated state
    const html = createHTMLTemplate
      ? createHTMLTemplate(result.html || '', result.dehydratedState)
      : `<!doctype html><html><head><script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(result.dehydratedState)};</script></head><body><div id="root">${result.html || ''}</div><script type="module" src="/src/client.tsx"></script></body></html>`

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (error) {
    console.error('SSR handler error:', error)
    // Fallback to static HTML on error
    res.status(200).send('<!doctype html><html><head><title>Loading...</title></head><body><div id="root"></div><script type="module" src="/src/client.tsx"></script></body></html>')
  }
}

