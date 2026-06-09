"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function EditPatientPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    profession: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    healthInsurance: "",
    insuranceNumber: "",
    referredBy: "",
    observations: "",
    privacyConsent: false,
    active: true,
  })

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    fetch(`/api/pacientes/${params.id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          cpf: data.cpf || "",
          rg: data.rg || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
          gender: data.gender || "",
          maritalStatus: data.maritalStatus || "",
          profession: data.profession || "",
          address: data.address || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || "",
          healthInsurance: data.healthInsurance || "",
          insuranceNumber: data.insuranceNumber || "",
          referredBy: data.referredBy || "",
          observations: data.observations || "",
          privacyConsent: data.privacyConsent || false,
          active: data.active !== false,
        })
      })
      .catch(() => toast.error("Erro ao carregar dados do paciente"))
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/pacientes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Erro ao salvar")

      toast.success("Paciente atualizado com sucesso!")
      router.push(`/pacientes/${params.id}`)
    } catch {
      toast.error("Erro ao atualizar paciente")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pacientes/${params.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar Paciente</h2>
          <p className="text-muted-foreground">Atualize as informações do paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="contact">Contato & Endereço</TabsTrigger>
            <TabsTrigger value="additional">Informações Adicionais</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={formData.cpf} onChange={(e) => handleChange("cpf", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" value={formData.rg} onChange={(e) => handleChange("rg", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      <SelectItem value="NaoInformar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado Civil</Label>
                  <Select value={formData.maritalStatus} onValueChange={(v) => handleChange("maritalStatus", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="Viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="UniaoEstavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Profissão</Label>
                  <Input value={formData.profession} onChange={(e) => handleChange("profession", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader><CardTitle>Contato & Endereço</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={formData.neighborhood} onChange={(e) => handleChange("neighborhood", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.state} onValueChange={(v) => handleChange("state", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={formData.zipCode} onChange={(e) => handleChange("zipCode", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card>
              <CardHeader><CardTitle>Informações Adicionais</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contato de Emergência</Label>
                  <Input value={formData.emergencyContact} onChange={(e) => handleChange("emergencyContact", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone de Emergência</Label>
                  <Input value={formData.emergencyPhone} onChange={(e) => handleChange("emergencyPhone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Convênio</Label>
                  <Input value={formData.healthInsurance} onChange={(e) => handleChange("healthInsurance", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nº Carteirinha</Label>
                  <Input value={formData.insuranceNumber} onChange={(e) => handleChange("insuranceNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Indicado por</Label>
                  <Input value={formData.referredBy} onChange={(e) => handleChange("referredBy", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Observações</Label>
                  <Textarea value={formData.observations} onChange={(e) => handleChange("observations", e.target.value)} rows={3} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader><CardTitle>Privacidade e Situação</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Switch checked={formData.privacyConsent} onCheckedChange={(v) => handleChange("privacyConsent", v)} />
                    <div>
                      <p className="text-sm font-medium">Consentimento LGPD</p>
                      <p className="text-xs text-muted-foreground mt-1">Autorizo o armazenamento e tratamento dos dados pessoais para fins de atendimento psicológico.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Switch checked={formData.active} onCheckedChange={(v) => handleChange("active", v)} />
                    <div>
                      <p className="text-sm font-medium">Paciente Ativo</p>
                      <p className="text-xs text-muted-foreground mt-1">Desative para arquivar o paciente sem removê-lo do sistema.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" asChild>
            <Link href={`/pacientes/${params.id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
