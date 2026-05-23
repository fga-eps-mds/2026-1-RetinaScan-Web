import { BellRing, Eye, FileText, ShieldCheck, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type NotificationType =
  | 'avaliacao_ia_atualizada'
  | 'avaliacao_ia_revisada_por_especialista'
  | 'status_solicitacao_cadastral_atualizado';

type NotificationCardProps = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
  onRemove?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
};

type NotificationVariant = {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  iconWrapperClassName: string;
  tagClassName: string;
  cardClassName: string;
  unreadCardClassName: string;
  unreadDotClassName: string;
};

const notificationVariants: Record<NotificationType, NotificationVariant> = {
  avaliacao_ia_atualizada: {
    label: 'Avaliação IA',
    icon: BellRing,
    iconClassName: 'h-5 w-5 text-blue-600 dark:text-blue-400',
    iconWrapperClassName: 'bg-blue-100 dark:bg-blue-500/15',
    tagClassName:
      'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
    cardClassName:
      'border-blue-200/70 bg-gradient-to-r from-blue-50/80 to-card dark:border-blue-500/20 dark:from-blue-500/10 dark:to-card',
    unreadCardClassName:
      'border-blue-300/80 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10',
    unreadDotClassName: 'bg-blue-500',
  },
  avaliacao_ia_revisada_por_especialista: {
    label: 'Revisão especialista',
    icon: ShieldCheck,
    iconClassName: 'h-5 w-5 text-emerald-600 dark:text-emerald-400',
    iconWrapperClassName: 'bg-emerald-100 dark:bg-emerald-500/15',
    tagClassName:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    cardClassName:
      'border-emerald-200/70 bg-gradient-to-r from-emerald-50/80 to-card dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-card',
    unreadCardClassName:
      'border-emerald-300/80 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
    unreadDotClassName: 'bg-emerald-500',
  },
  status_solicitacao_cadastral_atualizado: {
    label: 'Alteração cadastral',
    icon: FileText,
    iconClassName: 'h-5 w-5 text-amber-700 dark:text-amber-300',
    iconWrapperClassName: 'bg-amber-100 dark:bg-amber-500/15',
    tagClassName:
      'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200',
    cardClassName:
      'border-amber-200/70 bg-gradient-to-r from-amber-50/80 to-card dark:border-amber-500/20 dark:from-amber-500/10 dark:to-card',
    unreadCardClassName:
      'border-amber-300/80 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
    unreadDotClassName: 'bg-amber-500',
  },
};

const cardTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
  mass: 0.9,
};

const contentTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function NotificationCard({
  id,
  type,
  title,
  description,
  time,
  unread = false,
  onRemove,
  onMarkAsRead,
}: NotificationCardProps) {
  const variant = notificationVariants[type];
  const Icon = variant.icon;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.985, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{
        opacity: 0,
        y: -10,
        scale: 0.97,
        filter: 'blur(6px)',
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      transition={cardTransition}
      whileHover={{
        y: -2,
        scale: 1.003,
        transition: { duration: 0.16, ease: 'easeOut' },
      }}
      className={cn(
        'relative flex items-start justify-between gap-4 overflow-hidden rounded-xl border p-6 shadow-sm transition-colors',
        'will-change-transform hover:shadow-md',
        variant.cardClassName,
        unread && variant.unreadCardClassName
      )}
    >
      {unread && (
        <motion.div
          layoutId={`notification-accent-${id}`}
          className={cn(
            'absolute left-0 top-0 h-full w-1 rounded-l-xl opacity-80',
            variant.unreadDotClassName
          )}
          initial={{ opacity: 0, scaleY: 0.7 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0.7 }}
          transition={contentTransition}
        />
      )}

      <div className="flex min-w-0 items-start gap-4">
        <motion.div
          layout
          whileHover={{ rotate: -4, scale: 1.04 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
            variant.iconWrapperClassName
          )}
        >
          <Icon className={variant.iconClassName} />
        </motion.div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <motion.p layout="position" className="font-medium text-foreground">
              {title}
            </motion.p>

            <motion.span
              layout="position"
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                variant.tagClassName
              )}
            >
              {variant.label}
            </motion.span>

            {unread && (
              <motion.span
                initial={{ opacity: 0, scale: 0.92, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={contentTransition}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
              >
                Nova
              </motion.span>
            )}
          </div>

          <motion.p
            layout="position"
            className="text-sm leading-6 text-muted-foreground"
          >
            {description}
          </motion.p>

          <motion.div
            layout="position"
            className="flex flex-wrap items-center gap-2 pt-1"
          >
            {unread && onMarkAsRead && (
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.14 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => onMarkAsRead(id)}
                >
                  <motion.span
                    className="mr-1 inline-flex"
                    whileHover={{ rotate: -8, scale: 1.06 }}
                    transition={{ duration: 0.16 }}
                  >
                    <Eye className="h-4 w-4" />
                  </motion.span>
                  Marcar como lida
                </Button>
              </motion.div>
            )}

            {onRemove && (
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.14 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-sm text-muted-foreground hover:text-red-500"
                  onClick={() => onRemove(id)}
                >
                  <motion.span
                    className="mr-1 inline-flex"
                    whileHover={{ rotate: -10, scale: 1.06 }}
                    transition={{ duration: 0.16 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.span>
                  Remover
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        layout="position"
        className="flex shrink-0 flex-col items-end gap-2"
      >
        <span className="text-xs text-muted-foreground">{time}</span>

        {unread && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 20,
            }}
            className={cn(
              'mt-1 h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.18)]',
              variant.unreadDotClassName
            )}
          />
        )}
      </motion.div>
    </motion.article>
  );
}
