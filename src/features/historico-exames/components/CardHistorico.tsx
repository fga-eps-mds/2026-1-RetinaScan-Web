import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusTag";
import { cn } from "@/lib/utils";
import { Search, ListFilter } from "lucide-react"; 
import { Input } from "@/components/ui/input"; 
import { useFiltroExames } from "../hooks/useFiltroExames";

// vai puxar de dados quando tiver integrado
export function CardHistorico({ dados }) {

  const {
    filtroPrioridade,
    setFiltroPrioridade,
    busca,
    setBusca,
    dadosFiltrados,
  } = useFiltroExames(dados);

  
  return (
    <Card className="w-full border-none shadow-sm p-8 bg-white rounded-[24px]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h2 className="text-2xl font-bold text-black w-full md:w-auto">
          Histórico de Exames
        </h2>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-[240px]">
            <Input 
              placeholder="Filtrar por prioridade" 
              className="border-slate-200 text-muted-foreground h-12 rounded-xl"
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
            />
            <ListFilter className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground  pointer-events-none" />
          </div>
          
          <div className="relative w-full md:w-[320px]">
            <Input 
              placeholder="Buscar exame ou paciente..." 
              className="border-slate-200 text-muted-foreground h-12 pr-10 rounded-xl"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground  pointer-events-none" />
          </div>
        </div>
      </div>
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
          {dadosFiltrados.length > 0 ? (
            dadosFiltrados.map((exame) => (
              <TableRow 
                key={exame.id} >
                <TableCell>
                  <Checkbox 
                    className="border-[2px]"/>
                </TableCell>

                <TableCell className="text-center text-md text-muted-foreground py-9">
                  {exame.id}
                </TableCell>
                <TableCell className="text-center text-md text-muted-foreground">
                  {exame.paciente}
                </TableCell>

                <TableCell className="text-center text-md text-muted-foreground">
                  {exame.olho}
                </TableCell>

                <TableCell
                  className={cn(
                    "text-md text-center font-bold",
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

                <TableCell className="text-center text-md text-muted-foreground">
                  {exame.data}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-xl text-center text-muted-foreground py-40"
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