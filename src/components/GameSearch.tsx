// src/components/GameSearch.tsx
import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { Search } from "lucide-react";

export function GameSearch() {
  const { switchGame, availableGames } = useGame();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (gameId: string) => {
    switchGame(gameId);
    setOpen(false);
  };

  const filteredGames = query
    ? availableGames.filter((game) =>
        game.name.toLowerCase().includes(query.toLowerCase()),
      )
    : availableGames;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-sm text-muted-foreground"
      >
        <Search className="w-4 h-4 mr-2" />
        Search for a game...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for a game..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Games">
            {filteredGames.map((game) => (
              <CommandItem key={game.id} onSelect={() => handleSelect(game.id)}>
                {game.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
