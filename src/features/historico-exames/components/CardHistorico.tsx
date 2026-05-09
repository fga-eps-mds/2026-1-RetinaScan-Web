import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusTag";
import { cn } from "@/lib/utils";

// vai puxar de dados quando tiver integrado
export function CardHistorico({ dados }) {
  return (
    <Card className="w-full border-none shadow-sm p-8 bg-white rounded-[24px]">
      <Table>
        <TableHeader className="text-xl">
          <TableRow className="border-none">
            <TableHead></TableHead>
            <TableHead className="font-bold text-center">ID</TableHead>
            <TableHead className="font-bold text-center">Paciente</TableHead>
            <TableHead className="font-bold text-center">Olho</TableHead>
            <TableHead className="font-bold text-center">Score IA</TableHead>
            <TableHead className="font-bold text-center">Status</TableHead>
            <TableHead className="font-bold text-center">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados.length > 0 ? (
            dados.map((exame) => (
              <TableRow 
                key={exame.id} >
                <TableCell>
                  <Checkbox 
                    className="border-[2px]"/>
                </TableCell>

                <TableCell className="text-center text-lg text-muted-foreground py-9">
                  {exame.id}
                </TableCell>
                <TableCell className="text-center text-lg text-muted-foreground">
                  {exame.paciente}
                </TableCell>

                <TableCell className="text-center text-lg text-muted-foreground">
                  {exame.olho}
                </TableCell>

                <TableCell
                  className={cn(
                    "text-lg text-center font-bold",
                    exame.score_ia > 80
                      ? "text-red-500"
                      : "text-green-500",
                    !exame.score_ia && "text-muted-foreground"
                  )}
                >
                  {exame.score_ia || "--"}
                </TableCell>

                <TableCell className="text-center">
                  <StatusBadge status={exame.status} />
                </TableCell>

                <TableCell className="text-center text-lg text-muted-foreground">
                  {exame.data}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-xl text-center text-muted-foreground"
              >
                Ainda não existem exames cadastrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}