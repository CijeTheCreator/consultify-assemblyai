import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const messages: Array<{
  id: string
  content: string
  sender: string
  timestamp: number
  readBy: string[]
}> = []

let typingUsers: Array<{
  user: string
  timestamp: number
}> = []

export async function GET() {
  // Clean up old typing indicators (older than 3 seconds)
  const now = Date.now()
  typingUsers = typingUsers.filter((typing) => now - typing.timestamp < 3000)

  return NextResponse.json({
    messages,
    typingUsers: typingUsers.map((t) => t.user),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { content, sender, type } = body

  if (type === "typing") {
    // Update typing indicator
    typingUsers = typingUsers.filter((t) => t.user !== sender)
    if (content) {
      typingUsers.push({ user: sender, timestamp: Date.now() })
    }
    return NextResponse.json({ success: true })
  }

  if (type === "message") {
    const newMessage = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: Date.now(),
      readBy: [sender], // Sender has read their own message
    }

    messages.push(newMessage)
    return NextResponse.json(newMessage)
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
