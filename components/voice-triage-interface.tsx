// components/voice-triage-interface.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff,
  Loader2,
  Languages,
  Stethoscope,
  ArrowLeft
} from "lucide-react"
import { 
  Room, 
  RoomEvent, 
  Track, 
  RemoteTrack, 
  RemoteAudioTrack,
  LocalAudioTrack,
  createLocalAudioTrack 
} from 'livekit-client'
import type { User } from "@/lib/types"

interface VoiceTriageInterfaceProps {
  currentUser: User
  onTriageComplete: (consultationId: string) => void
  onBack: () => void
  language?: string
}

interface TriageSession {
  consultation: any
  roomName: string
  accessToken: string
  livekitUrl: string
}

const translations = {
  en: {
    title: "AI Voice Health Assessment",
    connecting: "Connecting to AI Assistant...",
    connected: "Connected to AI Assistant",
    disconnected: "Disconnected",
    muted: "Microphone muted",
    unmuted: "Microphone active",
    speakerOn: "Speaker on",
    speakerOff: "Speaker off",
    hangUp: "End session",
    microphonePermission: "Please allow microphone access to continue",
    connectionError: "Failed to connect. Please try again.",
    startSpeaking: "Start speaking when ready",
    listening: "AI is listening...",
    aiSpeaking: "AI is responding...",
    sessionEnded: "Session ended",
    instructions: "Speak clearly about your symptoms. The AI will ask follow-up questions to understand your condition better.",
    languageLabel: "Language",
    backToChat: "Back to Chat Options"
  },
  fr: {
    title: "Évaluation Vocale de Santé IA",
    connecting: "Connexion à l'Assistant IA...",
    connected: "Connecté à l'Assistant IA",
    disconnected: "Déconnecté",
    muted: "Microphone coupé",
    unmuted: "Microphone actif",
    speakerOn: "Haut-parleur activé",
    speakerOff: "Haut-parleur désactivé",
    hangUp: "Terminer la session",
    microphonePermission: "Veuillez autoriser l'accès au microphone pour continuer",
    connectionError: "Échec de la connexion. Veuillez réessayer.",
    startSpeaking: "Commencez à parler quand vous êtes prêt",
    listening: "L'IA écoute...",
    aiSpeaking: "L'IA répond...",
    sessionEnded: "Session terminée",
    instructions: "Parlez clairement de vos symptômes. L'IA posera des questions de suivi pour mieux comprendre votre état.",
    languageLabel: "Langue",
    backToChat: "Retour aux Options de Chat"
  }
}

export default function VoiceTriageInterface({ 
  currentUser, 
  onTriageComplete, 
  onBack,
  language = "en" 
}: VoiceTriageInterfaceProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [session, setSession] = useState<TriageSession | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  const roomRef = useRef<Room | null>(null)
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const t = translations[language as keyof typeof translations] || translations.en

  // Initialize voice triage session
  const initializeSession = useCallback(async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Check for existing session first
      const existingResponse = await fetch(
        `/api/consultations/start-voice-triage?patientId=${currentUser.id}`
      )
      
      let sessionData: TriageSession

      if (existingResponse.ok) {
        const data = await existingResponse.json()
        if (data.session) {
          sessionData = data.session
        } else {
          // Create new session
          const response = await fetch('/api/consultations/start-voice-triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              patientId: currentUser.id, 
              language 
            })
          })

          if (!response.ok) {
            throw new Error('Failed to create triage session')
          }

          sessionData = await response.json()
        }
      } else {
        throw new Error('Failed to check for existing session')
      }

      setSession(sessionData)
      await connectToRoom(sessionData)
    } catch (error) {
      console.error('Failed to initialize session:', error)
      setConnectionError(t.connectionError)
    } finally {
      setIsConnecting(false)
    }
  }, [currentUser.id, language, t.connectionError])

  // Connect to LiveKit room
  const connectToRoom = useCallback(async (sessionData: TriageSession) => {
    try {
      const room = new Room()
      roomRef.current = room

      // Set up room event listeners
      room.on(RoomEvent.Connected, () => {
        console.log('Connected to room')
        setIsConnected(true)
      })

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room')
        setIsConnected(false)
        setIsListening(false)
        setIsAiSpeaking(false)
      })

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          const audioTrack = track as RemoteAudioTrack
          const audioElement = audioTrack.attach()
          audioElement.autoplay = true
          audioElementRef.current = audioElement
          
          // Monitor audio activity for AI speaking detection
          audioTrack.on('audioPlaybackStarted', () => {
            setIsAiSpeaking(true)
            setIsListening(false)
          })
          
          audioTrack.on('audioPlaybackFinished', () => {
            setIsAiSpeaking(false)
            setTimeout(() => setIsListening(true), 500) // Brief delay before listening
          })
        }
      })

      room.on(RoomEvent.DataReceived, (data: Uint8Array) => {
        try {
          const message = JSON.parse(new TextDecoder().decode(data))
          
          if (message.type === 'triage_complete') {
            // Triage completed, transition to human doctor
            setTimeout(() => {
              onTriageComplete(sessionData.consultation.id)
            }, 2000) // Give time for final message
          }
        } catch (error) {
          console.error('Error parsing data message:', error)
        }
      })

      // Connect to room
      await room.connect(sessionData.livekitUrl, sessionData.accessToken)

      // Enable microphone
      await enableMicrophone()

    } catch (error) {
      console.error('Failed to connect to room:', error)
      setConnectionError(t.connectionError)
    }
  }, [t.connectionError, onTriageComplete])

  // Enable microphone
  const enableMicrophone = useCallback(async () => {
    try {
      const audioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      })
      
      localAudioTrackRef.current = audioTrack
      
      if (roomRef.current) {
        await roomRef.current.localParticipant.publishTrack(audioTrack)
        setIsListening(true)
      }
    } catch (error) {
      console.error('Failed to enable microphone:', error)
      setConnectionError(t.microphonePermission)
    }
  }, [t.microphonePermission])

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (localAudioTrackRef.current) {
      const enabled = !localAudioTrackRef.current.isMuted
      await localAudioTrackRef.current.setMuted(enabled)
      setIsMuted(enabled)
      setIsListening(!enabled && isConnected)
    }
  }, [isConnected])

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.muted = isSpeakerOn
      setIsSpeakerOn(!isSpeakerOn)
    }
  }, [isSpeakerOn])

  // End session
  const endSession = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect()
    }
    
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop()
    }
    
    setIsConnected(false)
    setSession(null)
    onBack()
  }, [onBack])

  // Initialize session on mount
  useEffect(() => {
    initializeSession()
    
    return () => {
      // Cleanup on unmount
      if (roomRef.current) {
        roomRef.current.disconnect()
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop()
      }
    }
  }, [initializeSession])

  // Get status message
  const getStatusMessage = () => {
    if (connectionError) return connectionError
    if (isConnecting) return t.connecting
    if (!isConnected) return t.disconnected
    if (isAiSpeaking) return t.aiSpeaking
    if (isListening && !isMuted) return t.listening
    if (isMuted) return t.muted
    return t.connected
  }

  // Get status color
  const getStatusColor = () => {
    if (connectionError) return "bg-red-100 text-red-800"
    if (isConnecting) return "bg-yellow-100 text-yellow-800"
    if (!isConnected) return "bg-gray-100 text-gray-800"
    if (isAiSpeaking) return "bg-blue-100 text-blue-800"
    if (isListening) return "bg-green-100 text-green-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 pt-20">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToChat}
            </Button>
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4 text-gray-600" />
              <Badge variant="outline">{language.toUpperCase()}</Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-2">
            <Stethoscope className="w-8 h-8 text-blue-600 mr-3" />
            <CardTitle className="text-2xl text-gray-900">
              {t.title}
            </CardTitle>
          </div>
          
          <Badge className={`${getStatusColor()} text-sm px-3 py-1`}>
            {getStatusMessage()}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {t.instructions}
            </p>
          </div>

          {/* Voice Visualization */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? "border-green-400 bg-green-50 animate-pulse" 
                  : isAiSpeaking
                  ? "border-blue-400 bg-blue-50 animate-bounce"
                  : "border-gray-300 bg-gray-50"
              }`}>
                {isConnecting ? (
                  <Loader2 className="w-12 h-12 text-gray-600 animate-spin" />
                ) : (
                  <Mic className={`w-12 h-12 ${
                    isMuted 
                      ? "text-red-500" 
                      : isListening 
                      ? "text-green-600" 
                      : "text-gray-600"
                  }`} />
                )}
              </div>
              
              {/* Audio waves animation when AI is speaking */}
              {isAiSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border-2 border-blue-300 animate-ping opacity-30"></div>
                  <div className="absolute w-36 h-36 rounded-full border-2 border-blue-400 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              onClick={toggleMicrophone}
              disabled={!isConnected}
              className="w-16 h-16 rounded-full"
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant={isSpeakerOn ? "outline" : "destructive"}
              size="lg"
              onClick={toggleSpeaker}
              disabled={!isConnected}
              className="w-16 h-16 rounded-full"
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={endSession}
              className="w-16 h-16 rounded-full"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          {/* Error handling */}
          {connectionError && (
            <div className="text-center">
              <Button 
                onClick={initializeSession} 
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.connecting}
                  </>
                ) : (
                  "Try Again"
                )}
              </Button>
            </div>
          )}

          {/* Status indicators */}
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${!isMuted ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{!isMuted ? 'Mic On' : 'Mic Off'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isSpeakerOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isSpeakerOn ? 'Audio On' : 'Audio Off'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
