import type { Consultation, Message, Prescription } from "@prisma/client"

export type ConsultationWithRelations = Consultation & {
  messages?: MessageWithRelations[]
  prescriptions?: Prescription[]
  // User data will come from Supabase Auth, not database relations
  patientName?: string
  doctorName?: string
  doctorSpecialization?: string
}

export type MessageWithRelations = Message & {
  prescription?: Prescription | null
  reads?: { userId: string }[]
  // Sender info will come from Supabase Auth
  senderName?: string
}

export type PrescriptionWithRelations = Prescription & {
  consultation?: Consultation
  // Doctor/Patient info will come from Supabase Auth
  doctorName?: string
  patientName?: string
}

// For compatibility with existing code
export type { Consultation, Message, Prescription }

// User type based on Supabase Auth
export interface User {
  id: string
  email: string
  name: string
  role: "doctor" | "patient"
  language: string
  specialization?: string
  onboarding_completed: boolean
  created_at: string
}
