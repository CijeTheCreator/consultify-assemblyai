// app/consultations/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"
import ConsultationChat from "@/components/consultation-chat"
import EnhancedAITriageChat from "@/components/enhanced-ai-triage-chat"
import Navbar from "@/components/navbar"
import { signOut, getUserDisplayInfo } from "@/lib/auth"

export default function EnhancedConsultationPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [consultation, setConsultation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const consultationId = params.id as string

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
      await fetchConsultation(consultationId)
    }

    checkAuthAndFetch()
  }, [consultationId, router])

  const fetchConsultation = async (id: string) => {
    try {
      const response = await fetch(`/api/consultations/${id}`)
      const data = await response.json()

      if (data.error) {
        console.error("Failed to fetch consultation:", data.error)
        router.push("/consultations")
        return
      }

      setConsultation(data.consultation)
    } catch (error) {
      console.error("Failed to fetch consultation:", error)
      router.push("/consultations")
    } finally {
      setLoading(false)
    }
  }

  const handleTriageComplete = async (newConsultationId: string) => {
    // Refresh consultation data after triage completion
    await fetchConsultation(newConsultationId)
  }

  const handleBack = () => {
    router.push("/consultations")
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <>
        {currentUser && <Navbar user={getUserDisplayInfo(currentUser)} onSignOut={handleSignOut} />}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading consultation...</p>
          </div>
        </div>
      </>
    )
  }

  if (!currentUser || !consultation) {
    return (
      <>
        {currentUser && <Navbar user={getUserDisplayInfo(currentUser)} onSignOut={handleSignOut} />}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Consultation not found</h2>
            <p className="text-gray-600 mb-4">
              The consultation you're looking for doesn't exist or you don't have access to it.
            </p>
            <button onClick={() => router.push("/consultations")} className="text-blue-600 hover:text-blue-800">
              Back to consultations
            </button>
          </div>
        </div>
      </>
    )
  }

  const user = {
    id: currentUser.id,
    email: currentUser.email || "",
    name: currentUser.user_metadata?.name || "",
    role: currentUser.user_metadata?.role || "patient",
    specialization: currentUser.user_metadata?.specialization,
    created_at: currentUser.created_at,
    language: currentUser.user_metadata?.language || "en",
  }

  // Show Enhanced AI triage chat (with voice option) if consultation is still in AI triage mode
  if (consultation.consultationType === "AI_TRIAGE" && consultation.aiTriageStatus !== "COMPLETED") {
    return (
      <>
        <Navbar user={user} onSignOut={handleSignOut} />
        <div className="pt-16">
          <EnhancedAITriageChat
            currentUser={user}
            consultationId={consultationId}
            onTriageComplete={handleTriageComplete}
            onBack={handleBack}
          />
        </div>
      </>
    )
  }

  // Show regular consultation chat for human doctor consultations
  return (
    <>
      <Navbar user={user} onSignOut={handleSignOut} />
      <div className="pt-16">
        <ConsultationChat
          consultationId={consultationId}
          currentUser={user}
          onBack={handleBack}
          fromAITriage={consultation.consultationType === "HUMAN" && consultation.triageSummary}
        />
      </div>
    </>
  )
}
