"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"
import { Loader2, Save, Clock, Plus, Trash2 } from "lucide-react"

interface Slot {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const DAY_NAMES = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

function DisponibilidadePage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/disponibilidade")
      const data = await res.json()
      if (Array.isArray(data)) {
        setSlots(data)
      }
    } catch {
      toast.error("Erro ao carregar disponibilidade")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const daysWithSlots = Array.from({ length: 7 }, (_, i) => i).map((day) => ({
    day,
    name: DAY_NAMES[day],
    daySlots: slots.filter((s) => s.dayOfWeek === day),
  }))

  const addSlot = (dayOfWeek: number) => {
    setSlots((prev) => [
      ...prev,
      { dayOfWeek, startTime: "08:00", endTime: "09:00", isActive: true },
    ])
  }

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, field: keyof Slot, value: unknown) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/disponibilidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao salvar")
      }

      toast.success("Disponibilidade salva com sucesso!")
      await fetchSlots()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar disponibilidade")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disponibilidade</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Defina os dias e horários disponíveis para atendimento
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar
        </Button>
      </div>

      <div className="grid gap-4">
        {daysWithSlots.map(({ day, name, daySlots }) => (
          <Card key={day} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">{name}</h3>
              <Button variant="outline" size="sm" onClick={() => addSlot(day)}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar horário
              </Button>
            </div>

            {daySlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum horário definido</p>
            ) : (
              <div className="space-y-2">
                {slots.map(
                  (slot, index) =>
                    slot.dayOfWeek === day && (
                      <div key={index} className="flex items-center gap-3">
                        <Switch
                          checked={slot.isActive}
                          onCheckedChange={(checked) => updateSlot(index, "isActive", checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">até</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSlot(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Disponibilidade
        </Button>
      </div>
    </div>
  )
}

export default DisponibilidadePage
