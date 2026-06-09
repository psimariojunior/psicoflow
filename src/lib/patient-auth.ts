import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "fallback-dev-secret-key-change-in-production"
)

export interface PatientTokenPayload {
  patientId: string
  email: string | null
  [key: string]: unknown
}

export async function signPatientToken(payload: PatientTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyPatientToken(token: string): Promise<PatientTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as PatientTokenPayload
  } catch {
    return null
  }
}
