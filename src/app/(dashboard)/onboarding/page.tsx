"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import {
  User, Clock, Eye, Users, CheckCircle, ArrowRight, ArrowLeft,
  Camera, Save, Loader2, Calendar, Video, Sparkles, PartyPopper
} from "lucide-react"
import toast from "react-hot-toast"

const steps = [
  { id: "welcome", title: "Bem-vindo ao PsiHumanis", icon: Sparkles },
  { id: "profile", title: "Seu Perfil", icon: User },
  { id: "availability", title: "Horários de Atendimento", icon: Clock },
  { id: "public", title: "Perfil Público", icon: Eye },
  { id: "done", title: "Tudo Pronto!", icon: PartyPopper },
]

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    crp: "",
    specialty: "",
    bio: "",
    avatarUrl: "",
    publicName: "",
    publicBio: "",
    sessionPrice: "",
    welcomeMessage: "",
    clinicAddress: "",
  })
  const [availability, setAvailability] = useState<Record<number, { active: boolean; start: string; end: string }>>({
    0: { active: false, start: "08:00", end: "18:00" },
    1: { active: true, start: "08:00", end: "18:00" },
    2: { active: true, start: "08:00", end: "18:00" },
    3: { active: true, start: "08:00", end: "18:00" },
    4: { active: true, start: "08:00", end: "18:00" },
    5: { active: true, start: "08:00", end: "18:00" },
    6: { active: false, start: "08:00", end: "18:00" },
  })

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setProfile({
          name: data.name || "",
          email: data.email || "",
          crp: data.crp || "",
          specialty: data.specialty || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
          publicName: data.publicName || "",
          publicBio: data.publicBio || "",
          sessionPrice: data.sessionPrice?.toString() || "",
          welcomeMessage: data.welcomeMessage || "",
          clinicAddress: data.clinicAddress || "",
        })
      })
      .catch(() => {})
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          sessionPrice: profile.sessionPrice ? Number(profile.sessionPrice) : null,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Perfil salvo!")
    } catch {
      toast.error("Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAvailability = async () => {
    setSaving(true)
    try {
      const slots = Object.entries(availability)
        .filter(([, v]) => v.active)
        .flatMap(([day, v]) => {
          const dayNum = Number(day)
          const [startH, startM] = v.start.split(":").map(Number)
          const [endH, endM] = v.end.split(":").map(Number)
          const slotsList = []
          let h = startH, m = startM
          while (h < endH || (h === endH && m < endM)) {
            const start = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
            const endMTotal = h * 60 + m + 50
            const endH2 = Math.floor(endMTotal / 60)
            const endM2 = endMTotal % 60
            if (endH2 > endH || (endH2 === endH && endM2 > endM)) break
            const end = `${String(endH2).padStart(2, "0")}:${String(endM2).padStart(2, "0")}`
            slotsList.push({ dayOfWeek: dayNum, startTime: start, endTime: end })
            m += 60
            if (m >= 60) { h += 1; m -= 60 }
          }
          return slotsList
        })

      const res = await fetch("/api/disponibilidade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      })
      if (!res.ok) throw new Error()
      toast.success("Horários salvos!")
    } catch {
      toast.error("Erro ao salvar horários")
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    await handleSaveProfile()
    await handleSaveAvailability()
    toast.success("Configuração concluída!")
    router.push("/dashboard")
  }

  const goNext = async () => {
    if (currentStep === 1) await handleSaveProfile()
    if (currentStep === 2) await handleSaveAvailability()
    setCurrentStep(Math.min(currentStep + 1, steps.length - 1))
  }

  const goPrev = () => setCurrentStep(Math.max(currentStep - 1, 0))
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/20 to-background dark:via-blue-950/10">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl font-bold">Configuração Inicial</h1>
          <p className="text-sm text-muted-foreground">Vamos personalizar sua conta em poucos passos</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < currentStep ? "bg-emerald-500 text-white" :
                  i === currentStep ? "bg-blue-500 text-white ring-4 ring-blue-500/20" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i < currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${i === currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-8 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Bem-vindo ao PsiHumanis!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Vamos configurar sua conta para que você possa começar a atender seus pacientes o mais rápido possível.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Calendar, title: "Agenda Online", desc: "Pacientes agendam consultas 24h" },
                    { icon: Video, title: "Sala Virtual", desc: "Videochamadas seguras integradas" },
                    { icon: Users, title: "Prontuários", desc: "Registros clínicos digitais" },
                    { icon: Clock, title: "Lembretes", desc: "Automáticos por WhatsApp e email" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl border">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={goNext} className="w-full" size="lg">
                  Vamos Começar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" /> Seu Perfil Profissional
                </CardTitle>
                <CardDescription>Complete suas informações para parecer profissional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Foto de perfil</p>
                    <p className="text-xs text-muted-foreground">Adicione uma foto nas Configurações depois</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CRP</Label>
                    <Input value={profile.crp} onChange={(e) => setProfile({ ...profile, crp: e.target.value })} placeholder="04/00000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input value={profile.specialty} onChange={(e) => setProfile({ ...profile, specialty: e.target.value })} placeholder="Ex: Terapia Cognitivo-Comportamental" />
                </div>

                <div className="space-y-2">
                  <Label>Biografia</Label>
                  <Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Conte um pouco sobre sua experiência..." />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Availability */}
          {currentStep === 2 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" /> Horários de Atendimento
                </CardTitle>
                <CardDescription>Configure seus dias e horários disponíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {weekdays.map((day, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border">
                    <Checkbox
                      checked={availability[i]?.active}
                      onCheckedChange={(v) => setAvailability({
                        ...availability,
                        [i]: { ...availability[i], active: v === true },
                      })}
                    />
                    <span className={`w-8 text-sm font-medium ${availability[i]?.active ? "text-foreground" : "text-muted-foreground"}`}>
                      {day}
                    </span>
                    {availability[i]?.active ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <Input
                          type="time"
                          value={availability[i].start}
                          onChange={(e) => setAvailability({
                            ...availability,
                            [i]: { ...availability[i], start: e.target.value },
                          })}
                          className="w-[130px]"
                        />
                        <span className="text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={availability[i].end}
                          onChange={(e) => setAvailability({
                            ...availability,
                            [i]: { ...availability[i], end: e.target.value },
                          })}
                          className="w-[130px]"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground ml-auto">Indisponível</span>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Você pode ajustar esses horários depois em Configurações {">"} Agenda.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Public Profile */}
          {currentStep === 3 && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" /> Perfil Público
                </CardTitle>
                <CardDescription>Configure o que os pacientes veem ao agendar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome de exibição</Label>
                    <Input placeholder="Como os pacientes te veem" value={profile.publicName} onChange={(e) => setProfile({ ...profile, publicName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor da sessão (R$)</Label>
                    <Input type="number" min="0" placeholder="Ex: 150" value={profile.sessionPrice} onChange={(e) => setProfile({ ...profile, sessionPrice: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem de boas-vindas</Label>
                  <Textarea rows={2} placeholder="Mensagem que aparece ao agendar" value={profile.welcomeMessage} onChange={(e) => setProfile({ ...profile, welcomeMessage: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Biografia pública</Label>
                  <Textarea rows={3} placeholder="Descrição que aparece no card de agendamento" value={profile.publicBio} onChange={(e) => setProfile({ ...profile, publicBio: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Endereço / Local</Label>
                  <Input placeholder="Ex: Rua Exemplo, 123 - Belo Horizonte/MG" value={profile.clinicAddress} onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Done */}
          {currentStep === 4 && (
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-8 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <PartyPopper className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Tudo Pronto!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Sua conta está configurada. Agora você pode explorar o PsiHumanis e começar a atender seus pacientes.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: User, text: "Perfil profissional configurado" },
                    { icon: Clock, text: "Horários de atendimento definidos" },
                    { icon: Eye, text: "Perfil público personalizado" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Próximos passos sugeridos:</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" size="sm" onClick={() => router.push("/pacientes")}>
                      <Users className="mr-2 h-4 w-4" /> Cadastrar primeiro paciente
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push("/sala-virtual")}>
                      <Video className="mr-2 h-4 w-4" /> Testar videochamada
                    </Button>
                  </div>
                </div>

                <Button onClick={handleFinish} className="w-full" size="lg" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Ir para o Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={goPrev}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <Button onClick={goNext} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
