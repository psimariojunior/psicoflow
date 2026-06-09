"use client"

import { useEffect, useState, createContext, useContext, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export interface PatientData {
  id: string
  name: string
  email: string | null
  phone: string | null
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
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
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
      {children}
    </PatientAuthContext.Provider>
  )
}
