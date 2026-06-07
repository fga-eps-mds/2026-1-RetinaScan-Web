import type { JSX } from 'react';

import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable';

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
  disabled?: boolean;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
  disabled = false,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={`ContentEditable__root relative block min-h-72 overflow-auto px-4 py-2 focus:outline-none ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className ?? ''}`.trim()}
      aria-placeholder={placeholder}
      aria-disabled={disabled}
      placeholder={
        <div
          className={`text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden px-4 py-2 text-ellipsis select-none ${placeholderClassName ?? ''}`.trim()}
        >
          {placeholder}
        </div>
      }
    />
  );
}
