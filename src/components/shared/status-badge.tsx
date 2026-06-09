import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" | "default" }> = {
  SCHEDULED: { label: "Agendado", variant: "info" },
  CONFIRMED: { label: "Confirmado", variant: "success" },
  IN_PROGRESS: { label: "Em Andamento", variant: "warning" },
  COMPLETED: { label: "Concluído", variant: "secondary" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  NO_SHOW: { label: "Faltou", variant: "destructive" },
  PENDING: { label: "Pendente", variant: "warning" },
  PAID: { label: "Pago", variant: "success" },
  OVERDUE: { label: "Vencido", variant: "destructive" },
  REFUNDED: { label: "Reembolsado", variant: "info" },
  INCOME: { label: "Receita", variant: "success" },
  EXPENSE: { label: "Despesa", variant: "destructive" },
  active: { label: "Ativo", variant: "success" },
  inactive: { label: "Inativo", variant: "destructive" },
  presential: { label: "Presencial", variant: "default" },
  online: { label: "Online", variant: "info" },
  SENT: { label: "Enviado", variant: "success" },
  FAILED: { label: "Falhou", variant: "destructive" },
  Conectado: { label: "Conectado", variant: "success" },
  Configurar: { label: "Configurar", variant: "warning" },
  Ativo: { label: "Ativo", variant: "success" },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusMap[status] || { label: status, variant: "default" as const }
  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  )
}
