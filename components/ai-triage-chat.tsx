"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, ArrowLeft } from "lucide-react"
import type { User } from "@/lib/supabase"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface AITriageChatProps {
  currentUser: User
  consultationId?: string
  onTriageComplete: (consultationId: string) => void
  onBack: () => void
}

export default function AITriageChat({ currentUser, consultationId, onTriageComplete, onBack }: AITriageChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis votre assistant de santé IA. Je suis là pour comprendre vos symptômes et vous connecter avec le bon médecin. Qu'est-ce qui vous amène aujourd'hui ?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [currentConsultationId, setCurrentConsultationId] = useState(consultationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Créer une consultation si elle n'est pas fournie
  useEffect(() => {
    if (!currentConsultationId) {
      createAITriageConsultation()
    }
  }, [currentConsultationId])

  const createAITriageConsultation = async () => {
    try {
      const response = await fetch("/api/consultations/start-ai-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: currentUser.id }),
      })

      const data = await response.json()
      if (data.consultation) {
        setCurrentConsultationId(data.consultation.id)
      }
    } catch (error) {
      console.error("Échec de la création de la consultation de triage IA:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !currentConsultationId) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Préparer les messages pour l'IA
      const aiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch("/api/consultations/ai-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: aiMessages }),
      })

      const data = await response.json()

      if (data.response) {
        const aiMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, aiMessage])

        // Vérifier si le triage est terminé
        if (data.isComplete) {
          setIsComplete(true)
          await completeTriageAndConnectDoctor(data.response)
        }
      }
    } catch (error) {
      console.error("Échec d'obtention de la réponse IA:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Je suis désolé, j'ai des difficultés de connexion en ce moment. Veuillez réessayer.",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const completeTriageAndConnectDoctor = async (aiSummary: string) => {
    try {
      const response = await fetch("/api/consultations/complete-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: currentConsultationId,
          aiSummary,
        }),
      })

      const data = await response.json()

      if (data.consultation) {
        // Afficher le message de connexion
        const connectionMessage: Message = {
          role: "assistant",
          content: `Parfait ! En fonction de vos symptômes, je vous connecte avec Dr. ${data.doctor.name}${data.doctor.specialization ? ` (${data.doctor.specialization})` : ""}. Il/Elle sera avec vous sous peu pour discuter de vos préoccupations en détail.`,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, connectionMessage])

        // Transition vers le chat du médecin après un délai
        setTimeout(() => {
          onTriageComplete(data.consultation.id)
        }, 3000)
      }
    } catch (error) {
      console.error("Échec de la finalisation du triage:", error)
    }
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
                <AvatarFallback className="bg-blue-100">
                  <Bot className="w-6 h-6 text-blue-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Assistant de Santé IA</CardTitle>
                <p className="text-sm text-gray-600">Collecte de vos symptômes</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">En ligne</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={message.role === "user" ? "bg-blue-100" : "bg-green-100"}>
                    {message.role === "user" ? (
                      currentUser.name?.charAt(0).toUpperCase() || "U"
                    ) : (
                      <Bot className="w-4 h-4 text-green-600" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`rounded-lg px-3 py-2 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-white border text-gray-900"
                    }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-100">
                    <Bot className="w-4 h-4 text-green-600" />
                  </AvatarFallback>
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
          {!isComplete ? (
            <form onSubmit={sendMessage} className="flex w-full space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Décrivez vos symptômes..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <div className="w-full text-center">
              <p className="text-gray-600">Connexion avec un médecin...</p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mt-2"></div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
