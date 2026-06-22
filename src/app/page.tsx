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
import {
  ArrowRight, CheckCircle, Sparkles, Shield, Zap, Heart, Brain,
  Users, Globe, Calendar, MessageCircle, ChevronDown, Menu, X, Star,
  Phone, Mail, MapPin, Clock, Award, Quote,
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
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
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
                <Image src="/logo.png" alt="PsicoFlow" width={44} height={44} className="w-full h-full object-cover" priority />
              </div>
              <div className={cn("flex-col transition-all duration-500", scrolled ? "opacity-100 translate-x-0 flex" : "opacity-0 -translate-x-2 hidden md:flex")}>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">PsicoFlow</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 leading-none">CRP 04/52274</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={e => {
                  if (link.href.startsWith("/#")) { e.preventDefault(); const id = link.href.slice(2); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }) }
                }} className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200", pathname === link.href ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50")}>{link.label}</Link>
              ))}
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
              <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
              <Link href="/agendar"><Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25">Agende sua Consulta</Button></Link>
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
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{link.label}</Link>
              ))}
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
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
                Atendimento psicológico online e presencial
              </motion.div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Cuide da sua mente,</span>
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">transforme sua vida</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Psicoterapia com abordagem humanizada. Atendimento individual, de casal e online com profissional qualificado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/agendar">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 text-base h-12 px-8">
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
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500" /><span>Sigilo Garantido</span></div>
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /><span>Online ou Presencial</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /><span>CRP Ativo</span></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.4 }} className="hidden lg:flex items-center justify-center relative">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-3xl blur-2xl" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-1">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
                      <Heart className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bem-estar emocional</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center text-sm">Sua jornada de autoconhecimento começa aqui</p>
                    <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">Passo {i}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">Como Funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Sua jornada em <span className="text-blue-500">3 passos</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Simples, rápido e seguro. Comece hoje.</p>
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
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} id="servicos" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">Serviços</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Cuidado <span className="text-blue-500">especializado</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Diversas modalidades para cuidar de você.</p>
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
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">Sobre</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Conheça o <span className="text-blue-500">fundador</span></h2>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-xl mb-6">MJ</div>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              <strong className="text-slate-900 dark:text-white">Mário Júnior</strong> — Psicólogo clínico (CRP 04/52274), Gestalt-Terapia. 
              Criou o PsicoFlow para simplificar a gestão de consultórios e permitir que profissionais foquem no que importa: seus pacientes.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["Terapia Individual", "Terapia de Casal", "Online"].map((item) => (
                <Badge key={item} variant="secondary" className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{item}</Badge>
              ))}
            </div>
            <Link href="/sobre">
              <Button variant="outline" size="lg" className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                Saiba Mais <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} id="faq" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Perguntas <span className="text-blue-500">frequentes</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Tire suas dúvidas sobre o processo terapêutico.</p>
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

      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />
        <div className="absolute top-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <Badge className="px-4 py-2 text-sm bg-white/10 text-white border-white/20">Comece Agora</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">Pronto para começar sua <br /><span className="text-blue-200">jornada de transformação?</span></h2>
            <p className="text-lg text-blue-100/80 max-w-lg mx-auto">Dê o primeiro passo em direção ao seu bem-estar emocional.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agendar"><Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/10 text-base h-12 px-8">Agende sua Consulta <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <Link href="/paciente/cadastro"><Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base h-12 px-8">Criar Conta</Button></Link>
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
                  <Image src="/logo.png" alt="PsicoFlow" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">PsicoFlow</span>
                  <p className="text-[10px] text-slate-300 leading-none">CRP 04/52274</p>
                </div>
              </Link>
              <p className="text-sm text-slate-300 leading-relaxed">Sistema completo de gestão para psicólogos. Agende consultas, emita prontuários, gerencie finanças e realize atendimentos online com segurança.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors">Início</Link></li>
                <li><Link href="/#servicos" className="text-sm text-slate-300 hover:text-white transition-colors">Serviços</Link></li>
                <li><Link href="/sobre" className="text-sm text-slate-300 hover:text-white transition-colors">Sobre</Link></li>
                <li><Link href="/blog" className="text-sm text-slate-300 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/#faq" className="text-sm text-slate-300 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/termos" className="text-sm text-slate-300 hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="text-sm text-slate-300 hover:text-white transition-colors">Política de Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Acesso</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Área do Psicólogo</Link></li>
                <li><Link href="/paciente/login" className="text-sm text-slate-300 hover:text-white transition-colors">Área do Paciente</Link></li>
                <li><Link href="/paciente/cadastro" className="text-sm text-slate-300 hover:text-white transition-colors">Cadastre-se</Link></li>
                <li><Link href="/agendar" className="text-sm text-slate-300 hover:text-white transition-colors">Agende Consulta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-300"><Mail className="h-4 w-4 text-blue-400 shrink-0" />contato@psicoflow.com.br</li>
                <li className="flex items-center gap-2 text-sm text-slate-300"><Phone className="h-4 w-4 text-blue-400 shrink-0" />(31) 99999-8888</li>
                <li className="flex items-center gap-2 text-sm text-slate-300"><MapPin className="h-4 w-4 text-blue-400 shrink-0" />Belo Horizonte, MG</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-400 text-center">© {new Date().getFullYear()} PsicoFlow. Todos os direitos reservados. CRP 04/52274 • Psicólogo Responsável</p>
          </div>
        </div>
      </footer>
      <WhatsAppWidget />
    </div>
  )
}