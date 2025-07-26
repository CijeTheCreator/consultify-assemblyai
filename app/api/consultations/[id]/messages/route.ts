// app/api/consultations/[id]/messages/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase-server"
import { translateMessage, getLanguageFromUserId } from "@/lib/translation"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  try {
    // Get user's preferred language
    const userLanguage = await getLanguageFromUserId(userId)

    // Get messages with prescription data
    const messages = await prisma.message.findMany({
      where: { consultationId },
      include: {
        prescription: true,
        reads: {
          select: { userId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    // Get typing indicators
    const typingIndicators = await prisma.typingIndicator.findMany({
      where: {
        consultationId,
        updatedAt: {
          gte: new Date(Date.now() - 3000), // Last 3 seconds
        },
        userId: {
          not: userId,
        },
      },
    })

    // Get all unique sender IDs to fetch their languages
    const senderIds = [...new Set(messages.map(msg => msg.senderId))]
    const senderLanguages = new Map<string, string>()

    await Promise.all(
      senderIds.map(async (senderId) => {
        const language = await getLanguageFromUserId(senderId)
        senderLanguages.set(senderId, language)
      })
    )

    // Enrich messages with user data and translations
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        let senderName = "Unknown User"
        const senderLanguage = senderLanguages.get(message.senderId) || "en"

        try {
          const { data: senderData } = await supabase.auth.admin.getUserById(message.senderId)
          if (senderData.user) {
            senderName = senderData.user.user_metadata?.name || "Unknown User"
          }
        } catch (error) {
          console.error("Failed to fetch sender data:", error)
        }

        // Translate message content if needed
        let translatedContent = message.content
        if (message.messageType !== "SYSTEM" && message.messageType !== "DOCTOR_INTRO") {
          translatedContent = await translateMessage({
            messageId: message.id,
            text: message.content,
            sourceLanguage: senderLanguage,
            targetLanguage: userLanguage,
          })
        }

        return {
          ...message,
          content: translatedContent,
          originalContent: message.content,
          senderName,
          senderLanguage,
          read_by: message.reads.map((r) => r.userId),
          prescription_data: message.prescription
            ? {
              medications: message.prescription.medications,
            }
            : null,
        }
      }),
    )

    // Get typing user names from Supabase Auth
    const typingUserNames = await Promise.all(
      typingIndicators.map(async (indicator) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(indicator.userId)
          return userData.user?.user_metadata?.name || "Unknown User"
        } catch (error) {
          console.error("Failed to fetch typing user data:", error)
          return "Unknown User"
        }
      }),
    )

    return NextResponse.json({
      messages: enrichedMessages,
      typingUsers: typingUserNames.filter(Boolean),
      userLanguage,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const consultationId = params.id
  const { content, senderId, type } = await request.json()

  try {
    if (type === "typing") {
      if (content) {
        // Add/update typing indicator
        await prisma.typingIndicator.upsert({
          where: {
            consultationId_userId: {
              consultationId,
              userId: senderId,
            },
          },
          update: {
            updatedAt: new Date(),
          },
          create: {
            consultationId,
            userId: senderId,
          },
        })
      } else {
        // Remove typing indicator
        await prisma.typingIndicator.deleteMany({
          where: {
            consultationId,
            userId: senderId,
          },
        })
      }
      return NextResponse.json({ success: true })
    }

    if (type === "message") {
      const message = await prisma.message.create({
        data: {
          consultationId,
          senderId,
          content,
        },
      })

      // Mark as read by sender
      await prisma.messageRead.create({
        data: {
          messageId: message.id,
          userId: senderId,
        },
      })

      // Get sender data from Supabase Auth
      let senderName = "Unknown User"
      let senderLanguage = "en"

      try {
        const { data: senderData } = await supabase.auth.admin.getUserById(senderId)
        if (senderData.user) {
          senderName = senderData.user.user_metadata?.name || "Unknown User"
          senderLanguage = senderData.user.user_metadata?.language || "en"
        }
      } catch (error) {
        console.error("Failed to fetch sender data:", error)
      }

      return NextResponse.json({
        message: {
          ...message,
          senderName,
          senderLanguage,
          originalContent: content,
        },
      })
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
