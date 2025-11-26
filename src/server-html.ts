/**
 * HTML template for SSR
 * Injects server-rendered HTML and dehydrated state
 */
export function createHTMLTemplate(html: string, dehydratedState: unknown, clientScript?: string): string {
  const stateScript = dehydratedState
    ? `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)};</script>`
    : ''

  // Use the client script path, defaulting to the built client entry
  // In production, this will be the hashed JS file from the build
  // In dev, it will be the source file
  const clientScriptTag = clientScript
    ? `<script type="module" src="${clientScript}"></script>`
    : process.env.NODE_ENV === 'production'
    ? '<script type="module" src="/assets/js/client.js"></script>'
    : '<script type="module" src="/src/client.tsx"></script>'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Lego Star Wars speedrunning leaderboards and community" />
    <meta name="theme-color" content="#ffffff" />
    <title>lsw1.dev</title>
    
    <!-- PWA meta tags -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="lsw1.dev" />
    <meta name="mobile-web-app-capable" content="yes" />
    
    <!-- Preconnect to external domains for faster resource loading -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    
    ${stateScript}
  </head>
  <body>
    <div id="root">${html}</div>
    ${clientScriptTag}
  </body>
</html>`
}

