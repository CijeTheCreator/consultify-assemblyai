"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Stethoscope,
  MessageCircle,
  Calendar,
  Globe,
  Users,
  Clock,
  Shield,
  ArrowRight,
  Heart,
  Zap,
  Languages,
} from "lucide-react"
import type { User } from "@/lib/supabase"

interface LandingPageProps {
  user?: User | null
  onStartConsultation: () => void
  onViewConsultations: () => void
  onSignUp?: () => void
}

export default function LandingPage({ user, onStartConsultation, onViewConsultations, onSignUp }: LandingPageProps) {
  const [stats, setStats] = useState({ consultations: 0, messages: 0, recentConsultations: [] })

  useEffect(() => {
    if (user) {
      // Fetch user stats (simplified for demo)
      setStats({
        consultations: 5,
        messages: 23,
        recentConsultations: [
          { id: 1, doctor: "Dr. Smith", specialty: "Cardiology", date: "2 days ago" },
          { id: 2, doctor: "Dr. Johnson", specialty: "General Medicine", date: "1 week ago" },
          { id: 3, doctor: "Dr. Williams", specialty: "Dermatology", date: "2 weeks ago" },
        ],
      })
    }
  }, [user])

  // Not signed in version
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-forest-green to-sage-green text-cream">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight font-sans">
                You Speak. We Translate. <br />
                <span className="text-olive-green">They Treat.</span>
              </h1>
              <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90 font-medium">
                Connect with specialized doctors in your native language. Get personalized medical care without language
                barriers – our AI agent matches you with the right doctor based on your symptoms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-cream text-forest-green hover:bg-olive-green hover:text-cream text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
                  onClick={onSignUp}
                >
                  Start Your Consultation Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cream text-cream hover:bg-cream hover:text-forest-green text-lg px-8 py-4 h-auto bg-transparent font-semibold transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-cream">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-forest-green mb-4">Healthcare in 3 Simple Steps</h2>
              <p className="text-xl text-sage-green max-w-2xl mx-auto font-medium">
                From symptoms to treatment, all in your preferred language
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-forest-green/20 transition-colors">
                  <MessageCircle className="w-10 h-10 text-forest-green" />
                </div>
                <div className="bg-forest-green text-cream rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-forest-green mb-3">Tell Our AI Agent</h3>
                <p className="text-sage-green font-medium">
                  Describe your symptoms in your native language to our intelligent AI health assistant
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-sage-green/30 transition-colors">
                  <Users className="w-10 h-10 text-sage-green" />
                </div>
                <div className="bg-sage-green text-cream rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-forest-green mb-3">Get Connected</h3>
                <p className="text-sage-green font-medium">
                  Instantly matched with a specialized doctor who understands your condition
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-olive-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-olive-green/30 transition-colors">
                  <Stethoscope className="w-10 h-10 text-olive-green" />
                </div>
                <div className="bg-olive-green text-cream rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-forest-green mb-3">Receive Expert Care</h3>
                <p className="text-sage-green font-medium">
                  Get expert medical advice translated perfectly into your language
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-forest-green mb-4">
                Breaking Down Language Barriers in Healthcare
              </h2>
              <p className="text-xl text-sage-green max-w-3xl mx-auto font-medium">
                Experience healthcare the way it should be – personal, accessible, and in your own words
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-all duration-300 border-sage-green/20 hover:border-forest-green/30">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-forest-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-forest-green mb-2">Personalized Matching</h3>
                  <p className="text-sage-green text-sm font-medium">
                    AI-powered symptom analysis connects you with the right specialist
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 border-sage-green/20 hover:border-forest-green/30">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Languages className="w-8 h-8 text-sage-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-forest-green mb-2">Native Language Support</h3>
                  <p className="text-sage-green text-sm font-medium">Speak comfortably in your preferred language</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 border-sage-green/20 hover:border-forest-green/30">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-olive-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-olive-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-forest-green mb-2">Instant Translation</h3>
                  <p className="text-sage-green text-sm font-medium">
                    Real-time, accurate medical translation both ways
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 border-sage-green/20 hover:border-forest-green/30">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-forest-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-forest-green mb-2">Specialized Care</h3>
                  <p className="text-sage-green text-sm font-medium">
                    Access to qualified doctors across multiple specialties
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="py-20 bg-gradient-to-r from-forest-green to-sage-green text-cream">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your Health, Your Language, Your Choice</h2>
            <p className="text-xl mb-8 opacity-90 font-medium">
              Join thousands who've already experienced barrier-free healthcare
            </p>
            <Button
              size="lg"
              className="bg-cream text-forest-green hover:bg-olive-green hover:text-cream text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
              onClick={onSignUp}
            >
              Start Your Consultation Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </div>
    )
  }

  // Signed in version
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-olive-green/10 to-sage-green/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-forest-green to-sage-green text-cream">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              Welcome Back, <span className="text-olive-green">{user.name}</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90 font-medium">
              Ready to connect with a doctor? Tell us what's bothering you today, and we'll find the perfect specialist
              who speaks your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-cream text-forest-green hover:bg-olive-green hover:text-cream text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
                onClick={onStartConsultation}
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Start a Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-cream text-cream hover:bg-cream hover:text-forest-green text-lg px-8 py-4 h-auto bg-transparent font-semibold transition-all duration-300"
                onClick={onViewConsultations}
              >
                <Calendar className="mr-2 w-5 h-5" />
                Previous Consultations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-forest-green mb-4">Continue Your Healthcare Journey</h2>
            <p className="text-lg text-sage-green font-medium">Pick up where you left off, {user.name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Consultations */}
            <Card className="lg:col-span-2 border-sage-green/20">
              <CardHeader>
                <CardTitle className="flex items-center text-forest-green">
                  <Clock className="w-5 h-5 mr-2 text-sage-green" />
                  Recent Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentConsultations.map((consultation: any) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-olive-green/10 transition-colors cursor-pointer border border-sage-green/10"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-forest-green text-cream">
                            {consultation.doctor
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-forest-green">{consultation.doctor}</p>
                          <p className="text-sm text-sage-green font-medium">{consultation.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-sage-green font-medium">{consultation.date}</p>
                        <Badge className="bg-sage-green/20 text-sage-green hover:bg-sage-green/30">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Preference */}
            <Card className="border-sage-green/20">
              <CardHeader>
                <CardTitle className="flex items-center text-forest-green">
                  <Languages className="w-5 h-5 mr-2 text-sage-green" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-forest-green mb-1">Language Preference</p>
                  <Badge className="bg-sage-green/20 text-sage-green">English</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-green mb-1">Recommended Specialists</p>
                  <div className="space-y-2">
                    <div className="text-sm text-sage-green font-medium">• Cardiology</div>
                    <div className="text-sm text-sage-green font-medium">• General Medicine</div>
                    <div className="text-sm text-sage-green font-medium">• Dermatology</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-forest-green mb-4">Fast Track to Care, {user.name}</h2>
            <p className="text-lg text-sage-green font-medium">
              Skip the wait – connect with specialists who understand your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30"
              onClick={onStartConsultation}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-forest-green/20 transition-colors">
                  <Zap className="w-8 h-8 text-forest-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Instant Consultation</h3>
                <p className="text-sage-green text-sm font-medium">Start talking to our AI agent about new symptoms</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sage-green/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-sage-green/30 transition-colors">
                  <Heart className="w-8 h-8 text-sage-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Favorite Doctors</h3>
                <p className="text-sage-green text-sm font-medium">Connect with doctors you've consulted before</p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30"
              onClick={onViewConsultations}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-olive-green/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-olive-green/30 transition-colors">
                  <Calendar className="w-8 h-8 text-olive-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Symptom History</h3>
                <p className="text-sage-green text-sm font-medium">Review your past consultations and treatments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-sage-green/20 hover:border-forest-green/30">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-forest-green/20 transition-colors">
                  <Shield className="w-8 h-8 text-forest-green" />
                </div>
                <h3 className="text-lg font-semibold text-forest-green mb-2">Emergency Support</h3>
                <p className="text-sage-green text-sm font-medium">24/7 access to urgent care specialists</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Personalized Dashboard Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-forest-green mb-4">Your Health Hub, {user.name}</h2>
          <p className="text-lg text-sage-green mb-8 font-medium">
            Everything you need for personalized healthcare in your preferred language
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-forest-green mb-2">{stats.consultations}</div>
                <div className="text-sm text-sage-green font-medium">Total Consultations</div>
              </CardContent>
            </Card>
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-sage-green mb-2">{stats.messages}</div>
                <div className="text-sm text-sage-green font-medium">Messages Sent</div>
              </CardContent>
            </Card>
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-olive-green mb-2">24/7</div>
                <div className="text-sm text-sage-green font-medium">Support Available</div>
              </CardContent>
            </Card>
            <Card className="border-sage-green/20">
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-forest-green mb-2">100+</div>
                <div className="text-sm text-sage-green font-medium">Doctors Available</div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-forest-green hover:bg-sage-green text-cream text-lg px-8 py-4 h-auto font-semibold transition-all duration-300"
              onClick={onStartConsultation}
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Start New Consultation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 h-auto bg-transparent border-forest-green text-forest-green hover:bg-forest-green hover:text-cream font-semibold transition-all duration-300"
              onClick={onViewConsultations}
            >
              <Calendar className="mr-2 w-5 h-5" />
              Previous Consultations
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
