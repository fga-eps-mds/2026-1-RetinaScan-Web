import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'prioridade':
        return " bg-red-100 text-red-600"
      case 'normal':
        return " bg-green-100 text-green-600"
      case 'pendente':
        return " bg-slate-200 text-black"
    }
  }
  return (
    <span className={cn(
      "px-3 py-1 rounded-md text-lg whitespace-nowrap",
      getStatusStyles(status)
    )}>
      {status}
    </span>
  )
}