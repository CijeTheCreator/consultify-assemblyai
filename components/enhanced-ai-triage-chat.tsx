// components/enhanced-ai-triage-chat.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  Mic, 
  MessageSquare, 
  Loader2, 
  Volume2,
  Languages 
} from "lucide-react"
import type { User } from "@/lib/types"
import VoiceTriageInterface from "./voice-triage-interface"

interface AITriageChatProps {
  currentUser: User
  consultationId: string
  onTriageComplete: (consultationId: string) => void
  onBack: () => void
}

interface Message {
  id: string
  content: string
  isAI: boolean
  timestamp: Date
}

// Language translations
const translations = {
  en: {
    title: "AI Health Assessment",
    chooseMode: "Choose Assessment Mode",
    voiceMode: "Voice Assessment",
    textMode: "Text Assessment", 
    voiceDescription: "Speak with our AI assistant about your symptoms",
    textDescription: "Type and chat with our AI assistant",
    startVoice: "Start Voice Assessment",
    startText: "Start Text Assessment",
    typeMessage: "Describe your symptoms...",
    aiTyping: "AI is thinking...",
    switchToVoice: "Switch to Voice",
    switchToText: "Switch to Text",
    language: "Language"
  },
  fr: {
    title: "Évaluation Santé IA",
    chooseMode: "Choisir le Mode d'Évaluation",
    voiceMode: "Évaluation Vocale",
    textMode: "Évaluation Textuelle",
    voiceDescription: "Parlez avec notre assistant IA de vos symptômes",
    textDescription: "Tapez et chattez avec notre assistant IA",
    startVoice: "Commencer l'Évaluation Vocale",
    startText: "Commencer l'Évaluation Textuelle",
    typeMessage: "Décrivez vos symptômes...",
    aiTyping: "L'IA réfléchit...",
    switchToVoice: "Passer à la Voix",
    switchToText: "Passer au Texte",
    language: "Langue"
  }
}

export default function EnhancedAITriageChat({ 
  currentUser, 
  consultationId, 
  onTriageComplete, 
  onBack 
}: AITriageChatProps) {
  const [mode, setMode] = useState<'selection' | 'voice' | 'text'>('selection')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAITyping, setIsAITyping] = useState(false)
  const [language, setLanguage] = useState(currentUser.language || 'en')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const t = translations[language as keyof typeof translations] || translations.en

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with AI greeting when text mode is selected
  useEffect(() => {
    if (mode === 'text' && messages.length === 0) {
      const greeting = language === 'fr' 
        ? "Bonjour! Je suis votre assistant santé IA. Je suis là pour comprendre vos symptômes et vous connecter avec le bon médecin. Qu'est-ce qui vous amène ici aujourd'hui?"
        : "Hello! I'm your AI health assistant. I'm here to understand your symptoms and connect you with the right doctor. What brings you here today?"
      
      setMessages([{
        id: '1',
        content: greeting,
        isAI: true,
        timestamp: new Date()
      }])
    }
  }, [mode, language, messages.length])

  // Send message to AI
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isAI: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsAITyping(true)

    try {
      // Prepare messages for AI API
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.isAI ? 'assistant' : 'user',
        content: msg.content
      }))

      const response = await fetch('/api/consultations/ai-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: conversationMessages,
          language 
        })
      })

      const data = await response.json()
      
      if (data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isAI: true,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, aiMessage])

        // Check if triage is complete
        if (data.isComplete || data.response.includes('TRIAGE_COMPLETE')) {
          setTimeout(() => {
            onTriageComplete(consultationId)
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'fr' 
          ? "Désolé, j'ai rencontré un problème technique. Pouvez-vous réessayer?"
          : "Sorry, I encountered a technical issue. Could you please try again?",
        isAI: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsAITyping(false)
    }
  }

  // Mode Selection View
  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 pt-20">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Languages className="w-4 h-4 text-gray-600" />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-blue-600 mr-3" />
              <CardTitle className="text-2xl text-gray-900">
                {t.title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t.chooseMode}
              </h3>
              <p className="text-gray-600">
                {language === 'fr' 
                  ? "Choisissez comment vous préférez interagir avec notre assistant IA"
                  : "Choose how you'd prefer to interact with our AI assistant"
                }
              </p>
            </div>

            {/* Voice Mode Option */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" 
                  onClick={() => setMode('voice')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mic className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {t.voiceMode}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {t.voiceDescription}
                    </p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    {t.startVoice}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Text Mode Option */}
            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer"
                  onClick={() => setMode('text')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {t.textMode}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {t.textDescription}
                    </p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    {t.startText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Voice Mode View
  if (mode === 'voice') {
    return (
      <VoiceTriageInterface
        currentUser={currentUser}
        onTriageComplete={onTriageComplete}
        onBack={() => setMode('selection')}
        language={language}
      />
    )
  }

  // Text Mode View
  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <Card className="w-full max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setMode('selection')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  <Bot className="w-6 h-6 text-blue-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">AI Health Assistant</CardTitle>
                <p className="text-sm text-gray-600">{t.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('voice')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Mic className="w-4 h-4 mr-2" />
                {t.switchToVoice}
              </Button>
              <Badge variant="secondary">Text Mode</Badge>
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Languages className="w-3 h-3" />
                <span>{language.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAI ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  message.isAI ? "" : "flex-row-reverse space-x-reverse"
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {message.isAI ? (
                      <Bot className="w-5 h-5 text-blue-600" />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.isAI
                      ? "bg-white border text-gray-900"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isAITyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">{t.aiTyping}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.typeMessage}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
