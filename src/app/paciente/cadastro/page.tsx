"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"
import { maskCpf, maskPhone, maskCep } from "@/lib/utils"
import { Loader2, UserPlus, ChevronLeft, ChevronRight, Check, ArrowLeft, Sun, Moon } from "lucide-react"

const BRAZILIAN_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]

export default function CadastroPage() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [cpf, setCpf] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [address, setAddress] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = usePatientAuth()
  const { theme, setTheme } = useTheme()

  const isStep1Valid = name.trim().length > 0
  const isStep2Valid = email.trim().length > 0 && password.length >= 6 && password === confirmPassword

  function canGoNext(): boolean {
    if (step === 0) return isStep1Valid
    if (step === 1) return isStep2Valid
    return true
  }

  function nextStep() {
    if (step < 2 && canGoNext()) setStep((s) => s + 1)
  }

  function prevStep() {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStep1Valid || !isStep2Valid) return

    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          cpf: cpf.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          zipCode: zipCode.trim() || undefined,
          address: address.trim() || undefined,
          neighborhood: neighborhood.trim() || undefined,
          city: city.trim() || undefined,
          state: state || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar")

      login(data.token, data.patient)
      router.push("/paciente")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cadastrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="float-right">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                aria-label="Alternar tema"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Criar conta</h1>
            <p className="text-muted-foreground text-sm">Preencha seus dados para agendar consultas</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i ? "bg-primary text-primary-foreground" : step === i ? "bg-primary/20 text-primary ring-1 ring-primary/50" : "bg-muted text-muted-foreground"
                }`}>
                  {step > i ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-12 h-0.5 transition-all ${step > i ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 0 && (
              <div className="bg-card rounded-2xl p-6 ring-1 ring-border space-y-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Dados Pessoais</h2>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                    <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMININO">Feminino</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                        <SelectItem value="PREFIRO_NAO_INFORMAR">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-card rounded-2xl p-6 ring-1 ring-border space-y-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Contato e Acesso</h2>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-8888" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card rounded-2xl p-6 ring-1 ring-border space-y-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Endereço</h2>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(maskCep(e.target.value))} placeholder="00000-000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {step > 0 ? (
                <Button type="button" onClick={prevStep} variant="ghost" className="h-12 px-6">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>
              ) : (
                <div />
              )}
              {step < 2 ? (
                <Button type="button" onClick={nextStep} disabled={!canGoNext()} className="h-12 px-8 text-base font-semibold rounded-xl disabled:opacity-50">
                  Próximo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="h-12 px-8 text-base font-semibold rounded-xl disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5 mr-2" />}
                  {loading ? "Cadastrando..." : "Criar conta"}
                </Button>
              )}
            </div>
          </form>

          <p className="text-center mt-6">
            <Link href="/paciente/login" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Já tem conta? Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
