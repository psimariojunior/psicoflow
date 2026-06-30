"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { formatDate } from "@/lib/utils"
import { Shield, CheckCircle, XCircle, Loader2, LogIn, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

interface ConsentRecord {
  id: string
  type: string
  consent: boolean
  content: string | null
  signedAt: string | null
  createdAt: string
}

export default function ConsentimentoPage() {
  const router = useRouter()
  const { patient, token, loading: authLoading } = usePatientAuth()
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch("/api/consentimento", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setConsents(Array.isArray(data) ? data : []))
      .catch(() => setError("Erro ao carregar consentimento"))
      .finally(() => setLoading(false))
  }, [token])

  const lgpdConsent = consents.find(c => c.type === "LGPD" && c.consent === true)

  async function handleSign(accepted: boolean) {
    if (!token) return
    setSigning(true)
    try {
      const res = await fetch("/api/consentimento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "LGPD",
          consent: accepted,
          content: accepted
            ? "Aceito os termos de uso e política de privacidade"
            : "Recuso os termos de uso e política de privacidade",
        }),
      })
      if (!res.ok) throw new Error()
      const newConsent = await res.json()
      setConsents(prev => [newConsent, ...prev])
      toast.success(accepted ? "Consentimento registrado com sucesso" : "Consentimento recusado")
    } catch {
      toast.error("Erro ao registrar consentimento")
    } finally {
      setSigning(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!token || !patient) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Autenticação necessária</h2>
            <p className="text-muted-foreground mb-6">Faça login para acessar o termo de consentimento</p>
            <Button asChild><Link href="/paciente/login"><LogIn className="mr-2 h-4 w-4" />Fazer Login</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-md">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Termo de Consentimento</CardTitle>
                <p className="text-sm text-muted-foreground">LGPD — Lei Geral de Proteção de Dados</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {lgpdConsent ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-6 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
                <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Consentimento já registrado</h3>
                {lgpdConsent.signedAt && (
                  <p className="text-sm text-muted-foreground">Registrado em {formatDate(lgpdConsent.signedAt)}</p>
                )}
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                <div className="rounded-lg bg-muted/50 p-5 space-y-4 text-sm leading-relaxed">
                  <p>
                    Ao aceitar este termo, você autoriza o psicólogo responsável a coletar, armazenar e utilizar seus dados pessoais
                    para fins exclusivos do atendimento psicológico, conforme previsto na Lei nº 13.709/2018 (LGPD).
                  </p>
                  <p><strong>Dados coletados:</strong> nome, telefone, e-mail, CPF, data de nascimento, informações de saúde e
                    conteúdo das sessões, registros de diário emocional e respostas a questionários.</p>
                  <p><strong>Finalidade:</strong> prestação de serviços de psicologia, agendamento de consultas, emissão de
                    lembretes, faturamento e cumprimento de obrigações legais (CFP).</p>
                  <p><strong>Compartilhamento:</strong> seus dados não serão compartilhados com terceiros sem seu consentimento
                    explícito, exceto quando exigido por lei ou ordem judicial.</p>
                  <p><strong>Armazenamento:</strong> os dados serão mantidos pelo período mínimo exigido pelo Código de Ética
                    Profissional do Psicólogo (5 anos após o término do tratamento).</p>
                  <p><strong>Seus direitos:</strong> você pode solicitar a qualquer momento a correção, exclusão ou portabilidade
                    dos seus dados, bem como revogar este consentimento.</p>
                  <p className="text-muted-foreground text-xs pt-2">
                    Ao clicar em &ldquo;Aceitar&rdquo;, você declara que leu e compreendeu os termos acima e consente com o tratamento dos seus
                    dados pessoais para as finalidades descritas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button onClick={() => handleSign(true)} disabled={signing} className="flex-1 sm:flex-none">
                    {signing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle className="mr-2 h-4 w-4" />Aceitar
                  </Button>
                  <Button variant="outline" onClick={() => handleSign(false)} disabled={signing} className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <XCircle className="mr-2 h-4 w-4" />Recusar
                  </Button>
                </div>
              </div>
            )}

            {!lgpdConsent && consents.filter(c => c.consent === false).length > 0 && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 text-center">
                <XCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  Você recusou o termo de consentimento. Alguns serviços podem não estar disponíveis.
                </p>
              </div>
            )}

            {consents.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Histórico de consentimentos</h4>
                <div className="space-y-2">
                  {consents.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        {c.consent ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium capitalize">{c.type}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {c.signedAt ? formatDate(c.signedAt) : formatDate(c.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
