import { prisma } from "./prisma"
import { randomBytes, createCipheriv, createDecipheriv } from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set")
  }
  return Buffer.from(key.padEnd(KEY_LENGTH, "0").slice(0, KEY_LENGTH))
}

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const key = getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  const tag = cipher.getAuthTag().toString("hex")

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag,
  }
}

export function decrypt(encrypted: string, iv: string, tag: string): string {
  const key = getEncryptionKey()
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"))
  decipher.setAuthTag(Buffer.from(tag, "hex"))

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  ipAddress?: string
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details,
      ipAddress,
    },
  })
}

export async function recordConsent(
  patientId: string,
  psychologistId: string,
  type: string,
  consent: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  await prisma.consentLog.create({
    data: {
      patientId,
      psychologistId,
      type,
      consent,
      ipAddress,
      userAgent,
    },
  })
}

export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

export function validateCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(10))) return false

  return true
}
