import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id

  try {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      // Remove user relations
      // include: {
      //   patient: true,
      //   doctor: true,
      // },
    })

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    // Enrich with user data from Supabase Auth
    let patientName = "Unknown Patient"
    let doctorName = "Unknown Doctor"
    let doctorSpecialization = ""

    try {
      // Get patient info
      if (consultation.patientId) {
        const { data: patientData } = await supabase.auth.admin.getUserById(consultation.patientId)
        if (patientData.user) {
          patientName = patientData.user.user_metadata?.name || "Unknown Patient"
        }
      }

      // Get doctor info
      if (consultation.doctorId) {
        const { data: doctorData } = await supabase.auth.admin.getUserById(consultation.doctorId)
        if (doctorData.user) {
          doctorName = doctorData.user.user_metadata?.name || "Unknown Doctor"
          doctorSpecialization = doctorData.user.user_metadata?.specialization || ""
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    }

    return NextResponse.json({
      consultation: {
        ...consultation,
        patientName,
        doctorName,
        doctorSpecialization,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
