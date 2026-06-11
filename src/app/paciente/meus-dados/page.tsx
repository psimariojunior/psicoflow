"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePatientAuth } from "@/components/patient-auth-provider"
import toast from "react-hot-toast"
import { Loader2, Save } from "lucide-react"

const BRAZILIAN_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]

export default function MeusDadosPage() {
  const { patient, token } = usePatientAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", cpf: "", dateOfBirth: "", gender: "", email: "", phone: "",
    zipCode: "", address: "", neighborhood: "", city: "", state: "",
    profession: "", maritalStatus: "", emergencyContact: "", emergencyPhone: "",
  })

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch("/api/pacientes/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          cpf: data.cpf || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
          gender: data.gender || "",
          email: data.email || "",
          phone: data.phone || "",
          zipCode: data.zipCode || "",
          address: data.address || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          profession: data.profession || "",
          maritalStatus: data.maritalStatus || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || "",
        })
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [token])

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    try {
      const res = await fetch("/api/pacientes/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      toast.success("Dados atualizados com sucesso!")
    } catch {
      toast.error("Erro ao salvar dados")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Meus Dados</h1>
        <p className="text-gray-400 text-sm mt-1">Mantenha suas informações atualizadas</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900/50 rounded-2xl p-6 ring-1 ring-slate-700/50 space-y-4">
          <h2 className="text-lg font-semibold text-white">Dados Pessoais</h2>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Nome completo</Label>
            <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-gray-300">CPF</Label>
              <Input id="cpf" value={form.cpf} onChange={(e) => handleChange("cpf", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-gray-300">Data de Nascimento</Label>
              <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12 [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-gray-300">Gênero</Label>
              <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                  <SelectItem value="NaoInformar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession" className="text-gray-300">Profissão</Label>
              <Input id="profession" value={form.profession} onChange={(e) => handleChange("profession", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maritalStatus" className="text-gray-300">Estado Civil</Label>
              <Select value={form.maritalStatus} onValueChange={(v) => handleChange("maritalStatus", v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="Casado">Casado(a)</SelectItem>
                  <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="Viuvo">Viúvo(a)</SelectItem>
                  <SelectItem value="UniaoEstavel">União Estável</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 ring-1 ring-slate-700/50 space-y-4">
          <h2 className="text-lg font-semibold text-white">Contato</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">WhatsApp</Label>
              <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 ring-1 ring-slate-700/50 space-y-4">
          <h2 className="text-lg font-semibold text-white">Endereço</h2>
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="text-gray-300">CEP</Label>
            <Input id="zipCode" value={form.zipCode} onChange={(e) => handleChange("zipCode", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-300">Endereço</Label>
            <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-gray-300">Bairro</Label>
              <Input id="neighborhood" value={form.neighborhood} onChange={(e) => handleChange("neighborhood", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-300">Cidade</Label>
              <Input id="city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-gray-300">Estado</Label>
              <Select value={form.state} onValueChange={(v) => handleChange("state", v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 ring-1 ring-slate-700/50 space-y-4">
          <h2 className="text-lg font-semibold text-white">Emergência</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-gray-300">Contato de Emergência</Label>
              <Input id="emergencyContact" value={form.emergencyContact} onChange={(e) => handleChange("emergencyContact", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone" className="text-gray-300">Telefone de Emergência</Label>
              <Input id="emergencyPhone" value={form.emergencyPhone} onChange={(e) => handleChange("emergencyPhone", e.target.value)} className="bg-slate-800 border-slate-700 text-white h-12" />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl disabled:opacity-50">
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  )
}
