"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, CheckCheck, Send } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: string
  timestamp: number
  readBy: string[]
}

interface ChatInterfaceProps {
  currentUser: string
}

export default function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Fetch messages and typing indicators
  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages")
      const data = await response.json()
      setMessages(data.messages || [])
      setTypingUsers(data.typingUsers?.filter((user: string) => user !== currentUser) || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  // Send typing indicator
  const sendTypingIndicator = async (isTyping: boolean) => {
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "typing",
          sender: currentUser,
          content: isTyping,
        }),
      })
    } catch (error) {
      console.error("Failed to send typing indicator:", error)
    }
  }

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          userId: currentUser,
        }),
      })
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

  // Handle input change with typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      sendTypingIndicator(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingIndicator(false)
    }, 1000)
  }

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    try {
      // Stop typing indicator
      setIsTyping(false)
      sendTypingIndicator(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "message",
          content: input,
          sender: currentUser,
        }),
      })

      setInput("")
      fetchMessages()
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Mark messages as read when they come into view
  useEffect(() => {
    messages.forEach((message) => {
      if (message.sender !== currentUser && !message.readBy.includes(currentUser)) {
        markAsRead(message.id)
      }
    })
  }, [messages, currentUser])

  // Polling for real-time updates
  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUsers])

  const getReadReceiptIcon = (message: Message) => {
    if (message.sender !== currentUser) return null

    const readByOthers = message.readBy.filter((user) => user !== currentUser)
    if (readByOthers.length > 0) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />
    }
    return <Check className="w-4 h-4 text-gray-400" />
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Chat Room</span>
          <Badge variant="secondary">{currentUser}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.sender === currentUser ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{message.sender.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div
                className={`rounded-lg px-3 py-2 ${message.sender === currentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {getReadReceiptIcon(message)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{typingUsers[0].charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="bg-gray-200 rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4">
        <form onSubmit={sendMessage} className="flex w-full space-x-2">
          <Input value={input} onChange={handleInputChange} placeholder="Type your message..." className="flex-1" />
          <Button type="submit" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
