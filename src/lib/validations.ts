import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter maiúscula, minúscula e número"
    ),
  confirmPassword: z.string(),
  crp: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
})

export const patientSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  rg: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  maritalStatus: z.string().optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  observations: z.string().optional().or(z.literal("")),
})

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  title: z.string().optional().or(z.literal("")),
  startTime: z.string().min(1, "Data e hora são obrigatórias"),
  endTime: z.string().min(1, "Data e hora fim são obrigatórias"),
  type: z.string().optional().or(z.literal("")),
  modality: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  price: z.number().optional(),
  color: z.string().optional().or(z.literal("")),
})

export const sessionSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  appointmentId: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
  duration: z.number().optional(),
  type: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  subjective: z.string().optional().or(z.literal("")),
  objective: z.string().optional().or(z.literal("")),
  assessment: z.string().optional().or(z.literal("")),
  plan: z.string().optional().or(z.literal("")),
  moodBefore: z.number().min(0).max(10).optional(),
  moodAfter: z.number().min(0).max(10).optional(),
})

export const transactionSchema = z.object({
  description: z.string().min(3, "Descrição é obrigatória"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().optional().or(z.literal("")),
  amount: z.number().positive("Valor deve ser positivo"),
  dueDate: z.string().optional().or(z.literal("")),
  paymentDate: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().optional().or(z.literal("")),
  paymentStatus: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]),
  patientId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export const medicalRecordSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  type: z.enum([
    "SESSION_NOTE", "ANAMNESIS", "EVOLUTION",
    "DISCHARGE_SUMMARY", "REPORT", "THERAPEUTIC_PLAN",
    "EXAM_RESULT", "CONTRACT", "OTHER",
  ]),
  title: z.string().min(3, "Título é obrigatório"),
  content: z.string().min(10, "Conteúdo deve ter no mínimo 10 caracteres"),
  isConfidential: z.boolean().default(false),
})

export const notificationSchema = z.object({
  title: z.string().min(3, "Título é obrigatório"),
  message: z.string().min(10, "Mensagem deve ter no mínimo 10 caracteres"),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "PUSH"]),
  patientId: z.string().optional().or(z.literal("")),
  sendAt: z.string().optional().or(z.literal("")),
})
