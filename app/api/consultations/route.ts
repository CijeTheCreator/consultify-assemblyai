import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const userRole = searchParams.get("userRole")

  if (!userId || !userRole) {
    return NextResponse.json({ error: "Missing userId or userRole" }, { status: 400 })
  }

  try {
    const consultations = await prisma.consultation.findMany({
      where: userRole === "patient" ? { patientId: userId } : { doctorId: userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        prescriptions: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Enrich consultations with user data from Supabase Auth
    const enrichedConsultations = await Promise.all(
      consultations.map(async (consultation) => {
        let patientName = "Unknown Patient"
        let doctorName = "Unknown Doctor"
        let doctorSpecialization = ""

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

        return {
          ...consultation,
          patientName,
          doctorName,
          doctorSpecialization,
        }
      }),
    )

    return NextResponse.json({ consultations: enrichedConsultations })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { patientId, title } = await request.json()

  if (!patientId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Find an available doctor from Supabase Auth
    const { data: users } = await supabase.auth.admin.listUsers()
    const doctors = users.users.filter((user) => user.user_metadata?.role === "doctor")

    if (doctors.length === 0) {
      return NextResponse.json({ error: "No doctors available" }, { status: 400 })
    }

    const doctor = doctors[0] // Simple assignment for demo

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId: doctor.id,
        title,
        status: "ACTIVE",
      },
    })

    return NextResponse.json({
      consultation: {
        ...consultation,
        patientName: "Patient", // Will be enriched on fetch
        doctorName: doctor.user_metadata?.name || "Doctor",
        doctorSpecialization: doctor.user_metadata?.specialization || "",
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
