"use client"

import { useState, useEffect } from "react"
import { Loader2, Calendar, User, MapPin, ArrowRight, Shield, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"

interface Psychologist {
  id: string
  name: string
  specialty: string | null
  bio: string | null
  avatarUrl: string | null
  publicName: string | null
  publicBio: string | null
  sessionPrice: number | null
  welcomeMessage: string | null
  clinicAddress: string | null
}

function AgendarPage() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/disponibilidade/public/psicologos")
      .then((res) => res.json())
      .then((data) => {
        setPsychologists(Array.isArray(data) ? data : [])
      })
      .catch(() => toast.error("Erro ao carregar profissionais"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 items-center justify-center transition-colors">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-white/60">Carregando profissionais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Escolha seu psicólogo</h1>
          <p className="text-slate-500 dark:text-white/50 max-w-md mx-auto">Selecione o profissional para agendar sua consulta online de forma segura e rápida.</p>
        </div>

        {psychologists.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-white/40 mt-6">
            Nenhum profissional disponível no momento.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {psychologists.map((psy) => (
              <Link
                key={psy.id}
                href={`/agendar/${psy.id}`}
                className="group relative overflow-hidden bg-white dark:bg-white/[0.06] backdrop-blur-xl rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-white/10 hover:ring-blue-500/40 dark:hover:ring-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-white/[0.1] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start gap-4">
                  {psy.avatarUrl ? (
                    <Image
                      src={psy.avatarUrl}
                      alt={psy.publicName || psy.name}
                      width={72}
                      height={72}
                      className="h-18 w-18 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-white/10 shrink-0"
                    />
                  ) : (
                    <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30 flex items-center justify-center ring-2 ring-slate-200 dark:ring-white/10 shrink-0" style={{ width: 72, height: 72 }}>
                      <User className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {psy.publicName || psy.name}
                    </h2>
                    {psy.specialty && (
                      <p className="text-blue-600 dark:text-blue-400 text-sm mt-0.5">{psy.specialty}</p>
                    )}
                    {(psy.publicBio || psy.bio) && (
                      <p className="text-slate-500 dark:text-white/40 text-sm mt-2 line-clamp-2 leading-relaxed">{psy.publicBio || psy.bio}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {psy.sessionPrice && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          R$ {psy.sessionPrice.toFixed(2)}
                        </span>
                      )}
                      {psy.clinicAddress && (
                        <span className="inline-flex items-center gap-1 text-slate-400 dark:text-white/30 text-xs">
                          <MapPin className="h-3 w-3" /> {psy.clinicAddress}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 dark:text-white/20 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
                {psy.welcomeMessage && (
                  <p className="relative mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-slate-400 dark:text-blue-200/40 text-xs italic line-clamp-2">
                    &ldquo;{psy.welcomeMessage}&rdquo;
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-6 text-sm text-slate-400 dark:text-white/30">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>Dados protegidos</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>100% Online</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 ring-1 ring-blue-500/30">
              <Image src="/logo.png" alt="PsiHumanis" width={32} height={32} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-center text-xs text-slate-400 dark:text-white/20">
              PsiHumanis &mdash; Tecnologia a serviço da saúde mental
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgendarPage
