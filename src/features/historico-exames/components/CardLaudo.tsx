import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentEditable } from '@/components/ui/editor/editor-ui/content-editable';
import { editorTheme } from '@/components/ui/editor/themes/editor-theme';
import { ElementFormatToolbarPlugin } from '@/components/ui/editor/plugins/toolbar/element-format-toolbar-plugin';
import { FontFormatToolbarPlugin } from '@/components/ui/editor/plugins/toolbar/font-format-toolbar-plugin';
import { HistoryToolbarPlugin } from '@/components/ui/editor/plugins/toolbar/history-toolbar-plugin';
import { ToolbarPlugin } from '@/components/ui/editor/plugins/toolbar/toolbar-plugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { UserStar } from 'lucide-react';

interface CardLaudoProps {}

const editorInitialConfig = {
  namespace: 'card-laudo-editor',
  theme: editorTheme,
  onError(error: Error) {
    throw error;
  },
};

export function CardLaudo(_: CardLaudoProps) {
  return (
    <Card
      className={[
        'flex w-full min-w-355 rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:p-5',
      ].join(' ')}
    >
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
              Digite as considerações clínicas necessárias e avalie a acurácia
              da IA
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-col lg:items-start">
        <div className="flex flex-row gap-2 lg:flex-row">
          <p className="text-sm text-muted-foreground">Avalie o laudo da IA:</p>
          <Button variant="affirmative" size="sm" className="font-semibold">
            Correto
          </Button>
          <Button variant="destructive2" size="sm" className="font-semibold">
            Incorreto
          </Button>
        </div>

        <div className="relative flex h-30 w-325 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/70 shadow-inner">
          <LexicalComposer initialConfig={editorInitialConfig}>
            <ToolbarPlugin>
              {() => (
                <div className="flex flex-wrap items-center gap-2 border-b border-border/70 bg-muted/30 px-3 py-2">
                  <FontFormatToolbarPlugin />
                  <ElementFormatToolbarPlugin />
                  <HistoryToolbarPlugin />
                </div>
              )}
            </ToolbarPlugin>

            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  placeholder="Digite o laudo do especialista..."
                  className="min-h-32 rounded-b-2xl px-4 py-3 text-sm text-foreground"
                  placeholderClassName="px-4 py-15 text-sm text-muted-foreground"
                />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
          </LexicalComposer>
        </div>
      </div>
      <Button variant="default" size="lg" className="font-semibold max-w-50">
        Submeter laudo
      </Button>
    </Card>
  );
}
