"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { WhatsAppWidget } from "@/components/whatsapp-widget"
import { setLocale, t, getLocale } from "@/lib/i18n"
import toast from "react-hot-toast"
import { BreadcrumbJsonLd } from "@/lib/seo"
import {
  ArrowRight, CheckCircle, Sparkles, Shield, Zap, Heart, Brain,
  Users, Globe, Calendar, MessageCircle, ChevronDown, Menu, X, Star,
  Phone, Mail, MapPin, Clock, Award, Quote, BarChart3 as BarChartIcon,
  Sun, Moon, Languages, Video, Mic, Maximize2,
} from "lucide-react"

const services = [
  { icon: Heart, title: "Terapia Individual", desc: "Atendimento psicológico individual para adultos e adolescentes, com abordagem personalizada.", color: "from-rose-500 to-pink-600", bgLight: "bg-rose-50 dark:bg-rose-950/30", textLight: "text-rose-600 dark:text-rose-400" },
  { icon: Users, title: "Terapia de Casal", desc: "Mediação para casais que buscam melhorar a comunicação e fortalecer o vínculo.", color: "from-violet-500 to-purple-600", bgLight: "bg-violet-50 dark:bg-violet-950/30", textLight: "text-violet-600 dark:text-violet-400" },
  { icon: Brain, title: "Terapia Online", desc: "Consultas por videochamada com segurança e privacidade. Atenda de onde estiver.", color: "from-blue-500 to-cyan-600", bgLight: "bg-blue-50 dark:bg-blue-950/30", textLight: "text-blue-600 dark:text-blue-400" },
  { icon: Shield, title: "Gestão de Ansiedade", desc: "Técnicas baseadas em evidências para lidar com ansiedade, estresse e burnout.", color: "from-blue-500 to-blue-700", bgLight: "bg-blue-50 dark:bg-blue-950/30", textLight: "text-blue-600 dark:text-blue-400" },
  { icon: Heart, title: "Acompanhamento Psicológico", desc: "Suporte para momentos de transição, luto e desenvolvimento pessoal.", color: "from-orange-500 to-amber-600", bgLight: "bg-orange-50 dark:bg-orange-950/30", textLight: "text-orange-600 dark:text-orange-400" },
  { icon: Globe, title: "Supervisão Clínica", desc: "Supervisão para profissionais com discussão de casos e orientação técnica.", color: "from-indigo-500 to-blue-600", bgLight: "bg-indigo-50 dark:bg-indigo-950/30", textLight: "text-indigo-600 dark:text-indigo-400" },
]

const faqItems = [
  { q: "Como funciona a terapia online?", a: "Você agenda um horário, recebe um link seguro por email, e no horário marcado basta clicar para entrar na sala virtual. Tudo criptografado." },
  { q: "Qual a duração de cada sessão?", a: "O tempo da sessão é acordado com o profissional, com duração média de 30 minutos. A frequência também é definida em conjunto." },
  { q: "O sigilo é garantido?", a: "Sim. Todas as sessões seguem o código de ética do CRP. Videochamadas criptografadas e registros seguros." },
  { q: "Preciso de encaminhamento médico?", a: "Não. Agende diretamente sem necessidade de encaminhamento." },
  { q: "Quais formas de pagamento?", a: "Aceitamos PIX, cartão de crédito, boleto e transferência bancária." },
  { q: "Posso cancelar ou reagendar?", a: "Sim, com até 24h de antecedência pelo portal do paciente." },
]

const steps = [
  { icon: Calendar, title: "Agende", en: "Book", desc: "Escolha o dia e horário ideal na agenda online. Sem burocracia.", enDesc: "Choose the ideal day and time in the online calendar. No bureaucracy." },
  { icon: Globe, title: "Conecte-se", en: "Connect", desc: "No horário marcado, entre na sala virtual segura com um clique.", enDesc: "At the scheduled time, enter the secure virtual room with one click." },
  { icon: Heart, title: "Transforme-se", en: "Transform", desc: "Participe da sessão com privacidade e dê o próximo passo no seu bem-estar.", enDesc: "Join the session with privacy and take the next step in your well-being." },
]

const navLinks = [
  { label: "Início", href: "/", en: "Home" },
  { label: "Serviços", href: "/#servicos", en: "Services" },
  { label: "Sobre", href: "/sobre", en: "About" },
  { label: "Avaliações", href: "/avaliacoes", en: "Reviews" },
  { label: "Blog", href: "/blog", en: "Blog" },
  { label: "Planos", href: "/pricing", en: "Plans" },
  { label: "Agendamento", href: "/agendar", en: "Booking" },
  { label: "FAQ", href: "/#faq", en: "FAQ" },
]

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [reviews, setReviews] = useState<{ id: string; patientName: string; rating: number; comment: string; createdAt: string }[]>([])
  const [reviewsAvg, setReviewsAvg] = useState(0)
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  )
  const locale = getLocale()

  const toggleTheme = () => {
    const html = document.documentElement
    const isDark = html.classList.contains("dark")
    html.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "light" : "dark")
    setDarkMode(!isDark)
  }

  const toggleLanguage = () => {
    const newLocale = locale === "pt" ? "en" : "pt"
    toast.success(newLocale === "en" ? "Language switched to English" : "Idioma alterado para Português", { duration: 2000 })
    setLocale(newLocale)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    fetch("/api/avaliacoes")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setReviewsAvg(data.average || 0)
        setReviewsTotal(data.total || 0)
      })
      .catch(() => {})
  }, [])

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <BreadcrumbJsonLd items={[
        { name: "Início", item: "/" },
        { name: "Serviços", item: "/#servicos" },
        { name: "FAQ", item: "/#faq" },
      ]} />
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-900/5"
          : "bg-transparent"
      )}>
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 transition-opacity duration-500",
          scrolled && "opacity-100"
        )} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105 ring-2 ring-blue-500/20">
                <Image src="/logo.png" alt="PsiHumanis" width={44} height={44} className="w-full h-full object-cover" priority />
              </div>
              <div className={cn("flex-col transition-all duration-500", scrolled ? "opacity-100 translate-x-0 flex" : "opacity-0 -translate-x-2 hidden md:flex")}>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">PsiHumanis</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 leading-none">CRP 04/52274</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={e => {
                  if (link.href.startsWith("/#")) { e.preventDefault(); const id = link.href.slice(2); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }) }
                }} className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200", pathname === link.href ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50")}>{locale === "en" ? link.en : link.label}</Link>
              ))}
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Toggle language"
              >
                <Languages className="h-4 w-4" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link href="/login"><Button variant="ghost" size="sm">{t("nav.login", locale)}</Button></Link>
              <Link href="/agendar"><Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25">{t("nav.book", locale)}</Button></Link>
            </nav>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Abrir menu">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{locale === "en" ? link.en : link.label}</Link>
              ))}
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
              <div className="flex items-center gap-2 px-4 py-2">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <Languages className="h-3.5 w-3.5" /> {locale === "pt" ? "EN" : "PT"}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  {darkMode ? "Claro" : "Escuro"}
                </button>
              </div>
              <Link href="/login" className="block px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">Psicólogo</Link>
              <Link href="/paciente/login" className="block px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400">Área do Paciente</Link>
              <Link href="/agendar" className="block mt-2"><Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white">Agende sua Consulta</Button></Link>
            </div>
          </motion.div>
        )}
      </header>

      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-blue-400/10 to-blue-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-8">
              <motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                {t("hero.badge", locale)}
              </motion.div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{t("hero.title1", locale)}</span>
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">{t("hero.title2", locale)}</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                {t("hero.subtitle", locale)}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/agendar">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 text-base h-12 px-8">
                    {t("hero.book", locale)} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/paciente/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    {t("hero.patient", locale)}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500" /><span>Sigilo Garantido</span></div>
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /><span>Online ou Presencial</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /><span>CRP Ativo</span></div>
              </div>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium pt-2">
                <Sparkles className="h-3.5 w-3.5" /> Psicólogo? Comece grátis por 14 dias
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.4 }} className="hidden lg:flex items-center justify-center relative">
              <div className="relative w-full max-w-lg">
                {/* Main Card - Realistic Video Call */}
                <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-1 shadow-2xl shadow-blue-950/30">
                  <div className="rounded-[1.4rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden min-h-[380px] relative">
                    {/* Remote video background - gradient representing psychologist video */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                    {/* Remote participant name badge - top left */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                      <span className="text-[11px] font-medium">Dr. Mario Jr.</span>
                    </div>

                    {/* Timer - top left next to name */}
                    <div className="absolute top-3 left-[140px] z-20 bg-black/40 backdrop-blur-xl text-white/70 px-2.5 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-mono">47:32</span>
                    </div>

                    {/* Room name - top right */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-xl text-white/50 px-3 py-1.5 rounded-lg border border-white/5">
                      <Video className="h-3 w-3 text-blue-400" />
                      <span className="text-[10px] font-medium">sala-abc123</span>
                    </div>

                    {/* Local video PiP - bottom right */}
                    <div className="absolute bottom-20 right-3 z-20">
                      <div className="relative w-24 h-18 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                        <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">Você</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-5 pointer-events-none" />
                        <div className="absolute bottom-0.5 left-1.5">
                          <span className="text-[8px] text-white/80 font-medium bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">Você</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-0 left-0 right-0 z-30 pb-5">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/10 shadow-2xl">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white">
                            <Mic className="h-4 w-4" />
                          </div>
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white">
                            <Video className="h-4 w-4" />
                          </div>
                          <div className="w-px h-6 bg-white/10 mx-0.5" />
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white">
                            <Maximize2 className="h-4 w-4" />
                          </div>
                          <div className="w-px h-6 bg-white/10 mx-0.5" />
                          <div className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl text-[11px] font-medium">
                            <Phone className="h-3.5 w-3.5 rotate-[135deg]" />
                            Sair
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 rounded-2xl bg-white dark:bg-slate-800 p-3 shadow-xl shadow-slate-900/10 border border-slate-200 dark:border-slate-700 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-white">Sessão concluída</p>
                      <p className="text-[9px] text-slate-500">Bem-estar garantido</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-3 rounded-2xl bg-white dark:bg-slate-800 p-3 shadow-xl shadow-slate-900/10 border border-slate-200 dark:border-slate-700" style={{ animation: "float 6s ease-in-out infinite 1s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-white">Próxima sessão</p>
                      <p className="text-[9px] text-slate-500">Amanhã às 14:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="py-12 border-y border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Profissionais", sublabel: "confiam no PsiHumanis" },
              { value: "15k+", label: "Consultas", sublabel: "realizadas na plataforma" },
              { value: "98%", label: "Satisfação", sublabel: "dos profissionais" },
              { value: "24/7", label: "Disponível", sublabel: "acesso de qualquer lugar" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{stat.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">{t("steps.badge", locale)}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t("steps.title", locale)}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t("steps.subtitle", locale)}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-blue-500/30 via-blue-500/50 to-blue-500/30 -translate-y-1/2" />
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="relative group">
                <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                  <div className="relative inline-flex mb-6">
                    <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-xl" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-md">{i + 1}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{locale === "en" ? step.en : step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{locale === "en" ? step.enDesc : step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="py-20 md:py-28 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge className="mb-4 bg-blue-500/15 text-blue-200 border border-blue-400/20">{t("saas.badge", locale)}</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{t("saas.title", locale)}</h2>
              <p className="mt-5 text-slate-300 leading-7">{t("saas.subtitle", locale)}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/pricing"><Button size="lg" className="bg-white text-slate-950 hover:bg-blue-50">{t("saas.cta", locale)} <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link href="/login"><Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">{t("saas.login", locale)}</Button></Link>
              </div>
              {/* Trust indicators */}
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>14 dias grátis</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>Sem cartão</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>Cancele quando quiser</span></div>
              </div>
            </div>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              {/* Feature Grid */}
              <div className="relative grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Calendar, title: t("saas.feature1", locale), desc: t("saas.feature1desc", locale), color: "from-blue-500 to-blue-600" },
                  { icon: Brain, title: t("saas.feature2", locale), desc: t("saas.feature2desc", locale), color: "from-violet-500 to-purple-600" },
                  { icon: Shield, title: t("saas.feature3", locale), desc: t("saas.feature3desc", locale), color: "from-emerald-500 to-teal-600" },
                  { icon: BarChartIcon, title: t("saas.feature4", locale), desc: t("saas.feature4desc", locale), color: "from-amber-500 to-orange-600" },
                ].map((item) => (
                  <Card key={item.title} className="border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur-xl group hover:bg-white/[0.1] transition-all duration-300 hover:scale-[1.02]">
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", item.color)}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} id="servicos" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">{t("services.badge", locale)}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t("services.title", locale)}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t("services.subtitle", locale)}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                <Card className="group p-6 h-full hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border-slate-200 dark:border-slate-800">
                  <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg mb-4 transition-all group-hover:scale-110 group-hover:rotate-3 duration-300", service.color)}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} id="sobre" className="py-20 md:py-28 bg-gradient-to-br from-blue-50/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">{t("about.badge", locale)}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">{t("about.title", locale)}</h2>
            <div className="w-24 h-24 rounded-full mx-auto overflow-hidden shadow-xl ring-4 ring-blue-500/20 mb-6">
              <Image src="/profile.jpg" alt="Mário Júnior" width={96} height={96} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              <strong className="text-slate-900 dark:text-white">Mário Júnior</strong> — Psicólogo clínico (CRP 04/52274), Gestalt-Terapia. 
              Criou o PsiHumanis para simplificar a gestão de consultórios e permitir que profissionais foquem no que importa: seus pacientes.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["Terapia Individual", "Terapia de Casal", "Online"].map((item) => (
                <Badge key={item} variant="secondary" className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{item}</Badge>
              ))}
            </div>
            <Link href="/sobre">
              <Button variant="outline" size="lg" className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                {t("about.cta", locale)} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {reviewsTotal > 0 && (
        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} id="avaliacoes" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">{t("reviews.badge", locale)}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t("reviews.title", locale)}</h2>
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn("h-6 w-6", i <= Math.round(reviewsAvg) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")} />
                  ))}
                </div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{reviewsAvg.toFixed(1)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">· {reviewsTotal} {reviewsTotal === 1 ? "avaliação" : "avaliações"}</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                  <Card className="p-6 h-full border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                    <Quote className="h-8 w-8 text-blue-200 dark:text-blue-900 mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4 line-clamp-4">&ldquo;{r.comment}&rdquo;</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{r.patientName}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={cn("h-3.5 w-3.5", i <= r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/avaliacoes">
                <Button variant="outline" size="lg" className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                  Ver todas as avaliações <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} id="faq" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">{t("faq.badge", locale)}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t("faq.title", locale)}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t("faq.subtitle", locale)}</p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full text-left p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 group">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.q}</span>
                    <ChevronDown className={cn("h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200", activeFaq === i && "rotate-180 text-blue-500")} />
                  </div>
                  <div className={cn("overflow-hidden transition-all duration-300", activeFaq === i ? "mt-4 max-h-40" : "max-h-0")}>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute top-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <Badge className="px-4 py-2 text-sm bg-white/10 text-white border-white/20">{t("cta.badge", locale)}</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{t("cta.title", locale)}</h2>
            <p className="text-lg text-blue-100/80 max-w-lg mx-auto">{t("cta.subtitle", locale)}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agendar"><Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/10 text-base h-12 px-8 font-semibold">Agende sua Consulta <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <Link href="/paciente/cadastro"><Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base h-12 px-8">{t("cta.patient", locale)}</Button></Link>
            </div>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors pt-2">
              <Sparkles className="h-3.5 w-3.5" /> {t("cta.psychologist", locale)}
            </Link>
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-blue-200/70">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span>100% Sigilo</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span>CRP Ativo</span></div>
              <div className="flex items-center gap-2"><Heart className="h-4 w-4" /><span>Atendimento Humanizado</span></div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20">
                  <Image src="/logo.png" alt="PsiHumanis" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">PsiHumanis</span>
                  <p className="text-[10px] text-slate-300 leading-none">CRP 04/52274</p>
                </div>
              </Link>
              <p className="text-sm text-slate-300 leading-relaxed">Sistema completo de gestão para psicólogos. Agende consultas, emita prontuários, gerencie finanças e realize atendimentos online com segurança.</p>
              <div className="flex items-center gap-3 pt-2">
                <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a href="mailto:psi_mariojunior@hotmail.com" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Mail className="h-4 w-4" />
                </a>
                <a href="tel:+5531992863861" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2.5">
                <li><Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors">Início</Link></li>
                <li><Link href="/#servicos" className="text-sm text-slate-300 hover:text-white transition-colors">Serviços</Link></li>
                <li><Link href="/pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Planos</Link></li>
                <li><Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/sobre" className="text-sm text-slate-300 hover:text-white transition-colors">Sobre</Link></li>
                <li><Link href="/#faq" className="text-sm text-slate-300 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Acesso</h4>
              <ul className="space-y-2.5">
                <li><Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Área do Psicólogo</Link></li>
                <li><Link href="/paciente/login" className="text-sm text-slate-300 hover:text-white transition-colors">Área do Paciente</Link></li>
                <li><Link href="/paciente/cadastro" className="text-sm text-slate-300 hover:text-white transition-colors">Cadastre-se</Link></li>
                <li><Link href="/agendar" className="text-sm text-slate-300 hover:text-white transition-colors">Agende Consulta</Link></li>
                <li><Link href="/avaliacoes" className="text-sm text-slate-300 hover:text-white transition-colors">Avaliações</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-slate-300"><Mail className="h-4 w-4 text-blue-400 shrink-0" />psi_mariojunior@hotmail.com</li>
                <li className="flex items-center gap-2.5 text-sm text-slate-300"><Phone className="h-4 w-4 text-blue-400 shrink-0" />(31) 99286-3861</li>
                <li className="flex items-center gap-2.5 text-sm text-slate-300"><MapPin className="h-4 w-4 text-blue-400 shrink-0" />Belo Horizonte, MG</li>
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-slate-400 mb-2">Horário de atendimento</p>
                <p className="text-sm text-white font-medium">Seg - Sex: 8h às 18h</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} PsiHumanis. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/termos" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacidade</Link>
              <span className="text-xs text-slate-600">CRP 04/52274</span>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppWidget />
    </div>
  )
}
