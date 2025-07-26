import { type NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const response = await generateAIResponse(messages)

    return NextResponse.json({
      response,
      isComplete: response.includes("TRIAGE_COMPLETE"),
    })
  } catch (error) {
    console.error("AI triage error:", error)
    return NextResponse.json({ error: "Failed to process AI response" }, { status: 500 })
  }
}
