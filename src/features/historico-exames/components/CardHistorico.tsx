import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusTag";

export function CardHistorico({ dados }) {
  return (
    <Card className="w-full border-none shadow-sm p-8 bg-white rounded-[24px]">
      <Table>
        <TableHeader>
          <TableRow className="border-none">
            <TableHead className="w-[40-px]"></TableHead>
            <TableHead className="text-lg font-bold text-center">ID</TableHead>
            <TableHead className="text-lg font-bold text-center">Paciente</TableHead>
            <TableHead className="text-lg font-bold text-center">Olho</TableHead>
            <TableHead className="text-lg font-bold text-center">Score IA</TableHead>
            <TableHead className="text-lg font-bold text-center">Status</TableHead>
            <TableHead className="text-lg font-bold text-center">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados.map((exame) => (
            <TableRow key={exame.id}>
              <TableCell><Checkbox /></TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">{exame.id}</TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">{exame.paciente}</TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">{exame.olho}</TableCell>
              <TableCell className="text-center font-bold text-muted-foreground">
                {exame.score_ia || "--"}
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge status={exame.status} />
              </TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">{exame.data}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}