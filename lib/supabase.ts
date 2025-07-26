import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  name: string
  role: "doctor" | "patient"
  specialization?: string
  created_at: string
}

export type Consultation = {
  id: string
  patient_id: string
  doctor_id: string
  title: string
  status: "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  patient?: User
  doctor?: User
}

export type Message = {
  id: string
  consultation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: User
  read_by?: string[]
}
