"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Stethoscope, MessageCircle, Users, Activity, FileText, TrendingUp, Bot, UserIcon } from "lucide-react"
import { AuroraText } from "@/components/magicui/aurora-text"
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Pointer } from "@/components/magicui/pointer"
import { NumberTicker } from "@/components/magicui/number-ticker"

interface User {
  id: string
  name: string
  language: string
  specialization: string
}

interface DoctorLandingPageProps {
  user: User
  onViewConsultations: () => void
}

interface DoctorStats {
  consultations: number
  messages: number
  recentConsultations: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    consultationType: string
  }>
}

export default function DoctorLandingPage({
  user = { id: "1", name: "Smith", language: "en", specialization: "Cardiology" },
  onViewConsultations = () => console.log("View consultations")
}: DoctorLandingPageProps) {
  const [stats, setStats] = useState<DoctorStats>({
    consultations: 47,
    messages: 128,
    recentConsultations: [
      {
        id: "1",
        title: "Heart Rhythm Analysis",
        status: "Active",
        createdAt: "2025-01-15T10:30:00Z",
        consultationType: "DOCTOR"
      },
      {
        id: "2",
        title: "Chest Pain Assessment",
        status: "Completed",
        createdAt: "2025-01-14T14:20:00Z",
        consultationType: "AI_TRIAGE"
      },
      {
        id: "3",
        title: "Blood Pressure Review",
        status: "Active",
        createdAt: "2025-01-13T09:15:00Z",
        consultationType: "DOCTOR"
      }
    ]
  })
  const [loading, setLoading] = useState(false)

  const getConsultationIcon = (consultationType: string) => {
    return consultationType === "AI_TRIAGE" ? (
      <Bot className="w-4 h-4 text-blue-600" />
    ) : (
      <UserIcon className="w-4 h-4 text-green-600" />
    )
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

  const colors = ["#2EFF5D", "#A9FF9C", "#FFF6B0", "#FFFFFF"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFAE0" }}>

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#0A400C" }}>
        <InteractiveGridPattern
          className="absolute inset-0 opacity-20"
          width={80}
          height={80}
          squares={[24, 24]}
          squaresClassName="fill-white/10"
        />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="mb-6 text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              Welcome,
              <AuroraText
                className="ml-4 text-3xl sm:text-5xl font-bold mb-4 leading-tight"
                colors={colors}
              >
                {" "} Dr. {user.name}
              </AuroraText>
            </div>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
              Your patients are waiting. Manage consultations, review cases, and provide expert care through our
              multilingual platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RainbowButton
                size="lg"
                className="text-lg px-8 py-4 h-auto font-semibold"
                onClick={onViewConsultations}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                View Patient Consultations
              </RainbowButton>
              <RainbowButton
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto font-semibold"
              >
                <Activity className="mr-2 w-5 h-5" />
                Practice Analytics
              </RainbowButton>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Overview */}
      <section className="py-16" style={{ backgroundColor: "#FEFAE0" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Your Practice Dashboard</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>
              Specializing in {user.specialization} • Serving patients worldwide
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Patient Consultations */}
            <Card className="lg:col-span-2 relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#819067"
                colorTo="#B1AB86"
                size={50}
                duration={6}
              />
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "#0A400C" }}>
                  <Users className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
                  Recent Patient Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "#0A400C" }}></div>
                    <p style={{ color: "#819067" }}>Loading consultations...</p>
                  </div>
                ) : stats.recentConsultations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium" style={{ color: "#819067" }}>No patient consultations yet</p>
                    <p className="text-sm text-gray-500">
                      Patients will be assigned to you based on your specialization
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg hover:opacity-80 transition-colors cursor-pointer border"
                        style={{ borderColor: "#819067" }}
                        onClick={onViewConsultations}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback style={{ backgroundColor: "#0A400C", color: "#FEFAE0" }}>
                              {getConsultationIcon(consultation.consultationType)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold" style={{ color: "#0A400C" }}>{consultation.title}</p>
                            <p className="text-sm font-medium" style={{ color: "#819067" }}>
                              {consultation.consultationType === "AI_TRIAGE"
                                ? "AI Triage Complete"
                                : "Direct Consultation"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: "#819067" }}>
                            {new Date(consultation.createdAt).toLocaleDateString()}
                          </p>
                          <Badge className={getStatusColor(consultation.status)}>{consultation.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Profile */}
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={50}
                duration={8}
              />
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "#0A400C" }}>
                  <Stethoscope className="w-5 h-5 mr-2" style={{ color: "#819067" }} />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Specialization</p>
                  <Badge style={{ backgroundColor: "#819067", color: "#FEFAE0" }}>{user.specialization}</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Language</p>
                  <Badge style={{ backgroundColor: "#0A400C", color: "#FEFAE0" }}>
                    {user.language === "en" ? "English" : user.language}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Account Type</p>
                  <Badge style={{ backgroundColor: "#B1AB86", color: "#0A400C" }}>Medical Professional</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#0A400C" }}>Available Features</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Patient Consultations</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• Prescription Management</div>
                    <div className="text-sm font-medium" style={{ color: "#819067" }}>• AI Triage Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Practice Tools */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Practice Management Tools</h2>
            <p className="text-lg font-medium" style={{ color: "#819067" }}>Everything you need to provide excellent patient care</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              style={{ borderColor: "#819067" }}
              onClick={onViewConsultations}
            >
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#819067"
                size={40}
                duration={4}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#0A400C" }}>
                  <MessageCircle className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Active Consultations</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Manage ongoing patient conversations</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#819067"
                colorTo="#B1AB86"
                size={40}
                duration={5}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#819067" }}>
                  <FileText className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Prescriptions</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Create and manage patient prescriptions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={40}
                duration={6}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#B1AB86" }}>
                  <TrendingUp className="w-8 h-8" style={{ color: "#0A400C" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>Analytics</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Track your practice performance</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#B1AB86"
                size={40}
                duration={7}
              />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-colors" style={{ backgroundColor: "#0A400C" }}>
                  <Bot className="w-8 h-8" style={{ color: "#FEFAE0" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A400C" }}>AI Triage Review</h3>
                <p className="text-sm font-medium" style={{ color: "#819067" }}>Review AI-processed patient cases</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Practice Stats */}
      <section className="py-16" style={{ backgroundColor: "#FEFAE0" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A400C" }}>Your Practice Impact</h2>
          <p className="text-lg mb-8 font-medium" style={{ color: "#819067" }}>
            Making a difference in patients' lives through expert {user.specialization} care
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#819067"
                size={30}
                duration={3}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#0A400C" }}>
                  <NumberTicker value={stats.consultations} />
                </div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Patients Helped</div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#819067"
                colorTo="#B1AB86"
                size={30}
                duration={4}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#819067" }}>
                  <NumberTicker value={stats.messages} />
                </div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Messages Sent</div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#B1AB86"
                colorTo="#0A400C"
                size={30}
                duration={5}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#B1AB86" }}>4.9</div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Patient Rating</div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden" style={{ borderColor: "#819067" }}>
              <BorderBeam
                colorFrom="#0A400C"
                colorTo="#B1AB86"
                size={30}
                duration={6}
              />
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold mb-2" style={{ color: "#0A400C" }}>24/7</div>
                <div className="text-sm font-medium" style={{ color: "#819067" }}>Available</div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RainbowButton
              size="lg"
              className="text-lg px-8 py-4 h-auto font-semibold"
              onClick={onViewConsultations}
            >
              <Users className="mr-2 w-5 h-5" />
              View All Patients
            </RainbowButton>
            <RainbowButton
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 h-auto font-semibold"
            >
              <Activity className="mr-2 w-5 h-5" />
              Practice Analytics
            </RainbowButton>
          </div>
        </div>
      </section>
    </div>
  )
}
