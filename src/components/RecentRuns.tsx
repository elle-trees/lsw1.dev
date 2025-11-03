import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, User, Users } from "lucide-react";
import { LeaderboardEntry } from "@/types/database";
import { getCategories, getPlatforms } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface RecentRunsProps {
  runs: LeaderboardEntry[];
  loading?: boolean;
  showRankBadge?: boolean;
}

export function RecentRuns({ runs, loading, showRankBadge = true }: RecentRunsProps) {
  const [platforms, setPlatforms] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platformsData, categoriesData] = await Promise.all([
          getPlatforms(),
          getCategories()
        ]);
        setPlatforms(platformsData);
        setCategories(categoriesData);
      } catch (error) {
        // Silent fail
      }
    };
    fetchData();
  }, []);

  // Function to get full category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : null;
  };

  // Function to get full platform name
  const getPlatformName = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.name : null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Timer className="h-5 w-5 text-[hsl(var(--mocha-mauve))]" />
          Recent Runs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <LoadingSpinner size="sm" className="py-8" />
        ) : runs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent runs yet</p>
        ) : (
          <div className="space-y-3">
            {runs.map((run, index) => (
              <Link
                key={run.id}
                to={`/run/${run.id}`}
                className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-[hsl(var(--mocha-surface1))] transition-all duration-200 cursor-pointer border border-transparent hover:border-border group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {showRankBadge && (
                    <Badge 
                      variant={index < 3 ? "default" : "secondary"} 
                      className={`flex-shrink-0 ${
                        index === 0 
                          ? "bg-[hsl(var(--mocha-yellow))] text-[hsl(var(--mocha-crust))]" 
                          : index === 1 
                          ? "bg-[hsl(var(--mocha-blue))] text-[hsl(var(--mocha-crust))]" 
                          : index === 2 
                          ? "bg-[hsl(var(--mocha-peach))] text-[hsl(var(--mocha-crust))]" 
                          : ""
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/player/${run.playerId}`}
                        className="font-semibold truncate hover:opacity-80 transition-opacity"
                        style={{ color: run.nameColor || 'inherit' }}
                      >
                        {run.playerName}
                      </Link>
                      {run.player2Name && (
                        <>
                          <span className="text-muted-foreground font-normal">&</span>
                          <span 
                            className="font-semibold"
                            style={{ color: run.player2Color || 'inherit' }}
                          >
                            {run.player2Name}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryName(run.category) && (
                        <span className="text-sm text-muted-foreground">
                          {getCategoryName(run.category)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-[#cdd6f4]">{run.time}</p>
                    <div className="flex items-center justify-end gap-2 mt-1.5">
                      {getPlatformName(run.platform) && (
                        <Badge variant="outline" className="border-border text-xs px-2 py-0.5">
                          {getPlatformName(run.platform)}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-border text-xs px-2 py-0.5 flex items-center gap-1">
                        {run.runType === 'solo' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {run.runType.charAt(0).toUpperCase() + run.runType.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDate(run.date)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}