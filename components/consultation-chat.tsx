"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Check, CheckCheck, Send, Pill, Languages } from "lucide-react"
import type { User } from "@/lib/types"
import PrescriptionModal from "./prescription-modal"
import PrescriptionCard from "./prescription-card"

interface ConsultationChatProps {
  consultationId: string
  currentUser: User
  onBack: () => void
  fromAITriage?: boolean
}

// Translation object
const translations = {
  en: {
    loading: "Loading...",
    patient: "patient",
    doctor: "doctor",
    connectedViaAI: "Connected via AI Triage",
    typeMessage: "Type your message...",
    sendPrescription: "Send Prescription",
    welcomeMessage: "You've been connected to your doctor. Your symptoms have been reviewed.",
    failedToFetch: "Failed to fetch messages:",
    failedToSend: "Failed to send message:",
    failedToSendTyping: "Failed to send typing indicator:",
    failedToMarkRead: "Failed to mark message as read:",
    failedToSendPrescription: "Failed to send prescription:",
    otherUser: "Other User",
    translating: "Translating..."
  },
  fr: {
    loading: "Chargement...",
    patient: "patient",
    doctor: "médecin",
    connectedViaAI: "Connecté via Triage IA",
    typeMessage: "Tapez votre message...",
    sendPrescription: "Envoyer l'ordonnance",
    welcomeMessage: "Vous avez été connecté à votre médecin. Vos symptômes ont été examinés.",
    failedToFetch: "Échec de la récupération des messages:",
    failedToSend: "Échec de l'envoi du message:",
    failedToSendTyping: "Échec de l'envoi de l'indicateur de saisie:",
    failedToMarkRead: "Échec du marquage du message comme lu:",
    failedToSendPrescription: "Échec de l'envoi de l'ordonnance:",
    otherUser: "Autre utilisateur",
    translating: "Traduction..."
  }
}

export default function ConsultationChat({ consultationId, currentUser, onBack, fromAITriage }: ConsultationChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [otherParticipant, setOtherParticipant] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  // Translation state
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({})
  const [translatingMessages, setTranslatingMessages] = useState<Set<string>>(new Set())
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(new Set())
  const [lastProcessedCount, setLastProcessedCount] = useState(0)

  // Get translations based on user role
  const t = currentUser.role === "doctor" ? translations.en : translations.fr

  // Get user languages
  const currentUserLanguage = currentUser.role === "doctor" ? "en" : "fr"
  const otherUserLanguage = currentUser.role === "doctor" ? "fr" : "en"

  // Translation function
  const translateMessage = async (messageId: string, text: string, sourceLanguage: string, targetLanguage: string) => {
    if (translatingMessages.has(messageId) || translatedMessages[messageId]) {
      return
    }

    setTranslatingMessages(prev => new Set(prev).add(messageId))

    try {
      const response = await fetch('/api/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage
        })
      })

      const data = await response.json()

      if (data.translatedText) {
        setTranslatedMessages(prev => ({
          ...prev,
          [messageId]: data.translatedText
        }))
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setTranslatingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  // Process messages for translation - FIXED VERSION
  const processMessagesForTranslation = (messages: any[]) => {
    messages.forEach(message => {
      // Skip if already processed, is current user's message, or is prescription
      if (processedMessages.has(message.id) ||
        message.senderId === currentUser.id ||
        message.messageType === "PRESCRIPTION") {
        return
      }

      // Double-check if translation already exists or is in progress
      if (translatedMessages[message.id] || translatingMessages.has(message.id)) {
        // Mark as processed even if we're not translating (already done)
        setProcessedMessages(prev => new Set(prev).add(message.id))
        return
      }

      // Mark as processed immediately to prevent re-processing
      setProcessedMessages(prev => new Set(prev).add(message.id))

      // Translate the message
      translateMessage(message.id, message.content, otherUserLanguage, currentUserLanguage)
    })
  }

  // Fetch messages and typing indicators - FIXED VERSION
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}/messages?userId=${currentUser.id}`)
      const data = await response.json()

      const newMessages = data.messages || []

      // Only update and process if messages actually changed
      if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
        setMessages(newMessages)

        // Only process messages that are actually new
        const newMessagesOnly = newMessages.slice(lastProcessedCount)
        if (newMessagesOnly.length > 0) {
          processMessagesForTranslation(newMessagesOnly)
          setLastProcessedCount(newMessages.length)
        }
      }

      setTypingUsers(data.typingUsers || [])

      // Set other participant from first message that's not from current user
      if (newMessages.length > 0 && !otherParticipant) {
        const otherUserMessage = newMessages.find((m: any) => m.senderId !== currentUser.id)
        if (otherUserMessage?.senderName) {
          setOtherParticipant({
            id: otherUserMessage.senderId,
            name: otherUserMessage.senderName,
            specialization: "", // Could be enhanced to fetch this
          })
        }
      }
    } catch (error) {
      console.error(t.failedToFetch, error)
    }
  }

  useEffect(() => {
    if (fromAITriage && messages.length > 0) {
      // Show a brief welcome message about the transition
      const welcomeMessage = t.welcomeMessage
      // This could be shown as a system message or notification
    }
  }, [fromAITriage, messages, t.welcomeMessage])

  // Send typing indicator
  const sendTypingIndicator = async (isTyping: boolean) => {
    try {
      await fetch(`/api/consultations/${consultationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "typing",
          senderId: currentUser.id,
          content: isTyping,
        }),
      })
    } catch (error) {
      console.error(t.failedToSendTyping, error)
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
          userId: currentUser.id,
        }),
      })
    } catch (error) {
      console.error(t.failedToMarkRead, error)
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

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
      setIsTyping(false)
      sendTypingIndicator(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      await fetch(`/api/consultations/${consultationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "message",
          content: input,
          senderId: currentUser.id,
        }),
      })

      setInput("")
      fetchMessages()
    } catch (error) {
      console.error(t.failedToSend, error)
    }
  }

  const sendPrescription = async (medications: any[]) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}/prescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: currentUser.id,
          patientId: otherParticipant?.id,
          medications,
        }),
      })

      if (response.ok) {
        fetchMessages()
      }
    } catch (error) {
      console.error(t.failedToSendPrescription, error)
    }
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Mark messages as read when they come into view
  useEffect(() => {
    messages.forEach((message) => {
      if (message.senderId !== currentUser.id && !message.read_by?.includes(currentUser.id)) {
        markAsRead(message.id)
      }
    })
  }, [messages, currentUser.id])

  // Polling for real-time updates
  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [consultationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUsers])

  const getReadReceiptIcon = (message: any) => {
    if (message.senderId !== currentUser.id) return null

    const readByOthers = message.read_by?.filter((userId: string) => userId !== currentUser.id) || []
    if (readByOthers.length > 0) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />
    }
    return <Check className="w-4 h-4 text-gray-400" />
  }

  // Helper function to determine if message is from current user
  const isCurrentUserMessage = (message: any) => {
    return message.senderId === currentUser.id
  }

  // Helper function to get sender name for display
  const getSenderName = (message: any) => {
    if (message.senderId === currentUser.id) {
      return currentUser.name
    }
    return message.senderName || otherParticipant?.name || t.otherUser
  }

  // Helper function to get message content (translated or original)
  const getMessageContent = (message: any) => {
    if (message.senderId === currentUser.id) {
      // Show original content for current user's messages
      return message.content
    }

    // For other user's messages, show translated content if available
    if (translatedMessages[message.id]) {
      return translatedMessages[message.id]
    }

    // If translating, show loading indicator
    if (translatingMessages.has(message.id)) {
      return t.translating
    }

    // Fallback to original content
    return message.content
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <Card className="w-full max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {otherParticipant?.name?.charAt(0).toUpperCase() || (currentUser.role === "patient" ? "Dr" : "P")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {currentUser.role === "patient" ? "Dr. " : ""}
                  {otherParticipant?.name || t.loading}
                </CardTitle>
                {otherParticipant?.specialization && (
                  <p className="text-sm text-gray-600">{otherParticipant.specialization}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{t[currentUser.role as keyof typeof t] || currentUser.role}</Badge>
              {fromAITriage && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">{t.connectedViaAI}</div>
              )}
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center space-x-1">
                <Languages className="w-3 h-3" />
                <span>{currentUserLanguage.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${isCurrentUserMessage(message) ? "justify-end" : "justify-start"}`}>
              {message.messageType === "PRESCRIPTION" ? (
                <div className="w-full max-w-md">
                  <PrescriptionCard
                    medications={message.prescription_data?.medications || []}
                    doctorName={getSenderName(message)}
                    patientName={isCurrentUserMessage(message) ? otherParticipant?.name || "Patient" : currentUser.name}
                    timestamp={message.createdAt}
                    language={currentUser.role === "doctor" ? "en" : "fr"}
                  />
                </div>
              ) : (
                <div
                  className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUserMessage(message) ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getSenderName(message).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`rounded-lg px-3 py-2 ${isCurrentUserMessage(message) ? "bg-blue-500 text-white" : "bg-white border text-gray-900"
                      }`}
                  >
                    <div className="flex items-start space-x-2">
                      <p className="text-sm flex-1">{getMessageContent(message)}</p>
                      {!isCurrentUserMessage(message) && translatedMessages[message.id] && (
                        <Languages className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {getReadReceiptIcon(message)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{typingUsers[0]?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="bg-white border rounded-lg px-3 py-2">
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

        <CardFooter className="p-4 border-t">
          <div className="flex w-full space-x-2">
            <form onSubmit={sendMessage} className="flex flex-1 space-x-2">
              <Input value={input} onChange={handleInputChange} placeholder={t.typeMessage} className="flex-1" />
              <Button type="submit" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {currentUser.role === "doctor" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPrescriptionModal(true)}
                className="whitespace-nowrap"
              >
                <Pill className="w-4 h-4 mr-2" />
                {t.sendPrescription}
              </Button>
            )}
          </div>

          <PrescriptionModal
            isOpen={showPrescriptionModal}
            onClose={() => setShowPrescriptionModal(false)}
            onSend={sendPrescription}
            patientName={otherParticipant?.name || "Patient"}
          />
        </CardFooter>
      </Card>
    </div>
  )
}
