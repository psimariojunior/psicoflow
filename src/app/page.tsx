"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { WhatsAppWidget } from "@/components/whatsapp-widget"
import {
  ArrowRight, CheckCircle, Sparkles, Shield, Zap, Heart, Brain,
  Users, Globe,
  Menu, X, Calendar, MessageCircle, ChevronDown
} from "lucide-react"

const services = [
  {
    icon: Heart,
    title: "Terapia Individual",
    desc: "Atendimento psicológico individual para adultos e adolescentes, com abordagem personalizada.",
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50 dark:bg-rose-950/30",
    textLight: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Users,
    title: "Terapia de Casal",
    desc: "Mediação para casais que buscam melhorar a comunicação e fortalecer o vínculo.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50 dark:bg-violet-950/30",
    textLight: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Brain,
    title: "Terapia Online",
    desc: "Consultas por videochamada com segurança e privacidade. Atenda de onde estiver.",
    color: "from-blue-500 to-cyan-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    textLight: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Shield,
    title: "Gestão de Ansiedade",
    desc: "Técnicas baseadas em evidências para lidar com ansiedade, estresse e burnout.",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    textLight: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Heart,
    title: "Acompanhamento Psicológico",
    desc: "Suporte para momentos de transição, luto e desenvolvimento pessoal.",
    color: "from-orange-500 to-amber-600",
    bgLight: "bg-orange-50 dark:bg-orange-950/30",
    textLight: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Globe,
    title: "Supervisão Clínica",
    desc: "Supervisão para profissionais com discussão de casos e orientação técnica.",
    color: "from-indigo-500 to-blue-600",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30",
    textLight: "text-indigo-600 dark:text-indigo-400",
  },
]

const faqItems = [
  { q: "Como funciona a terapia online?", a: "Você agenda um horário, recebe um link seguro por email, e no horário marcado basta clicar para entrar na sala virtual. Tudo criptografado." },
  { q: "Qual a duração de cada sessão?", a: "As sessões têm duração de 30 minutos. A frequência é combinada entre psicólogo e paciente." },
  { q: "O sigilo é garantido?", a: "Sim. Todas as sessões seguem o código de ética do CRP. Videochamadas criptografadas e registros seguros." },
  { q: "Preciso de encaminhamento médico?", a: "Não. Agende diretamente sem necessidade de encaminhamento." },
  { q: "Quais formas de pagamento?", a: "Aceitamos PIX, cartão de crédito, boleto e transferência bancária." },
  { q: "Posso cancelar ou reagendar?", a: "Sim, com até 24h de antecedência pelo portal do paciente." },
]

const steps = [
  { icon: Calendar, title: "Agende", desc: "Escolha o dia e horário ideal na agenda online. Sem burocracia." },
  { icon: Globe, title: "Conecte-se", desc: "No horário marcado, entre na sala virtual segura com um clique." },
  { icon: Heart, title: "Transforme-se", desc: "Participe da sessão com privacidade e dê o próximo passo no seu bem-estar." },
]

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Agendamento", href: "/agendar" },
  { label: "FAQ", href: "/#faq" },
]

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault()
      const id = href.slice(2)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-900/5"
          : "bg-transparent"
      )}>
        {/* Gradient line at bottom */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-0 transition-opacity duration-500",
          scrolled && "opacity-100"
        )} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all duration-300 group-hover:scale-105">
                <Image src="/logo.png" alt="PsicoFlow" width={64} height={64} className="w-full h-full object-cover" priority />
              </div>
              <div className={cn(
                "flex flex-col transition-all duration-500",
                scrolled ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 hidden md:flex"
              )}>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  PsicoFlow
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 leading-none">CRP 04/52274</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={e => handleNavClick(e, link.href)}
                  className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname === link.href
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all duration-200" aria-label="WhatsApp">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://instagram.com/psi_marioalmeida" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all duration-200" aria-label="Instagram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44 0 .796.645 1.44 1.441 1.44s1.44-.645 1.44-1.44c0-.796-.645-1.44-1.44-1.44z"/></svg>
              </a>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <Link href="/login"><Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">Psicólogo</Button></Link>
              <Link href="/paciente/login">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Área do Paciente
                </Button>
              </Link>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Abrir menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={e => handleNavClick(e, link.href)}
                  className="block px-4 py-2.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                  {link.label}
                </Link>
              ))}
              <hr className="my-3 border-slate-200 dark:border-slate-800" />
              <div className="flex items-center gap-2 px-2 mb-3">
                <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="WhatsApp">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://instagram.com/psi_marioalmeida" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Instagram">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44 0 .796.645 1.44 1.441 1.44s1.44-.645 1.44-1.44c0-.796-.645-1.44-1.44-1.44z"/></svg>
                </a>
              </div>
              <Link href="/login" className="block px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">Psicólogo</Link>
              <Link href="/paciente/login" className="block px-4 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">Área do Paciente</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/80 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/30 via-transparent to-transparent dark:from-emerald-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent dark:from-blue-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <motion.div
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Atendimento psicológico online e presencial
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Cuide da sua mente</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">transforme sua vida</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Psicoterapia com abordagem humanizada. Atendimento individual, de casal e online com profissional qualificado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/agendar">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 text-base h-12 px-8">
                    Agende sua Consulta <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/paciente/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    Área do Paciente
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /><span>Sigilo Garantido</span></div>
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-emerald-500" /><span>Online ou Presencial</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span>CRP Ativo</span></div>
              </div>
            </motion.div>
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-[4/5] rounded-3xl bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
                      <Heart className="h-10 w-10 text-white" />
                    </div>
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-emerald-500/30 mb-6">
                      <Image src="/profile.jpg" alt="Mário Júnior" width={112} height={112} className="w-full h-full object-cover" priority />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Mário Júnior</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">Psicólogo Clínico</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">CRP 04/52274</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {["Gestalt-Terapia", "Neuropsicologia", "Online"].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-center gap-3">
                      {["Terapia Individual", "Casal", "Online"].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-200/30 dark:bg-emerald-800/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-200/30 dark:bg-blue-800/20 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">Como Funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Sua jornada em <span className="text-emerald-500">3 passos</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Simples, rápido e seguro. Comece hoje mesmo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative group"
              >
                <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300">
                  <div className="relative inline-flex mb-6">
                    <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-xl" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow-md">{i + 1}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-slate-300 dark:text-slate-700"><ArrowRight className="h-6 w-6" /></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Serviços */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        id="servicos"
        className="py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400">Serviços</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Atendimento <span className="text-violet-500">especializado</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Diversas modalidades para cuidar de você.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="group p-6 border border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300", service.bgLight, service.textLight)}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Sobre */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        id="sobre"
        className="py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative w-full aspect-[3/4] rounded-3xl bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-emerald-500/30 mb-6">
                      <Image src="/profile.jpg" alt="Mário Júnior" width={112} height={112} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">Mário Júnior</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">Psicólogo Clínico</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">CRP 04/52274</p>
                    <Separator className="my-4 max-w-[120px] mx-auto" />
                    <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <p>Gestalt-Terapia</p>
                      <p>Pós-graduação em Neuropsicologia</p>
                      <p>Abordagem Centrada na Pessoa</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-3xl blur-2xl" />
            </div>
            <div className="space-y-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">Sobre</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Conheça o profissional</h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>Sou Mário Júnior, psicólogo clínico (CRP 04/52274), formado em Psicologia com pós-graduação em Neuropsicologia. Minha abordagem é a Gestalt-Terapia, centrada na pessoa e na relação, com foco no aqui e agora.</p>
                <p>Acredito em um atendimento humanizado e acolhedor, onde cada pessoa encontra um espaço seguro para se conhecer melhor, superar desafios e desenvolver todo o seu potencial.</p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {["Terapia Individual", "Terapia de Casal", "Online", "Presencial"].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> {item}
                  </div>
                ))}
              </div>
              <Link href="/agendar">
                <Button className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
                  Agende sua Consulta <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        id="faq"
        className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Perguntas <span className="text-sky-500">frequentes</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Tire suas dúvidas sobre o processo terapêutico.</p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200"
              >
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white pr-4">{item.q}</span>
                  <ChevronDown className={cn("h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-200", activeFaq === i && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Final */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent" />
        {/* Floating decorative orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-teal-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-8"
            >
              <Heart className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Pronto para começar sua jornada?</h2>
            <p className="text-lg md:text-xl text-emerald-100/80 mb-10 max-w-lg mx-auto">Dê o primeiro passo em direção ao seu bem-estar emocional.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/agendar">
                <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl shadow-black/10 text-base h-12 px-8 group">
                  <Calendar className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Agendar Consulta
                </Button>
              </Link>
              <Link href="/paciente/cadastro">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 text-base h-12 px-8 group">
                  <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/30">
                  <Image src="/logo.png" alt="PsicoFlow" width={56} height={56} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white block">PsicoFlow</span>
                  <span className="text-xs text-emerald-400/70">CRP 04/52274</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Sistema completo de gestão para psicólogos. Agende consultas, emita prontuários, gerencie financeiro e realize atendimentos online com segurança.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/25" aria-label="WhatsApp">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://instagram.com/psi_marioalmeida" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-gradient-to-br hover:from-pink-500 hover:via-purple-500 hover:to-yellow-500 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44 0 .796.645 1.44 1.441 1.44s1.44-.645 1.44-1.44c0-.796-.645-1.44-1.44-1.44z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Início</Link></li>
                <li><Link href="/agendar" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Agendar Consulta</Link></li>
                <li><Link href="/termos" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Política de Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Acesso</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Área do Psicólogo</Link></li>
                <li><Link href="/paciente/login" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Área do Paciente</Link></li>
                <li><Link href="/paciente/cadastro" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Cadastro</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} PsicoFlow. Todos os direitos reservados.</p>
            <p className="text-sm text-slate-500">CRP 04/52274 • Psicólogo Responsável</p>
          </div>
        </div>
      </footer>

      <WhatsAppWidget />
    </div>
  )
}
