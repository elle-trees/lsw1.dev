import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Always read from environment variable, fallback to 8080
  const port = parseInt(process.env.PORT || "8080", 10);
  const host = "0.0.0.0";
  
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
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separate vendor chunks for better caching
            if (id.includes('node_modules')) {
              // Firebase and related
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              // React and React DOM
              if (id.includes('react-dom') || id.includes('react/')) {
                return 'vendor-react';
              }
              // Radix UI components
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              // Recharts (only used on Stats page)
              if (id.includes('recharts')) {
                return 'vendor-recharts';
              }
              // React Router
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              // React Query
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
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
      // Increase chunk size warning limit since we're splitting better
      chunkSizeWarningLimit: 600,
    },
  };
});
