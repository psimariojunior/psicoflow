import { describe, it, expect } from "vitest"
import {
  validate,
  createPatientSchema,
  createAppointmentSchema,
  createTransactionSchema,
  createDiaryEntrySchema,
  forgotPasswordSchema,
} from "@/lib/validation"

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "teste@exemplo.com" }).success).toBe(true)
  })

  it("rejects invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "invalido" }).success).toBe(false)
  })

  it("rejects empty email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false)
  })
})

describe("createPatientSchema", () => {
  it("accepts valid patient", () => {
    const result = createPatientSchema.safeParse({ name: "Maria Silva" })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = createPatientSchema.safeParse({ name: "A" })
    expect(result.success).toBe(false)
  })

  it("accepts patient with all fields", () => {
    const result = createPatientSchema.safeParse({
      name: "João Pereira",
      email: "joao@email.com",
      phone: "(11) 99999-9999",
      cpf: "123.456.789-00",
    })
    expect(result.success).toBe(true)
  })
})

describe("createAppointmentSchema", () => {
  it("accepts valid appointment", () => {
    const result = createAppointmentSchema.safeParse({
      patientId: "abc123",
      startTime: "2026-06-08T10:00:00Z",
      endTime: "2026-06-08T11:00:00Z",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing patientId", () => {
    const result = createAppointmentSchema.safeParse({
      startTime: "2026-06-08T10:00:00Z",
      endTime: "2026-06-08T11:00:00Z",
    })
    expect(result.success).toBe(false)
  })
})

describe("createTransactionSchema", () => {
  it("accepts valid income transaction", () => {
    const result = createTransactionSchema.safeParse({
      description: "Sessão de terapia",
      type: "INCOME",
      amount: 200,
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid type", () => {
    const result = createTransactionSchema.safeParse({
      description: "Teste",
      type: "INVALIDO",
      amount: 100,
    })
    expect(result.success).toBe(false)
  })

  it("rejects negative amount", () => {
    const result = createTransactionSchema.safeParse({
      description: "Teste",
      type: "INCOME",
      amount: -50,
    })
    expect(result.success).toBe(false)
  })
})

describe("createDiaryEntrySchema", () => {
  it("accepts valid entry", () => {
    const result = createDiaryEntrySchema.safeParse({
      patientId: "abc123",
      mood: 7,
    })
    expect(result.success).toBe(true)
  })

  it("rejects mood out of range", () => {
    const result = createDiaryEntrySchema.safeParse({
      patientId: "abc123",
      mood: 15,
    })
    expect(result.success).toBe(false)
  })
})

describe("validate helper", () => {
  it("returns data for valid input", () => {
    const { data, error } = validate(forgotPasswordSchema, { email: "teste@exemplo.com" })
    expect(data).toBeDefined()
    expect(data?.email).toBe("teste@exemplo.com")
    expect(error).toBeUndefined()
  })

  it("returns error response for invalid input", () => {
    const result = validate(forgotPasswordSchema, { email: "invalido" })
    expect(result.data).toBeUndefined()
    expect(result.error).toBeDefined()
  })
})
