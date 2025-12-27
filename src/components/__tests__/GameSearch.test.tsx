// src/components/__tests__/GameSearch.test.tsx
import { render, screen } from "@testing-library/react";
import { GameSearch } from "../GameSearch";
import { GameProvider } from "@/contexts/GameContext";
import { vi } from "vitest";

// Mock the useGame hook
vi.mock("@/contexts/GameContext", () => ({
  useGame: () => ({
    switchGame: vi.fn(),
    availableGames: [
      { id: "lsw", name: "Lego Star Wars", abbreviation: "lsw" },
      { id: "lsw2", name: "Lego Star Wars II", abbreviation: "lsw2" },
    ],
  }),
  GameProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("GameSearch", () => {
  it("renders the search button", () => {
    render(
      <GameProvider>
        <GameSearch />
      </GameProvider>,
    );
    expect(screen.getByText("Search for a game...")).toBeInTheDocument();
  });
});
