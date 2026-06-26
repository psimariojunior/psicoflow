"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const PHONE = "5531992863861"
const MESSAGE = "Olá! Gostaria de agendar uma consulta."

export function WhatsAppWidget() {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000)
    const tooltipTimer = setTimeout(() => setShowTooltip(true), 6000)
    return () => { clearTimeout(timer); clearTimeout(tooltipTimer) }
  }, [])

  const handleClick = () => {
    setDismissed(true)
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        >
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="relative bg-card border shadow-lg rounded-2xl px-4 py-3 max-w-[220px]"
              >
                <div className="absolute right-4 -bottom-2 w-3 h-3 bg-card border-r border-b rotate-45" />
                <p className="text-sm font-medium">Fale conosco pelo WhatsApp</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tire suas dúvidas</p>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-muted-foreground/20 hover:bg-muted-foreground/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleClick}
            className={cn(
              "relative w-14 h-14 rounded-full flex items-center justify-center",
              "bg-[#25D366] hover:bg-[#20BD5A] text-white",
              "shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50",
              "transition-all duration-300 hover:scale-105 active:scale-95",
            )}
            aria-label="Fale conosco pelo WhatsApp"
          >
            <MessageCircle className="w-7 h-7 relative z-10" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
