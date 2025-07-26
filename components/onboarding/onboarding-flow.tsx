"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProgressBar from "./progress-bar"
import LanguageSelection from "./language-selection"
import UserTypeSelection from "./user-type-selection"
import NameInput from "./name-input"
import EmailInput from "./email-input"
import { updateUserMetadata } from "@/lib/auth"

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    language: "",
    userType: "" as "doctor" | "patient" | "",
    name: "",
    email: "",
    specialization: "",
  })

  const totalSteps = 4

  const handleLanguageNext = (language: string) => {
    setOnboardingData((prev) => ({ ...prev, language }))
    setCurrentStep(2)
  }

  const handleUserTypeNext = (userType: "doctor" | "patient") => {
    setOnboardingData((prev) => ({ ...prev, userType }))
    setCurrentStep(3)
  }

  const handleNameNext = (name: string, specialization?: string) => {
    setOnboardingData((prev) => ({ ...prev, name, specialization: specialization || "" }))
    setCurrentStep(4)
  }

  const handleEmailComplete = async (email: string) => {
    const finalData = { ...onboardingData, email }

    // Update user metadata in Supabase
    await updateUserMetadata({
      language: finalData.language,
      role: finalData.userType,
      name: finalData.name,
      email: finalData.email,
      specialization: finalData.specialization,
      onboarding_completed: true,
    })

    onComplete()
  }

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  }

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  }

  return (
    <div className="relative">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="language"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <LanguageSelection onNext={handleLanguageNext} />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="usertype"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <UserTypeSelection onNext={handleUserTypeNext} />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="name"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <NameInput onNext={handleNameNext} userType={onboardingData.userType} />
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="email"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <EmailInput onComplete={handleEmailComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
