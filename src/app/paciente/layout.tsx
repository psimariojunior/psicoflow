import { PatientAuthProvider } from "@/components/patient-auth-provider"

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  return <PatientAuthProvider>{children}</PatientAuthProvider>
}
