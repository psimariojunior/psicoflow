import { LucideIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick?: () => void; href?: string }
  className?: string
  gradient?: string
}

export function EmptyState({ icon: Icon, title, description, action, className, gradient }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center group", className)}>
      <div className={cn(
        "flex items-center justify-center w-16 h-16 rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
        gradient
          ? `bg-gradient-to-br ${gradient} shadow-lg`
          : "bg-muted"
      )}>
        <Icon className={cn(
          "w-7 h-7",
          gradient ? "text-white" : "text-muted-foreground"
        )} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        action.href ? (
          <Button asChild className="mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105">
            <Link href={action.href}>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ) : (
          <Button onClick={action.onClick} className="mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105">
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
