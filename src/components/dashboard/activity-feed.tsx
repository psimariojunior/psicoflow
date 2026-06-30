"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, UserCheck, CalendarCheck, DollarSign, FileText, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "appointment" | "patient" | "payment" | "session" | "system"
  description: string
  timestamp: string
  amount?: number
}

const activityIcons = {
  appointment: CalendarCheck,
  patient: UserCheck,
  payment: DollarSign,
  session: FileText,
  system: Activity,
}

const activityColors = {
  appointment: "text-teal-500 bg-teal-100 dark:bg-teal-900/30",
  patient: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  payment: "text-violet-500 bg-violet-100 dark:bg-violet-900/30",
  session: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
  system: "text-slate-500 bg-slate-100 dark:bg-slate-900/30",
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((item) => {
              const Icon = activityIcons[item.type]
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                    activityColors[item.type]
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                  {item.amount !== undefined && (
                    <p className="text-sm font-medium text-emerald-500">
                      + R$ {item.amount.toFixed(2)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Agora"
  if (minutes < 60) return `Há ${minutes} min`
  if (hours < 24) return `Há ${hours}h`
  if (days < 7) return `Há ${days}d`
  return date.toLocaleDateString("pt-BR")
}
