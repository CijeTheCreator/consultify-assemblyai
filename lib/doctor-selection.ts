import { supabase } from "./supabase-server"

export interface DoctorSelectionCriteria {
  symptoms: string
  urgency: "low" | "medium" | "high"
  specialization?: string
}

export async function selectDoctor(criteria: DoctorSelectionCriteria) {
  try {
    // Get all doctors from Supabase Auth
    const { data: users } = await supabase.auth.admin.listUsers()
    const doctors = users.users.filter((user) => user.user_metadata?.role === "doctor")

    if (doctors.length === 0) {
      throw new Error("No doctors available")
    }

    const randomIndex = Math.floor(Math.random() * doctors.length)
    const selectedDoctor = doctors[randomIndex]

    return selectedDoctor
  } catch (error) {
    console.error("Doctor selection error:", error)
    throw error
  }
}

export function extractSymptoms(aiSummary: string): DoctorSelectionCriteria {
  // Extract symptoms from AI summary
  const symptoms = aiSummary.replace(/^(URGENT_)?TRIAGE_COMPLETE:\s*/, "")
  const urgency = aiSummary.startsWith("URGENT_TRIAGE_COMPLETE") ? "high" : "medium"

  // TODO: Add more sophisticated symptom analysis and specialization matching
  let specialization: string | undefined

  if (symptoms.toLowerCase().includes("heart") || symptoms.toLowerCase().includes("chest")) {
    specialization = "Cardiology"
  } else if (symptoms.toLowerCase().includes("skin") || symptoms.toLowerCase().includes("rash")) {
    specialization = "Dermatology"
  }

  return {
    symptoms,
    urgency,
    specialization,
  }
}
