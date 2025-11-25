import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 5, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow className="border-b border-[hsl(235,13%,30%)] hover:bg-transparent">
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i} className="py-3 px-4">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-b border-[hsl(235,13%,30%)]">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="py-3 px-4">
                  <Skeleton className="h-4 w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

