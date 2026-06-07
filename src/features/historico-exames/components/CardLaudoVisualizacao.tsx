import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserStar } from 'lucide-react';

import StarterKit from '@tiptap/starter-kit';
import { generateHTML } from '@tiptap/react';

type CardLaudoVisualizacaoProps = {
  especialistaNome?: string | null;
  resultadoIaValido: boolean | null;
  html?: string | null;
  texto?: string | null;
  conteudo?: string | Record<string, unknown> | null;
};

export function CardLaudoVisualizacao({
  especialistaNome,
  resultadoIaValido,
  html,
  texto,
  conteudo,
}: CardLaudoVisualizacaoProps) {
  const resultadoLabel =
    resultadoIaValido === true
      ? 'IA avaliada como correta'
      : resultadoIaValido === false
        ? 'IA avaliada como incorreta'
        : 'Avaliação da IA não informada';

  const resultadoClassName =
    resultadoIaValido === true
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
      : resultadoIaValido === false
        ? 'border-rose-300 bg-rose-50 text-rose-900'
        : 'border-border bg-muted/30 text-muted-foreground';

  const renderedHtml = useMemo(() => {
    try {
      const jsonContent =
        typeof conteudo === 'string' ? JSON.parse(conteudo) : conteudo;

      if (jsonContent) {
        return generateHTML(jsonContent, [StarterKit]);
      }
    } catch {
      // noop
    }

    if (html) return html;
    if (texto) return `<p>${texto}</p>`;

    return '<p>Laudo não disponível.</p>';
  }, [conteudo, html, texto]);

  return (
    <Card className="flex w-full flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserStar className="h-4.5 w-4.5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight text-foreground md:text-base">
              Laudo do Especialista
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {especialistaNome
                ? `Registrado por ${especialistaNome}`
                : 'Laudo registrado'}
            </p>
          </div>
        </div>

        <Badge variant="outline" className={resultadoClassName}>
          {resultadoLabel}
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 shadow-inner">
        <div
          className="
    tiptap-render text-sm text-foreground
    [&_p]:my-2
    [&_p:first-child]:mt-0
    [&_p:last-child]:mb-0
    [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6
    [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6
    [&_li]:my-1
    [&_strong]:font-semibold
    [&_em]:italic
    [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:my-3
    [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:my-3
    [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic
  "
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </Card>
  );
}
