"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Plus, FileText, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

interface MedicalRecordItem {
  id: string
  patientName: string
  type: string
  title: string
  createdAt: string
  isConfidential: boolean
}

const typeLabels: Record<string, string> = {
  SESSION_NOTE: "Nota de Sessão",
  ANAMNESIS: "Anamnese",
  EVOLUTION: "Evolução",
  DISCHARGE_SUMMARY: "Resumo de Alta",
  REPORT: "Relatório",
  THERAPEUTIC_PLAN: "Plano Terapêutico",
  EXAM_RESULT: "Resultado de Exame",
  CONTRACT: "Contrato",
  OTHER: "Outro",
}

export default function ProntuariosPage() {
  const [records, setRecords] = useState<MedicalRecordItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/records")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        const mapped = (data || []).map((r: { id: string; patient: { name: string }; type: string; title: string; createdAt: string; isConfidential: boolean }) => ({
          id: r.id,
          patientName: r.patient?.name || "Paciente",
          type: r.type,
          title: r.title,
          createdAt: r.createdAt,
          isConfidential: r.isConfidential,
        }))
        setRecords(mapped)
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnDef<MedicalRecordItem>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <Link href={`/prontuarios/${row.original.id}`} className="flex items-center gap-2 hover:underline">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.original.title}</span>
          {row.original.isConfidential && (
            <Lock className="h-3 w-3 text-amber-500" />
          )}
        </Link>
      ),
    },
    { accessorKey: "patientName", header: "Paciente" },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="secondary">{typeLabels[row.original.type] || row.original.type}</Badge>,
    },
    { accessorKey: "createdAt", header: "Data", cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      accessorKey: "isConfidential",
      header: "Confidencial",
      cell: ({ row }) => row.original.isConfidential ? <Badge variant="warning">Sim</Badge> : <Badge variant="secondary">Não</Badge>,
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
          <h2 className="text-2xl font-bold tracking-tight">Prontuários</h2>
          <p className="text-muted-foreground">
            Registros clínicos e documentação dos pacientes
          </p>
        </div>
        <Button asChild>
          <Link href="/prontuarios/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Prontuário
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={records} searchKey="patientName" searchPlaceholder="Buscar por paciente..." />
    </div>
  )
}
