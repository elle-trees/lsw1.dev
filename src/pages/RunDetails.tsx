import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Users, Timer, Calendar, CheckCircle, UserCircle } from "lucide-react";
import { getLeaderboardEntryById, getPlayerByUid, getPlayerByUsername, getCategories, getPlatforms, runTypes } from "@/lib/db";
import { LeaderboardEntry, Player } from "@/types/database";
import { VideoEmbed } from "@/components/VideoEmbed";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

const RunDetails = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [run, setRun] = useState<LeaderboardEntry | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [verifier, setVerifier] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [platforms, setPlatforms] = useState<{ id: string; name: string }[]>([]);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const detailsCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRunData = async () => {
      if (!runId) {
        toast({
          title: "Error",
          description: "Run ID is missing.",
          variant: "destructive",
        });
        navigate("/leaderboards");
        return;
      }

      setLoading(true);
      try {
        const [runData, fetchedCategories, fetchedPlatforms] = await Promise.all([
          getLeaderboardEntryById(runId),
          getCategories(),
          getPlatforms()
        ]);
        
        if (!runData) {
          toast({
            title: "Run Not Found",
            description: "This run could not be found.",
            variant: "destructive",
          });
          navigate("/leaderboards");
          return;
        }

        setRun(runData);
        setCategories(fetchedCategories);
        setPlatforms(fetchedPlatforms);

        // Fetch player data
        if (runData.playerId) {
          const playerData = await getPlayerByUid(runData.playerId);
          setPlayer(playerData);
        }

        // Fetch player2 data for co-op runs
        if (runData.player2Name && runData.runType === 'co-op') {
          try {
            const player2Data = await getPlayerByUsername(runData.player2Name);
            if (player2Data) {
              setPlayer2(player2Data);
            }
          } catch {
            // Silent fail - player2 might not have an account
          }
        }

        // Fetch verifier data if verifiedBy exists
        if (runData.verifiedBy) {
          // Try to parse as UID first, then fetch player
          // If it's a name/email, we'll just display it as-is
          try {
            const verifierData = await getPlayerByUid(runData.verifiedBy);
            if (verifierData) {
              setVerifier(verifierData);
            }
          } catch {
            // verifiedBy might be a name/email string, not a UID
            // We'll handle this in the display
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load run details.",
          variant: "destructive",
        });
        navigate("/leaderboards");
      } finally {
        setLoading(false);
      }
    };

    fetchRunData();
  }, [runId, navigate, toast]);

  useEffect(() => {
    if (leftColumnRef.current && detailsCardRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (leftColumnRef.current && detailsCardRef.current) {
          // Get the height of the entire left column (video + comment)
          const leftColumnHeight = leftColumnRef.current.offsetHeight;
          detailsCardRef.current.style.height = `${leftColumnHeight}px`;
        }
      });
      resizeObserver.observe(leftColumnRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [run]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(240,21%,15%)] to-[hsl(235,19%,13%)] text-[hsl(220,17%,92%)] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!run) {
    return null;
  }

  const category = categories.find((c) => c.id === run.category);
  const platform = platforms.find((p) => p.id === run.platform);
  const runType = runTypes.find((rt) => rt.id === run.runType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(240,21%,15%)] to-[hsl(235,19%,13%)] text-[hsl(220,17%,92%)] py-8">
      <div className="max-w-[95rem] mx-auto px-4" id="page-container">
        <Button
          variant="ghost"
          onClick={() => navigate("/leaderboards")}
          className="mb-6 text-[hsl(222,15%,60%)] hover:text-[hsl(220,17%,92%)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leaderboards
        </Button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div ref={leftColumnRef} className="flex-1 space-y-6 min-w-0 w-full lg:w-auto">
            {run.videoUrl ? (
              <Card className="bg-card border-border overflow-hidden w-full">
                <CardContent className="p-0">
                  <VideoEmbed url={run.videoUrl} title={`${run.playerName}'s Run`} />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center text-muted-foreground text-lg">
                  No video available
                </CardContent>
              </Card>
            )}

            {run.comment && (
              <Card className="bg-card border-border" id="comment-card">
                <CardHeader className="pb-4 px-5 pt-5">
                  <CardTitle className="text-xl text-card-foreground">Description</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <p className="text-card-foreground whitespace-pre-wrap text-base leading-relaxed">{run.comment}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="w-full lg:w-96 xl:w-[28rem] flex-shrink-0">
            <Card ref={detailsCardRef} className="bg-card border-border overflow-y-auto">
              <CardHeader className="pb-6 px-6 pt-6">
                <CardTitle className="text-2xl text-card-foreground">Run Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-6 pb-6 space-y-6">
                <div>
                  <div className="text-base text-muted-foreground mb-2 font-medium">Player{run.runType === 'co-op' ? 's' : ''}</div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/player/${run.playerId}`}
                      className="font-medium text-lg hover:opacity-80 transition-opacity"
                      style={{ color: player?.nameColor || 'inherit' }}
                    >
                      {run.playerName}
                    </Link>
                    {run.player2Name && (
                      <>
                        <span className="text-muted-foreground">&</span>
                        <span 
                          className="font-medium text-lg"
                          style={{ color: player2?.nameColor || run.player2Color || 'inherit' }}
                        >
                          {run.player2Name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-base text-muted-foreground mb-2 font-medium">Time</div>
                  <div className="font-mono text-3xl font-bold text-[#cdd6f4] flex items-center gap-3">
                    <Timer className="h-7 w-7" />
                    {run.time}
                  </div>
                </div>

                <div>
                  <div className="text-base text-muted-foreground mb-2 font-medium">Category</div>
                  <Badge variant="outline" className="border-border text-base px-3 py-1.5">
                    {category?.name || run.category}
                  </Badge>
                </div>

                <div>
                  <div className="text-base text-muted-foreground mb-2 font-medium">Platform</div>
                  <Badge variant="outline" className="border-border text-base px-3 py-1.5">
                    {platform?.name || run.platform.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <div className="text-base text-muted-foreground mb-2 font-medium">Run Type</div>
                  <Badge variant="outline" className="border-border flex items-center gap-2 w-fit text-base px-3 py-1.5">
                    {run.runType === 'solo' ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    {runType?.name || run.runType.charAt(0).toUpperCase() + run.runType.slice(1)}
                  </Badge>
                </div>

                <div>
                  <div className="text-base text-muted-foreground mb-2 font-medium">Date</div>
                  <div className="flex items-center gap-2 text-card-foreground text-lg">
                    <Calendar className="h-5 w-5" />
                    {formatDate(run.date)}
                  </div>
                </div>

                {run.rank && (
                  <div>
                    <div className="text-base text-muted-foreground mb-2 font-medium">Rank</div>
                    <Badge
                      variant={run.rank <= 3 ? "default" : "secondary"}
                      className="flex items-center gap-2 w-fit text-base px-3 py-1.5"
                    >
                      {run.rank === 1 && <span className="w-4 h-4 rounded-full bg-[#0055BF]"></span>}
                      {run.rank === 2 && <span className="w-4 h-4 rounded-full bg-[#FFD700]"></span>}
                      {run.rank === 3 && <span className="w-4 h-4 rounded-full bg-[#A8A8A8]"></span>}
                      #{run.rank}
                    </Badge>
                  </div>
                )}

                {/* Verification Status */}
                <div>
                  <div className="text-base text-muted-foreground mb-2 font-medium">Verification Status</div>
                  {run.verified ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-500 text-lg">Verified</span>
                      {run.verifiedBy && (
                        <div className="text-base text-muted-foreground ml-2">
                          by {verifier ? (
                            <Link
                              to={`/player/${verifier.uid}`}
                              className="hover:text-[hsl(var(--mocha-mauve))] transition-colors"
                            >
                              {verifier.displayName}
                            </Link>
                          ) : (
                            <span>{run.verifiedBy}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground"></div>
                      <span className="text-muted-foreground text-lg">Pending Verification</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunDetails;

