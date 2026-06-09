import { NextResponse } from "next/server"

interface RoomData {
  offer?: string
  answer?: string
  candidatesLocal: string[]
  candidatesRemote: string[]
}

const g = globalThis as { __webrtcRooms?: Map<string, RoomData> }
if (!g.__webrtcRooms) g.__webrtcRooms = new Map()
const rooms = g.__webrtcRooms

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, room: roomName, sdp, candidate } = body
    const room = roomName || `sala-${Date.now()}`

    if (type === "create-room") {
      rooms.set(room, { candidatesLocal: [], candidatesRemote: [] })
      return NextResponse.json({
        room,
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      })
    }

    if (type === "set-offer") {
      if (!rooms.has(room)) rooms.set(room, { candidatesLocal: [], candidatesRemote: [] })
      rooms.get(room)!.offer = sdp
      return NextResponse.json({ ok: true })
    }

    if (type === "set-answer") {
      if (!rooms.has(room)) return NextResponse.json({ error: "Room not found" }, { status: 404 })
      rooms.get(room)!.answer = sdp
      return NextResponse.json({ ok: true })
    }

    if (type === "add-candidate") {
      if (!rooms.has(room)) return NextResponse.json({ error: "Room not found" }, { status: 404 })
      const data = rooms.get(room)!
      if (candidate?.side === "local") data.candidatesLocal.push(JSON.stringify(candidate))
      else data.candidatesRemote.push(JSON.stringify(candidate))
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("WebRTC error:", error)
    return NextResponse.json({ error: "Erro no signaling" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const room = searchParams.get("room")

  if (!room) {
    return NextResponse.json({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    })
  }

  const data = rooms.get(room)
  if (!data) return NextResponse.json({ error: "Room not found" }, { status: 404 })

  return NextResponse.json({
    offer: data.offer,
    answer: data.answer,
    candidatesLocal: data.candidatesLocal,
    candidatesRemote: data.candidatesRemote,
  })
}
