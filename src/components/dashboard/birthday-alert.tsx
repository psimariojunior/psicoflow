"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Phone, MessageCircle } from "lucide-react"

interface Birthday {
  id: string
  name: string
  day: number
  age: number
  phone?: string | null
}

export function BirthdayAlert({ birthdays }: { birthdays: Birthday[] }) {
  if (birthdays.length === 0) return null

  const today = new Date().getDate()
  const todaysBirthdays = birthdays.filter((b) => b.day === today)
  const upcomingBirthdays = birthdays.filter((b) => b.day > today)

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-pink-50/30 to-white dark:from-slate-900 dark:via-pink-950/10 dark:to-slate-900 shadow-lg shadow-pink-500/5">
      <div className="h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/40">
            <Gift className="h-4.5 w-4.5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <p className="font-semibold">Aniversariantes</p>
            <p className="text-xs text-muted-foreground font-normal">
              {birthdays.length} {birthdays.length === 1 ? "paciente" : "pacientes"} neste mês
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todaysBirthdays.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
              Hoje!
            </p>
            {todaysBirthdays.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/30 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40 shrink-0">
                  <Gift className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground">Faz {b.age} anos hoje!</p>
                </div>
                {b.phone && (
                  <a
                    href={`https://wa.me/55${b.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors shrink-0"
                    aria-label="Enviar WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {upcomingBirthdays.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {todaysBirthdays.length > 0 ? "Próximos" : "Este mês"}
            </p>
            {upcomingBirthdays.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center gap-2 py-1.5 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-300 dark:bg-pink-600 shrink-0" />
                <span className="font-medium truncate">{b.name}</span>
                <span className="text-muted-foreground text-xs ml-auto shrink-0">
                  dia {b.day}
                </span>
              </div>
            ))}
            {upcomingBirthdays.length > 5 && (
              <p className="text-xs text-muted-foreground/60">+{upcomingBirthdays.length - 5} mais</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
