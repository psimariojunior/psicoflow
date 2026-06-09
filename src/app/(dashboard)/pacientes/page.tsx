"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, formatDate, calculateAge } from "@/lib/utils"
import { Plus, Mail, Phone, MoreHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

interface Patient {
  id: string
  name: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  active: boolean
  createdAt: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/pacientes")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => setPatients(data.patients || []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "name",
      header: "Paciente",
      cell: ({ row }) => (
        <Link href={`/pacientes/${row.original.id}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {calculateAge(row.original.dateOfBirth)} anos • {row.original.gender || ""}
            </p>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: "Contato",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.email || "-"}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.phone || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Paciente desde",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      cell: () => (
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e informações
          </p>
        </div>
        <Button asChild>
          <Link href="/pacientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        searchKey="name"
        searchPlaceholder="Buscar paciente..."
      />
    </div>
  )
}
