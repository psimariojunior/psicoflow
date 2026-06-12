"use client"

import { useEffect } from "react"
import { useRemoteParticipants } from "@livekit/components-react"

export function ParticipantWatcher({ onParticipantsChange }: { onParticipantsChange: (hasRemote: boolean) => void }) {
  const participants = useRemoteParticipants()
  useEffect(() => { onParticipantsChange(participants.length > 0) }, [participants, onParticipantsChange])
  return null
}
