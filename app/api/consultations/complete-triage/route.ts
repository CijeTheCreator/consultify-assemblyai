// app/api/consultations/complete-triage/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { selectDoctor, extractSymptoms } from "@/lib/doctor-selection"
import { ConsultationType, AITriageStatus } from "@prisma/client"
import { supabase } from "@/lib/supabase-server"
import { translateMessage, getLanguageFromUserId } from "@/lib/translation"

export async function POST(request: NextRequest) {
  try {
    const { consultationId, aiSummary } = await request.json()

    if (!consultationId || !aiSummary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get consultation details
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    })

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    // Get patient language
    const patientLanguage = await getLanguageFromUserId(consultation.patientId)

    // Extract symptoms and select doctor
    const criteria = extractSymptoms(aiSummary)
    const selectedDoctor = await selectDoctor(criteria)

    // Get doctor language
    const doctorLanguage = await getLanguageFromUserId(selectedDoctor.id)

    // Update consultation with doctor and change type
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        doctorId: selectedDoctor.id,
        title: `Consultation - ${criteria.symptoms.substring(0, 50)}...`,
        consultationType: ConsultationType.HUMAN,
        aiTriageStatus: AITriageStatus.COMPLETED,
        triageSummary: aiSummary,
        urgency: criteria.urgency.toUpperCase() as any,
      },
    })

    // Add triage summary as system message
    await prisma.message.create({
      data: {
        consultationId,
        senderId: consultation.patientId,
        content: `AI Triage Summary: ${aiSummary}`,
        messageType: "SYSTEM",
      },
    })

    // Get doctor data from Supabase Auth
    let doctorName = "Doctor"
    let doctorSpecialization = ""
    try {
      const { data: doctorData } = await supabase.auth.admin.getUserById(selectedDoctor.id)
      if (doctorData.user) {
        doctorName = doctorData.user.user_metadata?.name || "Doctor"
        doctorSpecialization = doctorData.user.user_metadata?.specialization || ""
      }
    } catch (error) {
      console.error("Failed to fetch doctor data:", error)
    }

    // Create doctor introduction message
    const doctorIntroContent = `Hello! I'm Dr. ${doctorName}. I've reviewed your symptoms and I'm here to help. How are you feeling right now?`

    // Create the message first
    const doctorIntroMessage = await prisma.message.create({
      data: {
        consultationId,
        senderId: selectedDoctor.id,
        content: doctorIntroContent,
        messageType: "DOCTOR_INTRO",
      },
    })

    // Translate doctor introduction for patient if needed
    let translatedIntroContent = doctorIntroContent
    if (doctorLanguage !== patientLanguage) {
      translatedIntroContent = await translateMessage({
        messageId: doctorIntroMessage.id,
        text: doctorIntroContent,
        sourceLanguage: doctorLanguage,
        targetLanguage: patientLanguage,
      })
    }

    // Get patient data from Supabase Auth
    let patientName = "Patient"
    try {
      const { data: patientData } = await supabase.auth.admin.getUserById(consultation.patientId)
      if (patientData.user) {
        patientName = patientData.user.user_metadata?.name || "Patient"
      }
    } catch (error) {
      console.error("Failed to fetch patient data:", error)
    }

    return NextResponse.json({
      consultation: {
        ...updatedConsultation,
        patientName,
        doctorName,
        doctorSpecialization,
      },
      doctor: {
        id: selectedDoctor.id,
        name: doctorName,
        specialization: doctorSpecialization,
        language: doctorLanguage,
      },
      introMessage: {
        ...doctorIntroMessage,
        content: translatedIntroContent,
        originalContent: doctorIntroContent,
        senderName: doctorName,
        senderLanguage: doctorLanguage,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
