import { TableRow, TableCell } from "@/components/ui/table"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export function HistoricoSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-slate-50">
          <TableCell>
            <Checkbox disabled className="opacity-20" />
          </TableCell>

          <TableCell className="py-7">
            <Skeleton className="h-4 w-20 mx-auto" />
          </TableCell>
          
          <TableCell>
            <Skeleton className="h-4 w-32 mx-auto" />
          </TableCell>

          <TableCell>
            <Skeleton className="h-4 w-12 mx-auto" />
          </TableCell>

          <TableCell>
            <Skeleton className="h-4 w-10 mx-auto" />
          </TableCell>

          <TableCell>
            <div className="flex justify-center">
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </TableCell>

          <TableCell>
            <Skeleton className="h-4 w-24 mx-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}