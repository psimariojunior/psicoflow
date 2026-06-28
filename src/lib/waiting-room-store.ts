// Shared in-memory waiting room store
// Used by both /api/livekit/token and /api/livekit/waiting
// Resets on Vercel cold start — acceptable for real-time transient state

export interface WaitingPatient {
  id: string
  room: string
  name: string
  status: "waiting" | "approved" | "rejected"
  createdAt: number
}

const waitingRoom = new Map<string, WaitingPatient>()

// Auto-cleanup entries older than 10 minutes
function cleanup() {
  const now = Date.now()
  const entries = Array.from(waitingRoom.entries())
  for (const [key, entry] of entries) {
    if (now - entry.createdAt > 10 * 60 * 1000) {
      waitingRoom.delete(key)
    }
  }
}

export function registerPatient(room: string, name: string, status: "waiting" | "approved" = "approved"): WaitingPatient {
  cleanup()
  const id = `wait-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const entry: WaitingPatient = { id, room, name, status, createdAt: Date.now() }
  waitingRoom.set(id, entry)
  return entry
}

export function approvePatient(id: string): boolean {
  cleanup()
  const entry = waitingRoom.get(id)
  if (!entry) return false
  entry.status = "approved"
  waitingRoom.set(id, entry)
  return true
}

export function rejectPatient(id: string): boolean {
  cleanup()
  const entry = waitingRoom.get(id)
  if (!entry) return false
  entry.status = "rejected"
  waitingRoom.set(id, entry)
  return true
}

export function removePatient(id: string): void {
  waitingRoom.delete(id)
}

export function getPatient(id: string): WaitingPatient | undefined {
  cleanup()
  return waitingRoom.get(id)
}

export function getAllPatients(): WaitingPatient[] {
  cleanup()
  return Array.from(waitingRoom.values())
}

export function getPatientsByRoom(room: string): WaitingPatient[] {
  cleanup()
  return Array.from(waitingRoom.values()).filter((p) => p.room === room)
}
