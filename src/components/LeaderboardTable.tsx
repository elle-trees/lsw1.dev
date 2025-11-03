import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { User, Users, ExternalLink } from "lucide-react";
import { LeaderboardEntry } from "@/types/database";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  platforms?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
}

export function LeaderboardTable({ data, platforms = [], categories = [] }: LeaderboardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
          <TableHead className="py-3 px-4 text-left">Rank</TableHead>
          <TableHead className="py-3 px-4 text-left">Player</TableHead>
          <TableHead className="py-3 px-4 text-left">Time</TableHead>
          <TableHead className="py-3 px-4 text-left">Date</TableHead>
          <TableHead className="py-3 px-4 text-left">Platform</TableHead>
          <TableHead className="py-3 px-4 text-left">Type</TableHead>
          <TableHead className="py-3 px-4 text-left">Video</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry, index) => {
          const platformName = platforms.find(p => p.id === entry.platform)?.name || entry.platform;
          
          return (
          <TableRow 
            key={entry.id} 
            className={`border-b border-[hsl(235,13%,30%)] hover:bg-[hsl(235,19%,13%)] transition-all duration-300 hover:scale-[1.01] cursor-pointer animate-fade-in ${entry.isObsolete ? 'opacity-60 italic' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <TableCell className="py-3 px-4">
              <Link to={`/run/${entry.id}`} className="block">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={entry.rank <= 3 ? "default" : "secondary"} 
                    className="flex items-center gap-1"
                  >
                    {entry.rank === 1 && <span className="w-3 h-3 rounded-full bg-[#0055BF]"></span>}
                    {entry.rank === 2 && <span className="w-3 h-3 rounded-full bg-[#FFD700]"></span>}
                    {entry.rank === 3 && <span className="w-3 h-3 rounded-full bg-[#A8A8A8]"></span>}
                    #{entry.rank}
                  </Badge>
                  {entry.isObsolete && (
                    <Badge variant="destructive" className="bg-red-800/50 text-red-200">
                      Obsolete
                    </Badge>
                  )}
                </div>
              </Link>
            </TableCell>
            <TableCell className="py-3 px-4 font-medium">
              <Link 
                to={`/player/${entry.playerId}`} 
                className="hover:opacity-80 transition-opacity"
                style={{ color: entry.nameColor || 'inherit' }}
                onClick={(e) => e.stopPropagation()}
              >
                {entry.playerName}
              </Link>
              {entry.player2Name && (
                <>
                  <span className="text-muted-foreground"> & </span>
                  <span style={{ color: entry.player2Color || 'inherit' }}>
                    {entry.player2Name}
                  </span>
                </>
              )}
            </TableCell>
            <TableCell className="py-3 px-4 font-mono">
              <Link to={`/run/${entry.id}`} className="hover:text-[#cba6f7] transition-colors block">
                {entry.time}
              </Link>
            </TableCell>
            <TableCell className="py-3 px-4 text-[hsl(222,15%,60%)]">
              <Link to={`/run/${entry.id}`} className="hover:text-[#cba6f7] transition-colors block">
                {entry.date}
              </Link>
            </TableCell>
            <TableCell className="py-3 px-4">
              <Link to={`/run/${entry.id}`} className="block">
                <Badge variant="outline" className="border-[hsl(235,13%,30%)]">
                  {platformName}
                </Badge>
              </Link>
            </TableCell>
            <TableCell className="py-3 px-4">
              <Link to={`/run/${entry.id}`} className="block">
                <Badge variant="outline" className="border-[hsl(235,13%,30%)] flex items-center gap-1 w-fit">
                  {entry.runType === 'solo' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                  {entry.runType.charAt(0).toUpperCase() + entry.runType.slice(1)}
                </Badge>
              </Link>
            </TableCell>
            <TableCell className="py-3 px-4"> {/* New Video Cell */}
              {entry.videoUrl && (
                <a 
                  href={entry.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#cba6f7] hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}