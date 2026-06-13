"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, formatTime } from "@/lib/utils"
import { Calendar, CalendarX } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

interface Appointment {
  id: string
  patientName: string
  startTime: Date
  status: string
  modality: string
  type?: string
}

export function UpcomingAppointments({ appointments }: { appointments: Appointment[] }) {
  const statusVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "info"
      case "CONFIRMED": return "success"
      case "IN_PROGRESS": return "warning"
      default: return "secondary"
    }
  }

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Próximas Consultas</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarX} title="Nenhuma consulta agendada" />
        ) : (
          <div className="space-y-4">
            {appointments.slice(0, 5).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(apt.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{apt.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(apt.startTime)} • {apt.modality === "online" ? "Online" : "Presencial"}
                  </p>
                </div>
                <Badge variant={statusVariant(apt.status)}>
                  {apt.status === "SCHEDULED" ? "Agendado" :
                   apt.status === "CONFIRMED" ? "Confirmado" :
                   apt.status === "IN_PROGRESS" ? "Em andamento" : apt.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
