"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"
import { getUserDisplayInfo, signOut } from "@/lib/auth"
import AuthForm from "@/components/auth/auth-form"
import OnboardingFlow from "@/components/onboarding/onboarding-flow"
import PatientLandingPage from "@/components/patient-landing-page"
import DoctorLandingPage from "@/components/doctor-landing-page"
import Navbar from "@/components/navbar"

type Page = "auth" | "onboarding" | "patient-landing" | "doctor-landing"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("auth")
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const authUser = user as AuthUser
        setCurrentUser(authUser)

        // Check if onboarding is completed
        if (authUser.user_metadata?.onboarding_completed) {
          if (authUser.user_metadata?.role === "doctor") {
            setCurrentPage("doctor-landing")
          } else {
            setCurrentPage("patient-landing")
          }
        } else {
          setCurrentPage("onboarding")
        }
      }
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = session.user as AuthUser
        setCurrentUser(authUser)

        if (authUser.user_metadata?.onboarding_completed) {
          if (authUser.user_metadata?.role === "doctor") {
            setCurrentPage("doctor-landing")
          } else {
            setCurrentPage("patient-landing")
          }
        } else {
          setCurrentPage("onboarding")
        }
      } else {
        setCurrentUser(null)
        setCurrentPage("auth")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthSuccess = () => {
    // Auth state change will be handled by the listener
  }

  const handleOnboardingComplete = () => {
    // Refresh user data after onboarding
    const refreshUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const authUser = user as AuthUser
        setCurrentUser(authUser)
        if (authUser.user_metadata?.role === "doctor") {
          setCurrentPage("doctor-landing")
        } else {
          setCurrentPage("patient-landing")
        }
      }
    }
    refreshUser()
  }

  const handleStartConsultation = async () => {
    if (!currentUser) return

    try {
      const response = await fetch("/api/consultations/start-ai-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: currentUser.id }),
      })

      const data = await response.json()
      if (data.consultation) {
        router.push(`/consultations/${data.consultation.id}`)
      }
    } catch (error) {
      console.error("Failed to start consultation:", error)
    }
  }

  const handleViewConsultations = () => {
    router.push("/consultations")
  }

  const handleSignOut = async () => {
    await signOut()
    setCurrentUser(null)
    setCurrentPage("auth")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green mx-auto mb-4"></div>
          <p className="text-sage-green font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentPage !== "auth" && currentUser) {
    const user = getUserDisplayInfo(currentUser)
    return (
      <>
        <Navbar user={user} onSignOut={handleSignOut} />
        <div className="pt-16">
          {currentPage === "auth" ? (
            <AuthForm onAuthSuccess={handleAuthSuccess} />
          ) : currentPage === "onboarding" ? (
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          ) : currentPage === "patient-landing" && currentUser ? (
            (() => {
              const user = getUserDisplayInfo(currentUser)
              return (
                <PatientLandingPage
                  user={user}
                  onStartConsultation={handleStartConsultation}
                  onViewConsultations={handleViewConsultations}
                />
              )
            })()
          ) : currentPage === "doctor-landing" && currentUser ? (
            (() => {
              const user = getUserDisplayInfo(currentUser)
              return <DoctorLandingPage user={user} onViewConsultations={handleViewConsultations} />
            })()
          ) : null}
        </div>
      </>
    )
  }

  if (currentPage === "auth") {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  if (currentPage === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  if (currentPage === "patient-landing" && currentUser) {
    const user = getUserDisplayInfo(currentUser)
    return (
      <PatientLandingPage
        user={user}
        onStartConsultation={handleStartConsultation}
        onViewConsultations={handleViewConsultations}
      />
    )
  }

  if (currentPage === "doctor-landing" && currentUser) {
    const user = getUserDisplayInfo(currentUser)
    return <DoctorLandingPage user={user} onViewConsultations={handleViewConsultations} />
  }

  return null
}
