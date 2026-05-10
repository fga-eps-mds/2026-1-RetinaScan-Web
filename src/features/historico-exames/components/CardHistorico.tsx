import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusTag';
import { cn } from '@/lib/utils';
import { Search, ListFilter, AlertCircle, Inbox, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HistoricoSkeleton } from './HistoricoSkeleton';
import { useFiltroExames } from '../hooks/useFiltroExames';
import type { ExameHistory } from '../types/exam-history';
import { useNavigate } from 'react-router';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CardHistoricoProps {
  dados: ExameHistory[];
  isLoading: boolean;
  isError: boolean;
}

export function CardHistorico({
  dados,
  isLoading,
  isError,
}: CardHistoricoProps) {
  const navigate = useNavigate();
  const {
    filtroPrioridade,
    setFiltroPrioridade,
    busca,
    setBusca,
    isSearchValid,
    dadosFiltrados,
  } = useFiltroExames(dados);

  const limparFiltros = () => {
    setFiltroPrioridade('');
    setBusca('');
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="mx-auto w-full max-w-6xl px-6 border-none shadow-sm p-10 bg-white rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 ">
          <h2 className="text-xl font-bold text-black w-full md:w-auto">
            Histórico de Exames
          </h2>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Input de Filtro por Prioridade */}
            <div className="relative w-full md:w-60">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mx-auto w-full">
                    <Input
                      placeholder="Filtrar por prioridade"
                      className="border-slate-200 h-12 rounded-xl pr-10 focus-visible:ring-blue-600"
                      value={filtroPrioridade}
                      onChange={(e) => setFiltroPrioridade(e.target.value)}
                      disabled={isLoading || isError}
                    />
                    <ListFilter className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white border text-muted-foreground ">
                  Filtre por: Prioridade, Normal ou Pendente
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Input de Busca com Validação Visual de ID */}
            <div className="relative w-full md:w-[320px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mx-auto w-full">
                    <Input
                      placeholder="Buscar exame..."
                      className={cn(
                        'border-slate-200 h-12 pr-10 rounded-xl transition-all focus-visible:ring-blue-600',
                        !isSearchValid &&
                          busca.length > 0 &&
                          'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500'
                      )}
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      disabled={isLoading || isError}
                    />
                    <Search className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white border text-muted-foreground ">
                  Busque por Nome ou ID (Padrão: EX-0000-0000)
                </TooltipContent>
              </Tooltip>

              {!isSearchValid && busca.length > 0 && (
                <span className="absolute -bottom-6 left-1 text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                  Formato de ID inválido
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Dados */}
        <Table>
          <TableHeader className="text-xl border-b">
            <TableRow className="border-none hover:bg-transparent h-16">
              <TableHead className="w-12.5"></TableHead>
              <TableHead className="font-bold text-center text-black">
                Paciente
              </TableHead>
              <TableHead className="font-bold text-center text-black">
                Olho
              </TableHead>
              <TableHead className="font-bold text-center text-black">
                Score IA
              </TableHead>
              <TableHead className="font-bold text-center text-black">
                Status
              </TableHead>
              <TableHead className="font-bold text-center text-black">
                Data
              </TableHead>
              <TableHead className="font-bold text-center text-black">
                ID
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Renderização Condicional de Estados (Loading, Error, Empty, Data) */}
            {isLoading ? (
              <HistoricoSkeleton />
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-40">
                  <div className="flex flex-col items-center justify-center gap-3 text-red-500">
                    <AlertCircle className="h-10 w-10" />
                    <div className="text-center">
                      <p className="text-lg font-medium">
                        Não foi possível carregar os exames.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm underline text-red-600 hover:text-red-800 transition-colors"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : dadosFiltrados.length > 0 ? (
              dadosFiltrados.map((exame) => (
                <TableRow
                  key={exame.idExame}
                  className="group cursor-pointer border-slate-50 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50"
                  tabIndex={0}
                  role="link"
                  aria-label={`Abrir resultado do exame ${exame.idExame}`}
                  onClick={() =>
                    navigate(`/exames/${encodeURIComponent(exame.idExame)}`)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/exames/${encodeURIComponent(exame.idExame)}`);
                    }
                  }}
                >
                  <TableCell>
                    <Checkbox className="border-2 transition-colors" />
                  </TableCell>

                  <TableCell className="text-center text-md text-muted-foreground font-medium">
                    {exame.nomePaciente}
                  </TableCell>
                  <TableCell className="text-center text-md text-muted-foreground">
                    {exame.olho}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-md text-center font-bold',
                      exame.scoreIA !== null
                        ? exame.scoreIA > '80'
                          ? 'text-red-500'
                          : 'text-green-500'
                        : 'text-muted-foreground/50'
                    )}
                  >
                    {exame.scoreIA ?? '--'}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={exame.status} />
                  </TableCell>
                  <TableCell className="text-center text-md text-muted-foreground">
                    {exame.data}
                  </TableCell>
                  <TableCell className="text-center text-md text-muted-foreground py-7">
                    {exame.idExame}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-40">
                  <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Inbox className="h-12 w-12 opacity-20" />
                    <div className="text-center">
                      <p className="text-lg font-medium ">
                        {busca || filtroPrioridade
                          ? 'Nenhum resultado encontrado para os filtros aplicados.'
                          : 'Ainda não existem exames registrados no histórico.'}
                      </p>
                      {(busca || filtroPrioridade) && (
                        <Button
                          variant="outline"
                          onClick={limparFiltros}
                          className="mt-4 rounded-full border-blue-600 text-white-600 hover:bg-blue-50 transition-all"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Limpar Filtros
                        </Button>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </TooltipProvider>
  );
}
