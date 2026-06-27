"use client"

import { useCallback, useRef, useState } from "react"
import { useRoomContext } from "@livekit/components-react"
import { Track } from "livekit-client"
import { BackgroundProcessor, supportsBackgroundProcessors } from "@livekit/track-processors"
import type { BackgroundProcessorWrapper } from "@livekit/track-processors"

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
    if (!room || !supported) return

    const videoPub = room.localParticipant.getTrackPublication(Track.Source.Camera)
    if (!videoPub?.track) return

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
    } catch {
      setMode("disabled")
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
