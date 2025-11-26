# SSR Implementation Guide

## Overview

This project now supports **Server-Side Rendering (SSR)** with **streaming and partial prerendering** capabilities, similar to Next.js Partial Prerendering (PPR). This provides:

- ✅ Better SEO (search engines get fully rendered HTML)
- ✅ Faster initial page loads (content is ready immediately)
- ✅ Streaming support for Suspense boundaries (partial prerendering)
- ✅ No framework migration needed (stays with Vite + TanStack Router)

## Architecture

### Components

1. **`src/server.tsx`** - Core SSR rendering logic
   - `render()` - Non-streaming SSR (fallback)
   - `renderStream()` - Streaming SSR with React Suspense support
   - Exports `createHTMLTemplate` for HTML generation

2. **`src/entry-server.tsx`** - SSR build entry point
   - Exports all SSR functions for the server bundle

3. **`src/server-html.ts`** - HTML template generator
   - Creates HTML with injected dehydrated React Query state

4. **`server.js`** - Self-hosted server
   - Enables SSR when `dist/server/server.js` exists
   - Falls back to static SPA mode if SSR unavailable

5. **`api/ssr.ts`** - Vercel serverless function
   - Handles SSR for Vercel deployments
   - Automatically falls back to static HTML on errors

## Build Process

### Build Commands

```bash
# Build both client and server
npm run build

# Build client only (static SPA)
npm run build:client

# Build server only (SSR bundle)
npm run build:server
```

### Build Output

- **Client**: `dist/` (static assets, HTML, JS, CSS)
- **Server**: `dist/server/server.js` (SSR bundle)

## Deployment

### Vercel (Recommended)

SSR is automatically enabled on Vercel via the `api/ssr.ts` serverless function.

**Configuration** (`vercel.json`):
- All non-API, non-asset routes are rewritten to `/api/ssr`
- The SSR function handles rendering and returns HTML

**Build**: Vercel automatically runs `npm run build` which builds both client and server.

### Self-Hosted

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server automatically detects if SSR is available:
- If `dist/server/server.js` exists → SSR mode enabled
- Otherwise → Static SPA mode (fallback)

## How It Works

### SSR Flow

1. **Request arrives** → Server receives URL
2. **Router navigation** → TanStack Router navigates to the route
3. **Data loading** → React Query loads data (Firestore, etc.)
4. **Rendering** → React renders component tree to HTML
5. **State dehydration** → React Query state is serialized
6. **HTML generation** → HTML template includes:
   - Rendered HTML in `<div id="root">`
   - Dehydrated state in `<script>window.__REACT_QUERY_STATE__`
   - Client script tag
7. **Response** → HTML sent to client
8. **Hydration** → Client hydrates with the same state

### Streaming (Partial Prerendering)

When using `renderStream()`:
- **Static shell** renders immediately (header, navigation, etc.)
- **Dynamic content** streams in as Suspense boundaries resolve
- Provides faster Time to First Byte (TTFB)

### Fallback Behavior

If SSR fails or is unavailable:
- Server falls back to serving static `index.html`
- Client-side rendering takes over
- App continues to work normally

## Client-Side Hydration

The client (`src/client.tsx`) automatically:
1. Detects server-rendered content
2. Reads dehydrated state from `window.__REACT_QUERY_STATE__`
3. Hydrates React Query with the server state
4. Hydrates React components

## Performance Benefits

### Before (SPA Only)
- Initial HTML: Empty `<div id="root">`
- JavaScript must load before content appears
- SEO: Search engines see empty page

### After (SSR Enabled)
- Initial HTML: Fully rendered content
- Content visible immediately (no JS required)
- SEO: Search engines see complete page
- Streaming: Even faster for Suspense boundaries

## Troubleshooting

### SSR Not Working

1. **Check build output**:
   ```bash
   ls -la dist/server/
   ```
   Should see `server.js`

2. **Check server logs**:
   - Look for "✅ SSR mode enabled" or "📄 Serving static files (SPA mode)"

3. **Vercel deployment**:
   - Check function logs in Vercel dashboard
   - Verify `api/ssr.ts` is deployed

### Build Errors

- **SSR build fails**: Check that all dependencies are compatible with Node.js
- **Import errors**: Some browser-only code may need to be excluded from SSR

### Runtime Errors

- **Hydration mismatches**: Ensure server and client render the same HTML
- **State issues**: Check that `window.__REACT_QUERY_STATE__` is properly injected

## Future Enhancements

Potential improvements:
- [ ] Static site generation (SSG) for specific routes
- [ ] Incremental Static Regeneration (ISR)
- [ ] Edge runtime support (Cloudflare Workers, etc.)
- [ ] Optimized streaming for better performance

## Migration Notes

This implementation:
- ✅ **No breaking changes** - Falls back to SPA if SSR unavailable
- ✅ **Backward compatible** - Existing code works as-is
- ✅ **Progressive enhancement** - SSR improves experience but isn't required

## References

- [TanStack Router SSR Guide](https://tanstack.com/router/latest/docs/framework/react/ssr)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)

