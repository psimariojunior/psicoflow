"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"
import { Users, UserPlus } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

interface Patient {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  createdAt: Date
  nextAppointment?: Date
}

export function RecentPatients({ patients }: { patients: Patient[] }) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pacientes Recentes</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <EmptyState icon={UserPlus} title="Nenhum paciente cadastrado" />
        ) : (
          <div className="space-y-4">
            {patients.slice(0, 5).map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.email || patient.phone || "Sem contato"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(patient.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
