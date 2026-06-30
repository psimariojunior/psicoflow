"use client"

import { useEffect, useState } from "react"
import { RefreshCw, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function SwUpdateNotification() {
  const [show, setShow] = useState(false)
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "SW_UPDATED") {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg?.waiting) {
            setWaitingSW(reg.waiting)
            setShow(true)
          }
        })
      }
    }

    navigator.serviceWorker.addEventListener("message", handler)

    // Also check if there's already a waiting SW
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        setWaitingSW(reg.waiting)
        setShow(true)
      }
    })

    return () => navigator.serviceWorker.removeEventListener("message", handler)
  }, [])

  const handleUpdate = () => {
    waitingSW?.postMessage({ type: "SKIP_WAITING" })
    window.location.reload()
  }

  const handleDismiss = () => {
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-3 left-3 right-3 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-slate-900 dark:bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw className="h-4 w-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Nova versão disponível</p>
                  <p className="text-[10px] text-slate-400">Atualize para obter as últimas melhorias</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUpdate}
                  className="text-[11px] font-semibold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Atualizar
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  aria-label="Dispensar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
