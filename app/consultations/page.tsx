"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, Clock, Bot, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"
import type { ConsultationWithRelations } from "@/lib/types"
import Navbar from "@/components/navbar"
import { signOut, getUserDisplayInfo } from "@/lib/auth"

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<ConsultationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      setCurrentUser(user as AuthUser)
      await fetchConsultations(user.id, user.user_metadata?.role || "patient")
    }

    checkAuthAndFetch()
  }, [router])

  const fetchConsultations = async (userId: string, userRole: string) => {
    try {
      const response = await fetch(`/api/consultations?userId=${userId}&userRole=${userRole}`)
      const data = await response.json()
      setConsultations(data.consultations || [])
    } catch (error) {
      console.error("Failed to fetch consultations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConsultationTypeIcon = (consultation: ConsultationWithRelations) => {
    if (consultation.consultationType === "AI_TRIAGE") {
      return <Bot className="w-4 h-4 text-blue-600" />
    }
    return <User className="w-4 h-4 text-green-600" />
  }

  const getOtherParticipantName = (consultation: ConsultationWithRelations) => {
    if (!currentUser) return "Unknown"
    return currentUser.user_metadata?.role === "patient"
      ? consultation.doctorName || "Unknown Doctor"
      : consultation.patientName || "Unknown Patient"
  }

  const getConsultationTitle = (consultation: ConsultationWithRelations) => {
    if (consultation.consultationType === "AI_TRIAGE") {
      return consultation.aiTriageStatus === "COMPLETED" ? "AI Triage - Completed" : "AI Triage - In Progress"
    }
    return consultation.title
  }

  const handleConsultationClick = (consultationId: string) => {
    router.push(`/consultations/${consultationId}`)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consultations...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentUser && <Navbar user={getUserDisplayInfo(currentUser)} onSignOut={handleSignOut} />}
      <div className="min-h-screen bg-gray-50 p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentUser?.user_metadata?.role === "patient" ? "Your Consultations" : "Patient Consultations"}
              </h1>
              <p className="text-gray-600">
                {consultations.length} consultation{consultations.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {/* Consultations List */}
          {consultations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No consultations yet</h3>
                <p className="text-gray-600">
                  {currentUser?.user_metadata?.role === "patient"
                    ? "Start your first consultation to connect with a doctor"
                    : "No patient consultations assigned yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => {
                const otherParticipantName = getOtherParticipantName(consultation)
                return (
                  <Card
                    key={consultation.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleConsultationClick(consultation.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>
                              {consultation.consultationType === "AI_TRIAGE" ? (
                                <Bot className="w-6 h-6 text-blue-600" />
                              ) : (
                                otherParticipantName.charAt(0).toUpperCase()
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getConsultationTitle(consultation)}
                              </h3>
                              <Badge className={getStatusColor(consultation.status)}>{consultation.status}</Badge>
                              {getConsultationTypeIcon(consultation)}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              {consultation.consultationType === "AI_TRIAGE" ? (
                                <div className="flex items-center space-x-1">
                                  <span>AI Health Assistant</span>
                                  {consultation.aiTriageStatus === "COMPLETED" && (
                                    <>
                                      <span>•</span>
                                      <span>Ready for doctor</span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <span>
                                    {currentUser?.user_metadata?.role === "patient" ? "Dr. " : ""}
                                    {otherParticipantName}
                                  </span>
                                  {currentUser?.user_metadata?.role === "patient" &&
                                    consultation.doctorSpecialization && (
                                      <>
                                        <span>•</span>
                                        <span>{consultation.doctorSpecialization}</span>
                                      </>
                                    )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>Started {new Date(consultation.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Open Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
