import { SignJWT, jwtVerify } from "jose"
import { randomUUID } from "crypto"

function getSecret(): Uint8Array {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error("ENCRYPTION_KEY não configurada")
  return new TextEncoder().encode(key)
}

export interface PatientTokenPayload {
  patientId: string
  email: string | null
  jti?: string
  [key: string]: unknown
}

export async function signPatientToken(payload: PatientTokenPayload): Promise<string> {
  return new SignJWT({ ...payload, jti: randomUUID() })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyPatientToken(token: string): Promise<PatientTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as PatientTokenPayload
  } catch {
    return null
  }
}
