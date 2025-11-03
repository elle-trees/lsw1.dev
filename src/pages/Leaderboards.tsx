import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, User, Users } from "lucide-react"; // Added User and Users icons
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getLeaderboardEntries, getCategories, getPlatforms, runTypes } from "@/lib/db";
import { LeaderboardEntry } from "@/types/database";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import LegoGoldBrickIcon from "@/components/icons/LegoGoldBrickIcon";

const Leaderboards = () => {
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedRunType, setSelectedRunType] = useState(runTypes[0]?.id || "");
  const [showObsoleteRuns, setShowObsoleteRuns] = useState("false");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setCategoriesLoading(true);
      try {
        const [fetchedCategories, fetchedPlatforms] = await Promise.all([
          getCategories(),
          getPlatforms()
        ]);
        setAvailableCategories(fetchedCategories);
        setAvailablePlatforms(fetchedPlatforms);
        if (fetchedCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(fetchedCategories[0].id);
        }
        if (fetchedPlatforms.length > 0 && !selectedPlatform) {
          setSelectedPlatform(fetchedPlatforms[0].id);
        }
      } catch (error) {
        // Silent fail
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboardEntries(
          selectedCategory,
          selectedPlatform,
          selectedRunType,
          showObsoleteRuns === "true"
        );
        setLeaderboardData(data);
      } catch (error) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory && selectedPlatform && selectedRunType) {
      fetchLeaderboardData();
    }
  }, [selectedCategory, selectedPlatform, selectedRunType, showObsoleteRuns]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(240,21%,15%)] to-[hsl(235,19%,13%)] text-[hsl(220,17%,92%)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            <LegoGoldBrickIcon size={32} color="#FFD700" className="transition-transform duration-300 hover:rotate-12" />
            Leaderboards
          </h1>
          <p className="text-[hsl(222,15%,60%)] max-w-2xl mx-auto">
            Browse the fastest times across all categories and platforms
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)] mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Changed to 4 columns */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                    <SelectContent>
                      {availablePlatforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              <div> {/* New Run Type Filter */}
                <label className="block text-sm font-medium mb-2">Run Type</label>
                <Select value={selectedRunType} onValueChange={setSelectedRunType}>
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue placeholder="Select run type" />
                  </SelectTrigger>
                  <SelectContent>
                    {runTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.id === 'solo' ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div> {/* New Obsolete Runs Filter */}
                <label className="block text-sm font-medium mb-2">Run Status</label>
                <Select value={showObsoleteRuns} onValueChange={setShowObsoleteRuns}>
                  <SelectTrigger className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Current Runs</SelectItem>
                    <SelectItem value="true">All Runs (including obsolete)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <Card className="bg-[hsl(240,21%,15%)] border-[hsl(235,13%,30%)]">
          <CardHeader>
            <CardTitle>
              {availableCategories.find(c => c.id === selectedCategory)?.name || "Leaderboards"} {/* Only display category name */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner size="sm" className="py-8" />
            ) : (
              <LeaderboardTable data={leaderboardData} platforms={availablePlatforms} categories={availableCategories} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboards;