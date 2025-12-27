// src/contexts/GameContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { getAllGameDetailsConfigsFirestore } from "@/lib/data/firestore/game-details";
import { GameDetailsConfig } from "@/types/database";

interface Game {
  id: string;
  name: string;
  abbreviation: string;
}

interface GameContextType {
  currentGame: Game;
  switchGame: (gameId: string) => void;
  availableGames: Game[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentGame, setCurrentGame] = useState<Game>({
    id: "lsw",
    name: "Lego Star Wars: The Video Game",
    abbreviation: "lsw",
  });
  const [availableGames, setAvailableGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      const configs = await getAllGameDetailsConfigsFirestore();
      const games = configs.map((config) => ({
        id: config.id,
        name: config.title,
        abbreviation: config.id, // Assuming id is the abbreviation
      }));
      setAvailableGames(games);
    };

    fetchGames();
  }, []);

  const switchGame = (gameId: string) => {
    const game = availableGames.find((g) => g.id === gameId);
    if (game) {
      setCurrentGame(game);
    }
  };

  return (
    <GameContext.Provider value={{ currentGame, switchGame, availableGames }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
