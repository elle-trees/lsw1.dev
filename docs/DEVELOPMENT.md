# Development Guide

## Quick Start

### Development Server (Recommended) ⚡

**For local development, always use Vite's dev server:**

```bash
npm run dev
```

This will:
- Start the Vite dev server on port 8080 (or PORT env var)
- Enable Hot Module Replacement (HMR) for instant updates
- Serve the app with fast refresh
- Provide source maps for debugging
- **No build step required** - works directly from source

The app will be available at `http://localhost:8080`

**⚠️ Important:** If you see a directory listing instead of the site, you're likely running `npm start` instead of `npm run dev`. Use `npm run dev` for development!

### Production Build Testing

To test the production build locally:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

**Note:** The production server (`server.js`) requires the `dist/` directory to exist. If you see a "Build Required" message or directory listing, run `npm run build` first.

## Common Issues

### Directory Listing Instead of Site

**Problem:** You see a directory listing instead of the application.

**Causes:**
1. Running `npm start` without building first
2. Missing `dist/index.html` file
3. Accessing the wrong port or URL

**Solutions:**
- **For development:** Use `npm run dev` (Vite dev server)
- **For production testing:** Run `npm run build` first, then `npm start`
- **Check the port:** Default is 8080, verify with `http://localhost:8080`

### Port Already in Use

If port 8080 is already in use:

```bash
# Set a different port
PORT=3000 npm run dev
```

### Build Errors

If the build fails:
1. Check TypeScript errors: `npx tsc --project tsconfig.app.json --noEmit`
2. Check for missing dependencies: `npm install`
3. Review build output for specific errors

## Development Workflow

1. **Start dev server:** `npm run dev`
2. **Make changes** - HMR will update automatically
3. **Test changes** in browser at `http://localhost:8080`
4. **Build for production:** `npm run build`
5. **Test production build:** `npm start`

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

Environment variables prefixed with `VITE_` are available in the client code via `import.meta.env.VITE_*`.

## Debugging

### TypeScript Errors
```bash
npx tsc --project tsconfig.app.json --noEmit
```

### Linting
```bash
npm run lint          # Oxlint (fast)
npm run lint:eslint   # ESLint (comprehensive)
```

### Build Analysis
```bash
ANALYZE=true npm run build
# Opens bundle analysis at dist/stats.html
```

## Hot Module Replacement (HMR)

Vite's HMR is enabled by default. Changes to:
- React components → Instant update
- CSS files → Instant update
- TypeScript files → Recompile and update

## API Routes

API routes in `/api` are served by Vercel serverless functions in production. In development, they're handled by Vite's dev server.

To test API routes locally:
- Development: `http://localhost:8080/api/...`
- Production build: `http://localhost:8080/api/...` (via server.js)

## Troubleshooting

### Clear Cache
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Reset Build
```bash
rm -rf dist
npm run build
```

