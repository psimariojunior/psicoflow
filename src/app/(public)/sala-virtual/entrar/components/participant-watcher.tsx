"use client"

import { useEffect } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent } from "livekit-client"

export function ParticipantWatcher({ onParticipantsChange }: { onParticipantsChange: (hasRemote: boolean) => void }) {
  const room = useRoomContext()

  useEffect(() => {
    if (!room) return

    const check = () => {
      try {
        onParticipantsChange(room.remoteParticipants.size > 0)
      } catch {}
    }

    check()

    room.on(RoomEvent.ParticipantConnected, check)
    room.on(RoomEvent.ParticipantDisconnected, check)

    return () => {
      room.off(RoomEvent.ParticipantConnected, check)
      room.off(RoomEvent.ParticipantDisconnected, check)
    }
  }, [room, onParticipantsChange])

  return null
}
