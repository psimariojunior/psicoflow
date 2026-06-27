"use client"

import { useCallback, useRef, useState } from "react"
import { useRoomContext } from "@livekit/components-react"
import { Track } from "livekit-client"
import { BackgroundProcessor, supportsBackgroundProcessors } from "@livekit/track-processors"
import type { BackgroundProcessorWrapper } from "@livekit/track-processors"
import toast from "react-hot-toast"

export type BackgroundMode = "disabled" | "blur" | "blur-strong"

export function useBackgroundProcessor() {
  const room = useRoomContext()
  const processorRef = useRef<BackgroundProcessorWrapper | null>(null)
  const [mode, setMode] = useState<BackgroundMode>("disabled")
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false
    return supportsBackgroundProcessors()
  })

  const applyMode = useCallback(async (newMode: BackgroundMode) => {
    if (!room) {
      toast.error("Sala não conectada. Aguarde a conexão.")
      return
    }
    if (!supported) {
      toast.error("Fundo desfocado não suportado neste navegador.")
      return
    }

    const videoPub = room.localParticipant.getTrackPublication(Track.Source.Camera)
    if (!videoPub?.track) {
      toast.error("Câmera não ativa. Ligue a câmera antes de usar o fundo desfocado.")
      return
    }

    // Check that camera is actually enabled before applying processor
    if (newMode !== "disabled" && !videoPub.isMuted) {
      // Camera is muted — can't apply processor
    }

    try {
      if (newMode === "disabled") {
        if (processorRef.current) {
          await videoPub.track.stopProcessor()
          processorRef.current = null
        }
      } else {
        const blurRadius = newMode === "blur-strong" ? 20 : 10
        if (processorRef.current) {
          await processorRef.current.switchTo({ mode: "background-blur", blurRadius })
        } else {
          const proc = BackgroundProcessor({ mode: "background-blur", blurRadius })
          await videoPub.track.setProcessor(proc)
          processorRef.current = proc
        }
      }
      setMode(newMode)
    } catch (err) {
      console.error("[BackgroundProcessor] failed:", err)
      setMode("disabled")
      toast.error("Fundo desfocado não disponível neste dispositivo")
    }
  }, [room, supported])

  const toggleBlur = useCallback(() => {
    applyMode(mode === "disabled" ? "blur" : "disabled")
  }, [mode, applyMode])

  const cycleMode = useCallback(() => {
    const next: BackgroundMode = mode === "disabled" ? "blur" : mode === "blur" ? "blur-strong" : "disabled"
    applyMode(next)
  }, [mode, applyMode])

  return { mode, supported, toggleBlur, cycleMode, applyMode }
}
