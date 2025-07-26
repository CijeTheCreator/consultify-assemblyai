import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const userRole = searchParams.get("userRole")

  if (!userId || !userRole) {
    return NextResponse.json({ error: "Missing userId or userRole" }, { status: 400 })
  }

  try {
    // Get consultation count
    const consultationCount = await prisma.consultation.count({
      where: userRole === "patient" ? { patientId: userId } : { doctorId: userId },
    })

    // Get message count
    const messageCount = await prisma.message.count({
      where: { senderId: userId },
    })

    // Get recent consultations with basic info
    const recentConsultations = await prisma.consultation.findMany({
      where: userRole === "patient" ? { patientId: userId } : { doctorId: userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
    })

    return NextResponse.json({
      consultations: consultationCount,
      messages: messageCount,
      recentConsultations: recentConsultations.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        createdAt: c.createdAt,
        consultationType: c.consultationType,
      })),
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
