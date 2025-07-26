// app/api/translate/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { translateMessage, getLanguageFromUserId } from "@/lib/translation"

export async function POST(request: NextRequest) {
  try {
    const { messageId, text, sourceLanguage, targetLanguage, userId } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    let finalTargetLanguage = targetLanguage

    // If userId is provided but no target language, get user's preferred language
    if (userId && !targetLanguage) {
      finalTargetLanguage = await getLanguageFromUserId(userId)
    }

    if (!finalTargetLanguage) {
      return NextResponse.json({ error: "Target language is required" }, { status: 400 })
    }

    const translatedText = await translateMessage({
      messageId: messageId || `temp-${Date.now()}`,
      text,
      sourceLanguage: sourceLanguage || "en",
      targetLanguage: finalTargetLanguage,
    })

    return NextResponse.json({
      translatedText,
      sourceLanguage: sourceLanguage || "en",
      targetLanguage: finalTargetLanguage,
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Translation failed" }, { status: 500 })
  }
}

// GET route for batch translation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const messageIds = searchParams.get("messageIds")?.split(",") || []
  const targetLanguage = searchParams.get("targetLanguage")
  const userId = searchParams.get("userId")

  if (!messageIds.length) {
    return NextResponse.json({ error: "Message IDs are required" }, { status: 400 })
  }

  let finalTargetLanguage = targetLanguage

  if (userId && !targetLanguage) {
    finalTargetLanguage = await getLanguageFromUserId(userId)
  }

  if (!finalTargetLanguage) {
    return NextResponse.json({ error: "Target language is required" }, { status: 400 })
  }

  try {
    const { prisma } = await import("@/lib/prisma")

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      select: {
        id: true,
        content: true,
        senderId: true,
      },
    })

    // Get sender languages
    const senderLanguages = new Map<string, string>()
    const senderIds = [...new Set(messages.map(msg => msg.senderId))]

    await Promise.all(
      senderIds.map(async (senderId) => {
        const language = await getLanguageFromUserId(senderId)
        senderLanguages.set(senderId, language)
      })
    )

    // Translate all messages
    const translations = await Promise.all(
      messages.map(async (message) => {
        const sourceLanguage = senderLanguages.get(message.senderId) || "en"
        const translatedContent = await translateMessage({
          messageId: message.id,
          text: message.content,
          sourceLanguage,
          targetLanguage: finalTargetLanguage,
        })

        return {
          messageId: message.id,
          originalText: message.content,
          translatedText: translatedContent,
          sourceLanguage,
          targetLanguage: finalTargetLanguage,
        }
      })
    )

    return NextResponse.json({
      translations,
      targetLanguage: finalTargetLanguage,
    })
  } catch (error) {
    console.error("Batch translation error:", error)
    return NextResponse.json({ error: "Batch translation failed" }, { status: 500 })
  }
}
