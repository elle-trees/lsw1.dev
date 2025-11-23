import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { GameDetails } from "@/components/GameDetails";
import { AuthProvider } from "@/components/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/ui/page-transition";

const Index = lazy(() => import("./pages/Index"));
const Leaderboards = lazy(() => import("./pages/Leaderboards"));
const PointsLeaderboard = lazy(() => import("./pages/PointsLeaderboard"));
const SubmitRun = lazy(() => import("./pages/SubmitRun"));
const PlayerDetails = lazy(() => import("./pages/PlayerDetails"));
const RunDetails = lazy(() => import("./pages/RunDetails"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const Admin = lazy(() => import("./pages/Admin"));
const Live = lazy(() => import("./pages/Live"));
const Downloads = lazy(() => import("./pages/Downloads"));
const Stats = lazy(() => import("./pages/Stats"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <GameDetails />
              <main className="flex-grow">
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                    <Route path="/leaderboards" element={<PageTransition><Leaderboards /></PageTransition>} />
                    <Route path="/points" element={<PageTransition><PointsLeaderboard /></PageTransition>} />
                    <Route path="/submit" element={<PageTransition><SubmitRun /></PageTransition>} />
                    <Route path="/player/:playerId" element={<PageTransition><PlayerDetails /></PageTransition>} />
                    <Route path="/run/:runId" element={<PageTransition><RunDetails /></PageTransition>} />
                    <Route path="/settings" element={<PageTransition><UserSettings /></PageTransition>} />
                    <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
                    <Route path="/live" element={<PageTransition><Live /></PageTransition>} />
                    <Route path="/downloads" element={<PageTransition><Downloads /></PageTransition>} />
                    <Route path="/stats" element={<PageTransition><Stats /></PageTransition>} />
                    <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;