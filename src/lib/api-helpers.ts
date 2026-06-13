import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new AuthError()
  }
  return session.user.id
}

export class AuthError extends Error {
  constructor() {
    super("Não autorizado")
    this.name = "AuthError"
  }
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
