"use client"

import { useEffect, useState } from "react"
import { useRoomContext } from "@livekit/components-react"

export function AudioSubscriber() {
  const room = useRoomContext()
  const [audioCount, setAudioCount] = useState(0)

  useEffect(() => {
    if (!room) return
    const subs = new Map<string, HTMLAudioElement>()

    const attach = (pub: any) => {
      const track = pub.track
      if (!track || pub.kind !== "audio") return
      if (subs.has(pub.trackSid)) return
      const el = new Audio()
      el.srcObject = new MediaStream([track.mediaStreamTrack])
      el.autoplay = true
      el.play().catch(() => {})
      subs.set(pub.trackSid, el)
      setAudioCount(subs.size)
    }

    const detach = (pub: any) => {
      const el = subs.get(pub.trackSid)
      if (el) {
        el.pause()
        el.srcObject = null
        subs.delete(pub.trackSid)
        setAudioCount(subs.size)
      }
    }

    const onSub = (_track: any, pub: any) => attach(pub)
    const onUnsub = (_track: any, pub: any) => detach(pub)

    room.on("trackSubscribed", onSub)
    room.on("trackUnsubscribed", onUnsub)

    Array.from(room.remoteParticipants.values()).forEach((p) => {
      Array.from(p.trackPublications.values()).forEach((pub: any) => {
        if (pub.kind === "audio" && pub.track && pub.isSubscribed) {
          attach(pub)
        }
      })
    })

    return () => {
      room.off("trackSubscribed", onSub)
      room.off("trackUnsubscribed", onUnsub)
      Array.from(subs.values()).forEach((el) => {
        el.pause()
        el.srcObject = null
      })
      subs.clear()
    }
  }, [room])

  return <div className="hidden" data-audio-count={audioCount} />
}
