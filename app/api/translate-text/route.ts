// app/api/translate-text/route.ts
import { NextRequest, NextResponse } from "next/server"
import { LingoDotDevEngine } from "lingo.dev/sdk"
import { prisma } from "@/lib/prisma"

const lingoDotDev = new LingoDotDevEngine({
  apiKey: process.env.LINGO_DEV_API_KEY || "your-api-key-here",
})


export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json()

    // Validate required fields
    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: text, sourceLanguage, targetLanguage" },
        { status: 400 }
      )
    }

    // First, check if translation exists in cache
    const cachedTranslation = await prisma.translationCache.findUnique({
      where: {
        text_sourceLanguage_targetLanguage: {
          text,
          sourceLanguage,
          targetLanguage,
        },
      },
    })

    if (cachedTranslation) {
      console.log("🎯 Translation retrieved from database cache")
      return NextResponse.json({ translatedText: cachedTranslation.translatedText })
    }

    // If not in cache, perform translation using lingo.dev
    console.log("🌐 Fetching translation from lingo.dev API")
    const result = await lingoDotDev.localizeText(text, {
      sourceLocale: sourceLanguage,
      targetLocale: targetLanguage,
    })

    // Cache the translation result
    await prisma.translationCache.create({
      data: {
        text,
        sourceLanguage,
        targetLanguage,
        translatedText: result,
      },
    })

    console.log("💾 Translation cached to database")

    return NextResponse.json({ translatedText: result })
  } catch (error) {
    console.log("Translation error:", error.message)
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    )
  }
}
