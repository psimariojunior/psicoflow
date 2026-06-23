"use client"

import { useState, useEffect } from "react"
import { Loader2, Calendar, User } from "lucide-react"
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
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white/60">Carregando profissionais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 mb-4">
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Escolha seu psicólogo</h1>
          <p className="text-white/50">Selecione o profissional para agendar sua consulta</p>
        </div>

        {psychologists.length === 0 ? (
          <p className="text-center text-white/40 mt-6">
            Nenhum profissional disponível no momento.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {psychologists.map((psy) => (
              <Link
                key={psy.id}
                href={`/agendar/${psy.id}`}
                className="group bg-white/5 backdrop-blur rounded-2xl p-6 ring-1 ring-white/10 hover:ring-blue-500/40 hover:bg-white/10 transition-all flex items-start gap-4"
              >
                {psy.avatarUrl ? (
                  <Image
                    src={psy.avatarUrl}
                    alt={psy.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center ring-2 ring-white/10 shrink-0">
                    <User className="h-8 w-8 text-blue-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                    {psy.publicName || psy.name}
                  </h2>
                  {psy.specialty && (
                    <p className="text-blue-400/80 text-sm mt-0.5">{psy.specialty}</p>
                  )}
                  {psy.sessionPrice && (
                    <p className="text-green-400 text-sm font-medium mt-1">R$ {psy.sessionPrice.toFixed(2)}</p>
                  )}
                  {(psy.publicBio || psy.bio) && (
                    <p className="text-white/40 text-sm mt-2 line-clamp-2">{psy.publicBio || psy.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 ring-1 ring-blue-500/30">
            <Image src="/logo.png" alt="PsicoFlow" width={28} height={28} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <p className="text-center text-xs text-white/20">
            PsicoFlow &mdash; Tecnologia a serviço da saúde mental
          </p>
        </div>
      </div>
    </div>
  )
}

export default AgendarPage
