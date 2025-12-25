// src/contexts/GameContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface Game {
  id: string;
  name: string;
}

interface GameContextType {
  currentGame: Game;
  switchGame: (gameId: string) => void;
  availableGames: Game[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Mock data for available games
const mockGames: Game[] = [
    { id: "lsw", name: "Lego Star Wars: The Video Game" },
    { id: "lsw2", name: "Lego Star Wars II: The Original Trilogy" },
    { id: "lsw_tcs", name: "Lego Star Wars: The Complete Saga" },
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentGame, setCurrentGame] = useState<Game>(mockGames[0]);
  const [availableGames] = useState<Game[]>(mockGames);

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
