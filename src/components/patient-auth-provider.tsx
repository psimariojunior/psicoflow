"use client"

import { useEffect, useState, createContext, useContext, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Loader2, BookHeart, CalendarDays, History, User } from "lucide-react"

export interface PatientData {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpf: string | null
  rg: string | null
  dateOfBirth: string | null
  gender: string | null
  maritalStatus: string | null
  profession: string | null
  company: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  healthInsurance: string | null
  insuranceNumber: string | null
  referredBy: string | null
  howFound: string | null
  observations: string | null
  photoUrl: string | null
  createdAt: string
}

interface PatientAuthContextType {
  patient: PatientData | null
  token: string | null
  login: (token: string, patient: PatientData) => void
  logout: () => void
  loading: boolean
}

const PatientAuthContext = createContext<PatientAuthContextType>({
  patient: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
})

export const usePatientAuth = () => useContext(PatientAuthContext)

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedToken = localStorage.getItem("patient_token")
    if (!storedToken) {
      setLoading(false)
      return
    }

    fetch("/api/pacientes/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        setToken(storedToken)
        setPatient(data)
      })
      .catch(() => {
        localStorage.removeItem("patient_token")
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (newToken: string, data: PatientData) => {
    localStorage.setItem("patient_token", newToken)
    setToken(newToken)
    setPatient(data)
  }

  const logout = () => {
    localStorage.removeItem("patient_token")
    setToken(null)
    setPatient(null)
    router.push("/paciente/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    )
  }

  const isPublicPage = pathname === "/paciente/login" || pathname === "/paciente/cadastro"

  if (!patient && !isPublicPage) {
    router.push("/paciente/login")
    return null
  }

  if (patient && isPublicPage) {
    router.push("/paciente/agenda")
    return null
  }

  return (
    <PatientAuthContext.Provider value={{ patient, token, login, logout, loading }}>
      <div className="min-h-screen bg-slate-950">
        {patient && (
          <header className="border-b border-slate-800 bg-slate-900">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">PsicoFlow</span>
              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1">
                <Link href="/paciente/agenda" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  pathname === "/paciente/agenda" ? "bg-emerald-500/15 text-emerald-300" : "text-gray-400 hover:text-gray-200 hover:bg-slate-800"
                }`}>
                  <CalendarDays className="h-3.5 w-3.5" />
                  Agenda
                </Link>
                <Link href="/paciente/diario" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  pathname === "/paciente/diario" ? "bg-emerald-500/15 text-emerald-300" : "text-gray-400 hover:text-gray-200 hover:bg-slate-800"
                }`}>
                  <BookHeart className="h-3.5 w-3.5" />
                  Diário
                </Link>
                <Link href="/paciente/historico" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  pathname === "/paciente/historico" ? "bg-emerald-500/15 text-emerald-300" : "text-gray-400 hover:text-gray-200 hover:bg-slate-800"
                }`}>
                  <History className="h-3.5 w-3.5" />
                  Histórico
                </Link>
                <Link href="/paciente/meus-dados" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  pathname === "/paciente/meus-dados" ? "bg-emerald-500/15 text-emerald-300" : "text-gray-400 hover:text-gray-200 hover:bg-slate-800"
                }`}>
                  <User className="h-3.5 w-3.5" />
                  Meus Dados
                </Link>
              </nav>
              <span className="text-gray-300 text-sm">{patient.name}</span>
                <button onClick={logout} className="text-xs text-gray-400 hover:text-white transition-colors">
                  Sair
                </button>
              </div>
            </div>
          </header>
        )}
        {children}
      </div>
    </PatientAuthContext.Provider>
  )
}
