"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, Heart } from "lucide-react"

interface UserTypeSelectionProps {
  onNext: (userType: "doctor" | "patient") => void
}

export default function UserTypeSelection({ onNext }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<"doctor" | "patient" | null>(null)

  const handleNext = () => {
    if (selectedType) {
      onNext(selectedType)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20 flex flex-col items-center justify-center p-4 pt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-forest-green mb-4">How would you like to use Consultify?</h1>
        <p className="text-xl text-sage-green font-medium">Choose your role to get started</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mb-8"
      >
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg border-sage-green/20 ${selectedType === "doctor" ? "ring-2 ring-forest-green bg-forest-green/5" : ""
            }`}
          onClick={() => setSelectedType("doctor")}
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-sage-green" />
            </div>
            <h3 className="text-xl font-semibold text-forest-green mb-2">I'm a Doctor</h3>
            <p className="text-sage-green font-medium">
              Provide medical consultations and help patients with their health concerns
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-lg border-sage-green/20 ${selectedType === "patient" ? "ring-2 ring-forest-green bg-forest-green/5" : ""
            }`}
          onClick={() => setSelectedType("patient")}
        >
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-forest-green" />
            </div>
            <h3 className="text-xl font-semibold text-forest-green mb-2">I'm a Patient</h3>
            <p className="text-sage-green font-medium">
              Get medical advice and consultations from qualified healthcare professionals
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: selectedType ? 1 : 0.5 }} transition={{ duration: 0.3 }}>
        <Button
          onClick={handleNext}
          disabled={!selectedType}
          size="lg"
          className="px-8 bg-forest-green hover:bg-sage-green text-cream font-semibold transition-all duration-300"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}
