export type UserRole = "ADMIN" | "PSYCHOLOGIST" | "RECEPTIONIST" | "PATIENT"

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | "REFUNDED"

export type TransactionType = "INCOME" | "EXPENSE"

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH"

export type RecordType =
  | "SESSION_NOTE"
  | "ANAMNESIS"
  | "EVOLUTION"
  | "DISCHARGE_SUMMARY"
  | "REPORT"
  | "THERAPEUTIC_PLAN"
  | "EXAM_RESULT"
  | "CONTRACT"
  | "OTHER"

export interface DashboardStats {
  totalPatients: number
  appointmentsToday: number
  monthlyRevenue: number
  pendingPayments: number
  appointmentChange: number
  revenueChange: number
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: AppointmentStatus
  patientName: string
  patientId: string
  modality: string
  color?: string
}

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  balance: number
  pending: number
  overdue: number
  received: number
}

export interface EmotionData {
  date: string
  mood: number
  anxiety: number
  sleep: number
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  status: string
  channel: string
  sentAt: string | null
  createdAt: string
}
