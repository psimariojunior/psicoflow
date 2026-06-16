"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Heart, Users, Calendar, Star } from "lucide-react"

interface AnimatedCounterProps {
  end: number
  suffix?: string
  label: string
  icon?: React.ReactNode
}

function Counter({ end, suffix = "", label, icon }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = Math.max(1, Math.floor(end / 60))
    const interval = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(interval)
      } else {
        setCount(start)
      }
    }, duration / 60)
    return () => clearInterval(interval)
  }, [inView, end])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center p-6"
    >
      {icon && <div className="text-emerald-500 mb-2 flex justify-center">{icon}</div>}
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  )
}

const stats = [
  { end: 500, suffix: "+", label: "Atendimentos Realizados", icon: <Heart className="w-6 h-6" /> },
  { end: 98, suffix: "%", label: "Satisfação dos Pacientes", icon: <Star className="w-6 h-6" /> },
  { end: 150, suffix: "+", label: "Pacientes Atendidos", icon: <Users className="w-6 h-6" /> },
  { end: 5, suffix: " anos", label: "De Experiência", icon: <Calendar className="w-6 h-6" /> },
]

export function AnimatedCounters() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <Counter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
