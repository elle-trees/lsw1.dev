// src/pages/admin/components/GameConfigTab.tsx
import { useGame } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameDetailsConfig } from "@/types/database";
import { useEffect, useState } from "react";
import {
  getGameDetailsConfigFirestore,
  updateGameDetailsConfigFirestore,
} from "@/lib/data/firestore/game-details";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export function GameConfigTab() {
  const { currentGame, availableGames, switchGame } = useGame();
  const [config, setConfig] = useState<GameDetailsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [configString, setConfigString] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      const gameConfig = await getGameDetailsConfigFirestore(currentGame.id);
      setConfig(gameConfig);
      setConfigString(JSON.stringify(gameConfig, null, 2));
      setLoading(false);
    };

    fetchConfig();
  }, [currentGame]);

  const handleGameChange = (gameId: string) => {
    switchGame(gameId);
  };

  const handleSaveChanges = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const newConfig = JSON.parse(configString);
      const success = await updateGameDetailsConfigFirestore(
        currentGame.id,
        newConfig,
      );
      if (success) {
        toast({
          title: "Success",
          description: "Game configuration saved successfully.",
        });
        const gameConfig = await getGameDetailsConfigFirestore(currentGame.id);
        setConfig(gameConfig);
        setConfigString(JSON.stringify(gameConfig, null, 2));
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save game configuration.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="game-select">Select Game</Label>
          <Select value={currentGame.id} onValueChange={handleGameChange}>
            <SelectTrigger id="game-select">
              <SelectValue placeholder="Select a game" />
            </SelectTrigger>
            <SelectContent>
              {availableGames.map((game) => (
                <SelectItem key={game.id} value={game.id}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {config && (
          <div>
            <p>
              Here you can configure the settings for the currently selected
              game: <strong>{currentGame.name}</strong>.
            </p>
            <Textarea
              value={configString}
              onChange={(e) => setConfigString(e.target.value)}
              rows={20}
            />
            <Button
              onClick={handleSaveChanges}
              disabled={loading}
              className="mt-4"
            >
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
