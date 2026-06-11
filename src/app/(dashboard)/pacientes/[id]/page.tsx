"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getInitials, formatDate, calculateAge, formatCurrency } from "@/lib/utils"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, DollarSign, Loader2, Pencil, Lock, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [financials, setFinancials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [patRes, transRes] = await Promise.all([
          fetch(`/api/pacientes/${params.id}`),
          fetch(`/api/financeiro`),
        ])
        if (patRes.ok) {
          const pat = await patRes.json()
          setPatient(pat)
        }
        if (transRes.ok) {
          const data = await transRes.json()
          setFinancials((data.transactions || []).filter((t: any) => t.patientId === params.id))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!patient) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Paciente não encontrado</h2>
          <Button asChild><Link href="/pacientes">Voltar</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pacientes"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary">{getInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <Badge variant={patient.active ? "success" : "secondary"}>
                  {patient.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} anos` : "-"} {patient.gender ? `• ${patient.gender}` : ""}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/pacientes/${params.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Editar</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {patient.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{patient.email}</span></div>}
              {patient.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{patient.phone}</span></div>}
              {patient.city && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{patient.city}{patient.state ? `/${patient.state}` : ""}</span></div>}
              {patient.dateOfBirth && <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{formatDate(patient.dateOfBirth)}</span></div>}
            </div>
            <Separator />
            {patient.cpf && <div><p className="text-sm font-medium">CPF</p><p className="text-sm text-muted-foreground">{patient.cpf}</p></div>}
            {patient.profession && <div><p className="text-sm font-medium">Profissão</p><p className="text-sm text-muted-foreground">{patient.profession}</p></div>}
            {patient.observations && <><Separator /><div><p className="text-sm font-medium">Observações</p><p className="text-sm text-muted-foreground">{patient.observations}</p></div></>}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="financial">
            <TabsList>
              <TabsTrigger value="financial"><DollarSign className="mr-2 h-4 w-4" />Financeiro</TabsTrigger>
              <TabsTrigger value="records"><FileText className="mr-2 h-4 w-4" />Prontuários</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="space-y-4">
              {financials.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground"><DollarSign className="mx-auto h-8 w-8 mb-2" /><p>Nenhuma transação financeira</p></CardContent></Card>
              ) : financials.map((fin: any) => (
                <Card key={fin.id} className="card-hover">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{fin.description}</p>
                      <p className="text-sm text-muted-foreground">{fin.dueDate ? formatDate(fin.dueDate) : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(fin.amount)}</p>
                      <Badge variant={fin.paymentStatus === "PAID" ? "success" : "warning"}>
                        {fin.paymentStatus === "PAID" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              {(!patient.medicalRecords || patient.medicalRecords.length === 0) ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <FileText className="mx-auto h-8 w-8 mb-2" />
                    <p>Nenhum prontuário encontrado</p>
                    <p className="text-xs mt-1">Prontuários são criados automaticamente ao encerrar uma sessão</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href={`/prontuarios/novo?paciente=${params.id}`}>Criar Prontuário</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                patient.medicalRecords.map((rec: any) => (
                  <Link key={rec.id} href={`/prontuarios/${rec.id}`}>
                    <Card className="card-hover">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{rec.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(rec.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {rec.isConfidential && <Lock className="h-4 w-4 text-amber-500" />}
                          <Badge variant="secondary">{
                            rec.type === "SESSION_NOTE" ? "Nota de Sessão" :
                            rec.type === "ANAMNESIS" ? "Anamnese" :
                            rec.type === "EVOLUTION" ? "Evolução" :
                            rec.type === "DISCHARGE_SUMMARY" ? "Resumo de Alta" :
                            rec.type === "REPORT" ? "Relatório" : rec.type
                          }</Badge>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
