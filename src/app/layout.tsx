import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PsicoFlow - Sistema de Gestão para Psicólogos",
  description: "Sistema completo de gestão para psicólogos com agenda online, prontuários, controle financeiro e sala virtual",
  keywords: ["psicologia", "gestão", "agenda online", "prontuário", "psicólogo"],
  icons: "/favicon.svg",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
