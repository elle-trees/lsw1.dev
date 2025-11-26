import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";

interface PageSkeletonProps {
  variant?: "default" | "admin" | "stats" | "submit" | "downloads";
}

export function PageSkeleton({ variant = "default" }: PageSkeletonProps) {
  if (variant === "admin") {
    return (
      <div className="min-h-screen bg-[#1e1e2e] text-ctp-text py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 w-full">
          <FadeIn className="space-y-4">
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 11 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-32 flex-shrink-0 rounded-none" />
                ))}
              </div>
            </div>
            <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
                <Skeleton className="h-6 w-48 rounded-none" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 rounded-none" style={{ width: `${80 - i * 10}%` }} />
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className="container mx-auto px-4 py-8">
        <FadeIn className="mb-8">
          <Skeleton className="h-10 w-64 mb-2 rounded-none" />
          <Skeleton className="h-5 w-96 rounded-none" />
        </FadeIn>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <FadeIn delay={i * 0.05}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32 rounded-none" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2 rounded-none" />
                  <Skeleton className="h-4 w-40 rounded-none" />
                </CardContent>
              </FadeIn>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4 p-0 gap-0 bg-ctp-surface0/50 rounded-none border border-ctp-surface1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-none" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 rounded-none" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-none" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 rounded-none" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-none" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (variant === "submit") {
    return (
      <div className="min-h-screen text-ctp-text py-8 overflow-x-hidden relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <FadeIn className="space-y-6">
            <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)] py-4">
                <Skeleton className="h-6 w-48 rounded-none" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2 rounded-none" />
                    <div className="flex w-full p-1 gap-2 overflow-x-auto pb-3">
                      {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-9 w-28 flex-shrink-0 rounded-none" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2 rounded-none" />
                    <div className="flex gap-2 overflow-x-auto">
                      <Skeleton className="h-9 w-28 flex-shrink-0 rounded-none" />
                      <Skeleton className="h-9 w-28 flex-shrink-0 rounded-none" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    );
  }

  if (variant === "downloads") {
    return (
      <div className="container mx-auto px-4 py-8">
        <FadeIn className="mb-8">
          <Skeleton className="h-10 w-64 mb-2 rounded-none" />
          <Skeleton className="h-5 w-96 rounded-none" />
        </FadeIn>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <FadeIn delay={i * 0.05}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 rounded-none" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 rounded-none" />
                  <Skeleton className="h-4 w-2/3 rounded-none" />
                </CardContent>
              </FadeIn>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="container mx-auto px-4 py-8">
      <FadeIn className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2 rounded-none" />
          <Skeleton className="h-5 w-96 rounded-none" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 rounded-none" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 rounded-none" />
                <Skeleton className="h-4 w-2/3 rounded-none" />
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

