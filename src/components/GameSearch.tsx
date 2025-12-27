// src/components/GameSearch.tsx
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { Search } from "lucide-react";

export function GameSearch() {
  const { switchGame, availableGames } = useGame();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-sm text-muted-foreground"
        >
          <Search className="w-4 h-4 mr-2" />
          Search for a game...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search for a game..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredGames.map((game) => (
                <CommandItem
                  key={game.id}
                  onSelect={() => handleSelect(game.id)}
                >
                  {game.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
