import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserStar,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from 'lucide-react';
import {
  EditorContent,
  useEditor,
  useEditorState,
  type JSONContent,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import '@/features/historico-exames/styles/editor-style.css';

export type LaudoValue = {
  json: JSONContent | null;
  html: string;
  texto: string;
  resultadoIaValido: boolean | null;
};

type CardLaudoProps = {
  mode?: 'create' | 'edit';
  disabled?: boolean;
  placeholder?: string;
  value?: LaudoValue;
  onChange?: (value: LaudoValue) => void;
  onSubmit?: (value: LaudoValue) => void;
};

const EMPTY_VALUE: LaudoValue = {
  json: null,
  html: '',
  texto: '',
  resultadoIaValido: null,
};

export function CardLaudo({
  mode = 'create',
  disabled = false,
  placeholder = 'Digite o laudo do especialista...',
  value,
  onChange,
  onSubmit,
}: CardLaudoProps) {
  const initialValue = useMemo(() => value ?? EMPTY_VALUE, [value]);
  const lastSyncedContentRef = useRef<string | null>(null);

  const [resultadoIaValido, setResultadoIaValido] = useState<boolean | null>(
    initialValue.resultadoIaValido
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: initialValue.json ?? initialValue.html ?? '<p></p>',
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'tiptap-content min-h-32 px-4 py-3 text-sm text-foreground focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.({
        json: editor.getJSON(),
        html: editor.getHTML(),
        texto: editor.getText(),
        resultadoIaValido,
      });
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive('bold'),
      isItalic: editor?.isActive('italic'),
      isBulletList: editor?.isActive('bulletList'),
      isOrderedList: editor?.isActive('orderedList'),
    }),
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResultadoIaValido(value?.resultadoIaValido ?? null);
  }, [value?.resultadoIaValido]);

  useEffect(() => {
    if (!editor) return;

    const incomingSerialized = value?.json
      ? JSON.stringify(value.json)
      : (value?.html ?? '<p></p>');

    if (lastSyncedContentRef.current === incomingSerialized) {
      return;
    }

    if (value?.json) {
      const current = JSON.stringify(editor.getJSON());

      if (current !== incomingSerialized) {
        editor.commands.setContent(value.json, { emitUpdate: false });
      }

      lastSyncedContentRef.current = incomingSerialized;
      return;
    }

    if (typeof value?.html === 'string') {
      const currentHtml = editor.getHTML();

      if (currentHtml !== value.html) {
        editor.commands.setContent(value.html || '<p></p>', {
          emitUpdate: false,
        });
      }

      lastSyncedContentRef.current = incomingSerialized;
    }
  }, [editor, value?.json, value?.html]);

  const getCurrentValue = (
    nextResultadoIaValido = resultadoIaValido
  ): LaudoValue => ({
    json: editor?.getJSON() ?? null,
    html: editor?.getHTML() ?? '',
    texto: editor?.getText() ?? '',
    resultadoIaValido: nextResultadoIaValido,
  });

  const handleResultadoIa = (nextValue: boolean) => {
    setResultadoIaValido(nextValue);
    onChange?.(getCurrentValue(nextValue));
  };

  const handleSubmit = () => {
    onSubmit?.(getCurrentValue());
  };

  const hasContent = Boolean(editor?.getText()?.trim());
  const isBoldActive = editorState?.isBold ?? false;
  const isItalicActive = editorState?.isItalic ?? false;
  const isBulletListActive = editorState?.isBulletList ?? false;
  const isOrderedListActive = editorState?.isOrderedList ?? false;

  const toolbarButtonClass = (active: boolean) =>
    active
      ? 'px-2 bg-primary text-primary-foreground hover:bg-primary/90'
      : 'px-2';

  const iaButtonClass = (active: boolean, variant: 'correct' | 'incorrect') => {
    const base =
      'h-11 min-w-32 rounded-lg border px-5 text-sm font-semibold transition-all duration-200';

    if (!active) {
      return `${base} border-border/70 bg-background text-foreground hover:bg-muted/50`;
    }

    if (variant === 'correct') {
      return `${base} border-emerald-700 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200 scale-[1.02] hover:bg-emerald-700`;
    }

    return `${base} border-red-700 bg-red-600 text-white shadow-md ring-2 ring-red-200 scale-[1.02] hover:bg-red-700`;
  };

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
              Digite as considerações clínicas necessárias e avalie a acurácia
              da IA
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Avalie o laudo da IA:</p>

          <div className="inline-flex w-fit flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-1.5">
            <Button
              type="button"
              variant={resultadoIaValido === true ? 'default' : 'affirmative'}
              size="sm"
              className={iaButtonClass(resultadoIaValido === true, 'correct')}
              disabled={disabled}
              aria-pressed={resultadoIaValido === true}
              onClick={() => handleResultadoIa(true)}
            >
              Correto
            </Button>

            <Button
              type="button"
              variant={resultadoIaValido === false ? 'default' : 'destructive2'}
              size="sm"
              className={iaButtonClass(
                resultadoIaValido === false,
                'incorrect'
              )}
              disabled={disabled}
              aria-pressed={resultadoIaValido === false}
              onClick={() => handleResultadoIa(false)}
            >
              Incorreto
            </Button>
          </div>
        </div>

        <div className="relative flex min-h-30 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/70 shadow-inner">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/70 bg-muted/30 px-3 py-2">
            <Button
              type="button"
              variant={isBoldActive ? 'default' : 'ghost'}
              size="sm"
              className={toolbarButtonClass(isBoldActive)}
              disabled={disabled || !editor}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={isItalicActive ? 'default' : 'ghost'}
              size="sm"
              className={toolbarButtonClass(isItalicActive)}
              disabled={disabled || !editor}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={isBulletListActive ? 'default' : 'ghost'}
              size="sm"
              className={toolbarButtonClass(isBulletListActive)}
              disabled={disabled || !editor}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={isOrderedListActive ? 'default' : 'ghost'}
              size="sm"
              className={toolbarButtonClass(isOrderedListActive)}
              disabled={disabled || !editor}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-2"
              disabled={disabled || !editor}
              onClick={() => editor?.chain().focus().undo().run()}
            >
              <Undo2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-2"
              disabled={disabled || !editor}
              onClick={() => editor?.chain().focus().redo().run()}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          <div className={disabled ? 'cursor-not-allowed opacity-60' : ''}>
            <EditorContent editor={editor} />
          </div>

          {!editor?.getText()?.trim() && (
            <div className="pointer-events-none absolute top-13 left-0 px-4 py-3 text-sm text-muted-foreground">
              {placeholder}
            </div>
          )}
        </div>
      </div>

      <Button
        variant="default"
        size="lg"
        className="mt-4 w-full max-w-50 font-semibold cursor-pointer"
        disabled={disabled || !hasContent || resultadoIaValido === null}
        onClick={handleSubmit}
      >
        {mode === 'edit' ? 'Salvar alterações' : 'Submeter laudo'}
      </Button>
    </Card>
  );
}

export default CardLaudo;
