import { z } from "zod"
import { NextResponse } from "next/server"

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { data?: T; error?: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
    return { error: NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 }) }
  }
  return { data: result.data }
}

export const emailSchema = z.string().email("Email inválido").max(255)
export const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128)
export const nameSchema = z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(255)

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const createPatientSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  cpf: z.string().max(14).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
})

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  startTime: z.string().min(1, "Data/hora início é obrigatória"),
  endTime: z.string().min(1, "Data/hora fim é obrigatória"),
  title: z.string().optional(),
  type: z.string().optional(),
  modality: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
})

export const createRecordSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  type: z.string().optional(),
  content: z.string().optional(),
  isConfidential: z.boolean().optional(),
})

export const createDiaryEntrySchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  date: z.string().optional(),
  mood: z.number().int().min(1).max(10),
  emotions: z.string().optional(),
  activities: z.string().optional(),
  notes: z.string().optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  anxietyLevel: z.number().int().min(1).max(10).optional(),
})

export const createTransactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  type: z.enum(["RECEITA", "DESPESA"]),
  amount: z.number().positive("Valor deve ser positivo"),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  patientId: z.string().optional(),
  notes: z.string().optional(),
})
