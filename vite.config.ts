import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Always read from environment variable, fallback to 8080
  const port = parseInt(process.env.PORT || "8080", 10);
  const host = "0.0.0.0";
  const isProduction = mode === "production";
  
  return {
    // Enable Rolldown's native plugins for better performance
    experimental: {
      enableNativePlugin: 'v1',
    },
    server: {
      host: host,
      port: port,
      strictPort: true,
    },
    preview: {
      host: host,
      port: port,
      strictPort: true,
      cors: true,
    },
    plugins: [
      react(),
      // PWA plugin - enables Progressive Web App features
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "placeholder.svg"],
        manifest: {
          name: "lsw1.dev - Lego Star Wars Speedrunning",
          short_name: "lsw1.dev",
          description: "Lego Star Wars speedrunning leaderboards and community",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          icons: [
            {
              src: "/favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
            {
              src: "/placeholder.svg",
              sizes: "192x192",
              type: "image/svg+xml",
            },
            {
              src: "/placeholder.svg",
              sizes: "512x512",
              type: "image/svg+xml",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.firebase(?:app|io)\.com\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "firebase-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60, // 1 hour
                },
                networkTimeoutSeconds: 10,
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // Disable PWA in dev mode for faster development
        },
      }),
      // Bundle analyzer - only in production to avoid dev overhead
      isProduction && visualizer({
        filename: "dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap", // or "sunburst", "network"
      }),
      // Compression plugin - generates .gz and .br files for better performance
      isProduction && viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024, // Only compress files larger than 1KB
        deleteOriginFile: false, // Keep original files
      }),
      isProduction && viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024,
        deleteOriginFile: false,
      }),
    ].filter(Boolean), // Remove false values
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Optimize build performance
      // Rolldown has built-in minification, no need to specify
      sourcemap: false, // Disable sourcemaps in production for faster builds (enable if needed for debugging)
      cssCodeSplit: true, // Split CSS into separate files for better caching
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separate vendor chunks for better caching
            if (id.includes('node_modules')) {
              // Firebase and related - large dependency, separate for better caching
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              // React and React DOM - core framework
              if (id.includes('react-dom') || id.includes('react/')) {
                return 'vendor-react';
              }
              // Radix UI components - large UI library
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              // Recharts (only used on Stats page) - large charting library
              if (id.includes('recharts')) {
                return 'vendor-recharts';
              }
              // React Router - routing library
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              // React Query - data fetching
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              // Framer Motion - animation library (can be large)
              if (id.includes('framer-motion')) {
                return 'vendor-animations';
              }
              // Other large dependencies
              if (id.includes('lucide-react') || id.includes('date-fns')) {
                return 'vendor-utils';
              }
              // Everything else from node_modules
              return 'vendor';
            }
          },
        },
      },
      // Target modern browsers for smaller bundles
      target: "esnext",
      // Increase chunk size warning limit since we're splitting better
      chunkSizeWarningLimit: 600,
    },
  };
});
