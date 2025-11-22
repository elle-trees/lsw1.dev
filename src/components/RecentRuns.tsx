import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Users, Trophy, Sparkles, Check } from "lucide-react";
import { LeaderboardEntry } from "@/types/database";
import { getCategories, getPlatforms } from "@/lib/db";
import { formatTime } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import LegoStudIcon from "@/components/icons/LegoStudIcon";
import { getPlatformName } from "@/lib/dataValidation";

interface RecentRunsProps {
  runs: LeaderboardEntry[];
  loading?: boolean;
  showRankBadge?: boolean;
  maxRuns?: number; // Optional max runs to display
}

export function RecentRuns({ runs, loading, showRankBadge = true, maxRuns }: RecentRunsProps) {
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
      } catch (_error) {
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

  // Get visible runs based on maxRuns prop
  const visibleRuns = maxRuns ? runs.slice(0, maxRuns) : runs;

  if (loading) {
    return (
      <div className="overflow-x-auto scrollbar-custom">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-ctp-surface1/50 hover:bg-transparent bg-ctp-surface0/50">
              {showRankBadge && <TableHead className="py-3 pl-3 pr-1 text-left text-sm font-semibold text-ctp-text whitespace-nowrap w-16">Rank</TableHead>}
              <TableHead className="py-3 pl-1 pr-2 text-left text-sm font-semibold text-ctp-text min-w-[200px]">Player</TableHead>
              <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden sm:table-cell whitespace-nowrap w-24">Time</TableHead>
              <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden md:table-cell whitespace-nowrap w-28">Date</TableHead>
              <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden lg:table-cell whitespace-nowrap w-32">Platform</TableHead>
              <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden lg:table-cell whitespace-nowrap w-24">Type</TableHead>
              <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden lg:table-cell whitespace-nowrap w-32">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index} className="border-b border-ctp-surface1/20">
                {showRankBadge && (
                  <TableCell className="py-2.5 pl-3 pr-1">
                    <Skeleton className="w-7 h-7" />
                  </TableCell>
                )}
                <TableCell className="py-2.5 pl-1 pr-2">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden sm:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden md:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden lg:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 mx-auto mb-3 text-ctp-overlay0 opacity-50" />
        <p className="text-base text-ctp-overlay0">No recent runs yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-custom">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-ctp-surface1/50 hover:bg-transparent bg-ctp-surface0/50">
            {showRankBadge && <TableHead className="py-3 pl-3 pr-1 text-left text-sm font-semibold text-ctp-text whitespace-nowrap w-16">Rank</TableHead>}
            <TableHead className="py-3 pl-1 pr-2 text-left text-sm font-semibold text-ctp-text min-w-[200px]">Player</TableHead>
            <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden sm:table-cell whitespace-nowrap w-24">Time</TableHead>
            <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden md:table-cell whitespace-nowrap w-28">Date</TableHead>
            <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden lg:table-cell whitespace-nowrap w-32">Platform</TableHead>
            <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden lg:table-cell whitespace-nowrap w-24">Type</TableHead>
            <TableHead className="py-3 px-2 text-left text-sm font-semibold text-ctp-text hidden lg:table-cell whitespace-nowrap w-32">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRuns.map((run, index) => {
            const rank = index + 1;
            const platformName = getPlatformName(
              run.platform,
              platforms,
              run.srcPlatformName
            );

            return (
              <TableRow 
                key={run.id} 
                className={`table-row-animate border-b border-ctp-surface1/20 hover:bg-ctp-surface0 hover:brightness-125 transition-all duration-150 ${run.isObsolete ? 'opacity-60 italic' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {showRankBadge && (
                  <TableCell className="py-2.5 pl-3 pr-1">
                    <Link to={`/run/${run.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {rank === 1 ? (
                          <LegoStudIcon size={28} color="#0055BF" />
                        ) : rank === 2 ? (
                          <LegoStudIcon size={28} color="#FFD700" />
                        ) : rank === 3 ? (
                          <LegoStudIcon size={28} color="#C0C0C0" />
                        ) : (
                          <span className="font-semibold text-sm text-ctp-text w-7 h-7 flex items-center justify-center">
                            #{rank}
                          </span>
                        )}
                        {run.isObsolete && (
                          <Badge variant="destructive" className="bg-red-800/50 text-red-200 text-xs px-1.5 py-0.5 border border-red-700/30">
                            Obsolete
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                )}
                <TableCell className="py-2.5 pl-1 pr-2 min-w-[200px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(() => {
                      // Check if run is unclaimed - simply check if playerId is empty/null
                      const isUnclaimed = !run.playerId || run.playerId.trim() === "";
                      
                      if (isUnclaimed) {
                        // For unclaimed runs, show name without link
                        return (
                          <>
                            <span className="font-semibold text-sm whitespace-nowrap text-ctp-text">{run.playerName}</span>
                            {run.player2Name && (
                              <>
                                <span className="text-ctp-overlay0 text-sm"> & </span>
                                <span className="font-semibold text-sm whitespace-nowrap text-ctp-text">
                                  {run.player2Name}
                                </span>
                              </>
                            )}
                            {rank === 1 && !run.isObsolete && (
                              <Badge className="bg-gradient-to-r from-[#0055BF] to-[#0070f3] text-white text-xs px-1.5 py-0.5 border border-[#0055BF]/50 flex items-center gap-1 font-semibold">
                                <Trophy className="h-2.5 w-2.5" />
                                <span className="hidden sm:inline">World Record</span>
                                <span className="sm:hidden">WR</span>
                              </Badge>
                            )}
                          </>
                        );
                      } else {
                        // For claimed runs, show with link and check icon
                        return (
                          <>
                            <Link 
                              to={`/player/${run.playerId}`} 
                              className="hover:opacity-80 inline-block"
                              style={{ color: run.nameColor || '#cba6f7' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="font-semibold text-sm whitespace-nowrap">{run.playerName}</span>
                            </Link>
                            {run.player2Name && (
                              <>
                                <span className="text-ctp-overlay0 text-sm"> & </span>
                                {run.player2Id && run.player2Id.trim() !== "" ? (
                                  <Link 
                                    to={`/player/${run.player2Id}`} 
                                    className="hover:opacity-80 inline-block"
                                    style={{ color: run.player2Color || '#cba6f7' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="font-semibold text-sm whitespace-nowrap">{run.player2Name}</span>
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-sm whitespace-nowrap text-ctp-text">{run.player2Name}</span>
                                )}
                              </>
                            )}
                            <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            {rank === 1 && !run.isObsolete && (
                              <Badge className="bg-gradient-to-r from-[#0055BF] to-[#0070f3] text-white text-xs px-1.5 py-0.5 border border-[#0055BF]/50 flex items-center gap-1 font-semibold">
                                <Trophy className="h-2.5 w-2.5" />
                                <span className="hidden sm:inline">World Record</span>
                                <span className="sm:hidden">WR</span>
                              </Badge>
                            )}
                          </>
                        );
                      }
                    })()}
                  </div>
                  <div className="sm:hidden mt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ctp-text">{formatTime(run.time)}</span>
                      {platformName && (
                        <Badge variant="outline" className="border-ctp-surface1 bg-ctp-surface0 text-ctp-text text-xs px-1.5 py-0.5">
                          {platformName}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-ctp-surface1 bg-ctp-surface0 text-ctp-text flex items-center gap-1 w-fit text-xs px-1.5 py-0.5">
                        {run.runType === 'solo' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {run.runType.charAt(0).toUpperCase() + run.runType.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden sm:table-cell">
                  <Link to={`/run/${run.id}`} className="hover:text-[#cba6f7]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-semibold text-ctp-text">
                      {formatTime(run.time)}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden md:table-cell">
                  <Link to={`/run/${run.id}`} className="hover:text-[#cba6f7]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm text-ctp-subtext1 whitespace-nowrap">{run.date}</span>
                  </Link>
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden lg:table-cell">
                  <Link to={`/run/${run.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                    {platformName && (
                      <Badge variant="outline" className="border-ctp-surface1/50 bg-ctp-surface0/50 text-ctp-text text-xs px-1.5 py-0.5">
                        {platformName}
                      </Badge>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden lg:table-cell">
                  <Link to={`/run/${run.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="outline" className="border-ctp-surface1/50 bg-ctp-surface0/50 text-ctp-text flex items-center gap-1 w-fit text-xs px-1.5 py-0.5">
                      {run.runType === 'solo' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                      {run.runType.charAt(0).toUpperCase() + run.runType.slice(1)}
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell className="py-2.5 px-2 hidden lg:table-cell">
                  <Link to={`/run/${run.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                    {getCategoryName(run.category) && (
                      <Badge variant="outline" className="border-ctp-surface1/50 bg-ctp-surface0/50 text-ctp-text text-xs px-1.5 py-0.5">
                        {getCategoryName(run.category)}
                      </Badge>
                    )}
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}