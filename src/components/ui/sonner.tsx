import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border shadow-lg backdrop-blur-md px-4 py-3',
          title: 'font-semibold text-sm',
          description: 'text-sm opacity-90',
          success: '!bg-emerald-500 !text-white !border-emerald-600',
          error: '!bg-rose-500 !text-white !border-rose-600',
          warning: '!bg-amber-500 !text-black !border-amber-600',
          info: '!bg-sky-500 !text-white !border-sky-600',
          loading: '!bg-zinc-900 !text-white !border-zinc-700',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
