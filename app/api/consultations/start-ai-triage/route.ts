import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ConsultationType, AITriageStatus, ConsultationStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { patientId } = await request.json()

    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 })
    }

    // Create AI triage consultation
    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId: null, // No doctor assigned yet
        title: "AI Health Assessment",
        status: ConsultationStatus.ACTIVE,
        consultationType: ConsultationType.AI_TRIAGE,
        aiTriageStatus: AITriageStatus.IN_PROGRESS,
      },
      // Remove this include since we don't have patient relation
      // include: {
      //   patient: true,
      // },
    })

    // Add initial AI message
    await prisma.message.create({
      data: {
        consultationId: consultation.id,
        senderId: patientId,
        content:
          "Hello! I'm your AI health assistant. I'm here to understand your symptoms and connect you with the right doctor. What brings you here today?",
        messageType: "AI_TRIAGE",
      },
    })

    return NextResponse.json({ consultation })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
