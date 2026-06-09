import { describe, it, expect } from "vitest"
import { sanitizeHtml, encrypt, decrypt, validateCpf } from "@/lib/security"

describe("sanitizeHtml", () => {
  it("escapes script tags to prevent XSS", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>João')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;João"
    )
  })

  it("escapes HTML special characters", () => {
    expect(sanitizeHtml('<img src=x onerror=alert(1)>')).toBe(
      "&lt;img src=x onerror=alert(1)&gt;"
    )
  })

  it("returns safe text unchanged", () => {
    expect(sanitizeHtml("Maria Silva")).toBe("Maria Silva")
  })
})

describe("encrypt/decrypt", () => {
  const originalKey = process.env.ENCRYPTION_KEY

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = "TNjALRQDFqX1ysa8w3JZW57ctEM6pemv"
  })

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalKey
  })

  it("encrypts and decrypts correctly", () => {
    const original = "dado sensível do paciente"
    const result = encrypt(original)
    expect(result.encrypted).toBeTruthy()
    expect(result.iv).toBeTruthy()
    expect(result.tag).toBeTruthy()
    expect(result.encrypted).not.toBe(original)
    const decrypted = decrypt(result.encrypted, result.iv, result.tag)
    expect(decrypted).toBe(original)
  })
})

describe("validateCpf", () => {
  it("accepts valid CPF", () => {
    expect(validateCpf("529.982.247-25")).toBe(true)
  })

  it("rejects CPF with all same digits", () => {
    expect(validateCpf("111.111.111-11")).toBe(false)
  })

  it("rejects invalid CPF", () => {
    expect(validateCpf("123.456.789-00")).toBe(false)
  })

  it("rejects short CPF", () => {
    expect(validateCpf("123")).toBe(false)
  })
})
