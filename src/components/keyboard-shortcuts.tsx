"use client"

import { useState, useEffect } from "react"
import { Command } from "lucide-react"
import { cn } from "@/lib/utils"

const shortcuts = [
  { keys: ["⌘", "K"], label: "Paleta de comandos" },
  { keys: ["N"], label: "Novo paciente (qualquer tela)" },
  { keys: ["⌘", "N"], label: "Nova consulta" },
  { keys: ["⌘", "D"], label: "Ir para Dashboard" },
  { keys: ["⌘", "P"], label: "Ir para Pacientes" },
  { keys: ["⌘", "A"], label: "Ir para Agenda" },
  { keys: ["Escape"], label: "Fechar diálogos" },
]

export function KeyboardShortcutsHint() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        window.location.href = "/pacientes/novo"
      }
      if (e.key === "?" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-[60] flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 transition-all duration-200"
        aria-label="Atalhos de teclado"
        title="Pressione ? para ver atalhos"
      >
        <Command className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-background rounded-2xl border shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Atalhos de Teclado</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Fechar
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <kbd className="flex items-center gap-0.5">
                    {s.keys.map((k, i) => (
                      <span
                        key={i}
                        className={cn(
                          "inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 rounded-md border text-[11px] font-mono",
                          k === "Escape"
                            ? "bg-muted text-muted-foreground"
                            : "bg-accent text-accent-foreground font-semibold"
                        )}
                      >
                        {k}
                      </span>
                    ))}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Pressione <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded border bg-muted text-[10px] font-mono">?</kbd> para abrir esta janela
            </p>
          </div>
        </div>
      )}
    </>
  )
}
