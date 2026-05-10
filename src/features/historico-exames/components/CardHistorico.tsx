import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusTag";
import { cn } from "@/lib/utils";
import { Search, ListFilter, Loader2, AlertCircle, Inbox } from "lucide-react"; 
import { Input } from "@/components/ui/input"; 
import { useFiltroExames } from "../hooks/useFiltroExames";
import type { ExameHistory } from "../types/exam-history";

interface CardHistoricoProps {
  dados: ExameHistory[];
  isLoading: boolean;
  isError: boolean;
}

export function CardHistorico({ dados, isLoading, isError }: CardHistoricoProps) {
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
              className="border-slate-200 text-muted-foreground h-12 rounded-xl pl-4 pr-10"
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
            />
            <ListFilter className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>
          
          <div className="relative w-full md:w-[320px]">
            <Input 
              placeholder="Buscar exame ou paciente..." 
              className="border-slate-200 text-muted-foreground h-12 pr-10 rounded-xl pl-4"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="text-xl">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="font-bold text-center text-black">ID</TableHead>
            <TableHead className="font-bold text-center text-black">Paciente</TableHead>
            <TableHead className="font-bold text-center text-black">Olho</TableHead>
            <TableHead className="font-bold text-center text-black">Score IA</TableHead>
            <TableHead className="font-bold text-center text-black">Status</TableHead>
            <TableHead className="font-bold text-center text-black">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* CENÁRIO 1: LOADING */}
          {isLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-40">
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="text-lg font-medium">Buscando exames...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : isError ? (
            /* CENÁRIO 2: ERROR */
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-40">
                <div className="flex flex-col items-center justify-center gap-3 text-red-500">
                  <AlertCircle className="h-10 w-10" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Não foi possível carregar os exames.</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-2 text-sm underline text-muted-foreground hover:text-black transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : dadosFiltrados.length > 0 ? (
            /* CENÁRIO 3: SUCESSO (LISTAGEM) */
            dadosFiltrados.map((exame) => (
              <TableRow key={exame.id} className="group border-slate-50">
                <TableCell>
                  <Checkbox className="border-[2px] transition-colors" />
                </TableCell>

                <TableCell className="text-center text-md text-muted-foreground py-7">
                  {exame.id}
                </TableCell>
                
                <TableCell className="text-center text-md text-muted-foreground font-medium">
                  {exame.paciente}
                </TableCell>

                <TableCell className="text-center text-md text-muted-foreground">
                  {exame.olho}
                </TableCell>

                <TableCell
                  className={cn(
                    "text-md text-center font-bold transition-colors",
                    exame.scoreIA !== null 
                      ? (exame.scoreIA > 80 ? "text-red-500" : "text-green-500")
                      : "text-muted-foreground/50"
                  )}
                >
                  {exame.scoreIA ?? "--"}
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
            /* CENÁRIO 4: EMPTY (SEM RESULTADOS) */
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-40">
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Inbox className="h-12 w-12 opacity-20" />
                  <p className="text-lg font-medium">
                    {busca || filtroPrioridade 
                      ? "Nenhum resultado encontrado para os filtros aplicados." 
                      : "Ainda não existem exames registrados no histórico."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}