import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CardSkeletonProps {
  showHeader?: boolean;
  lines?: number;
}

export function CardSkeleton({ showHeader = true, lines = 3 }: CardSkeletonProps) {
  return (
    <Card className="bg-gradient-to-br from-[hsl(240,21%,16%)] via-[hsl(240,21%,14%)] to-[hsl(235,19%,13%)] border-[hsl(235,13%,30%)] shadow-xl">
      {showHeader && (
        <CardHeader className="bg-gradient-to-r from-[hsl(240,21%,18%)] to-[hsl(240,21%,15%)] border-b border-[hsl(235,13%,30%)]">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
      )}
      <CardContent className="p-6 space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-4 w-full" 
            style={{ width: `${80 - i * 10}%` }} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

