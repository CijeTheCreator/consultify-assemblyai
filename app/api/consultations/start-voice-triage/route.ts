// app/api/consultations/start-voice-triage/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ConsultationType, AITriageStatus, ConsultationStatus } from "@prisma/client"
import { RoomServiceClient, AccessToken, VideoGrant } from 'livekit-server-sdk'

// Initialize LiveKit client
const roomService = new RoomServiceClient(
 process.env.LIVEKIT_URL!,
 process.env.LIVEKIT_API_KEY!,
 process.env.LIVEKIT_API_SECRET!
)

export async function POST(request: NextRequest) {
 try {
   const { patientId, language = "en" } = await request.json()

   if (!patientId) {
     return NextResponse.json({ error: "Missing patientId" }, { status: 400 })
   }

   // Create AI voice triage consultation
   const consultation = await prisma.consultation.create({
     data: {
       patientId,
       doctorId: null, // No doctor assigned yet
       title: "AI Voice Health Assessment",
       status: ConsultationStatus.ACTIVE,
       consultationType: ConsultationType.AI_TRIAGE,
       aiTriageStatus: AITriageStatus.IN_PROGRESS,
     },
   })

   // Generate unique room name for this consultation
   const roomName = `voice-triage-${consultation.id}`

   // Create room metadata
   const metadata = JSON.stringify({
     consultationId: consultation.id,
     patientId,
     language,
     type: "voice-triage"
   })

   // Create LiveKit room
   try {
     await roomService.createRoom({
       name: roomName,
       metadata,
       maxParticipants: 2, // Patient + AI Agent
       emptyTimeout: 60 * 30, // 30 minutes timeout
     })
   } catch (error: any) {
     // Room might already exist, that's okay
     if (!error.message?.includes('already exists')) {
       console.error("Failed to create LiveKit room:", error)
       throw error
     }
   }

   // Generate access token for patient
   const accessToken = new AccessToken(
     process.env.LIVEKIT_API_KEY!,
     process.env.LIVEKIT_API_SECRET!,
     {
       identity: `patient-${patientId}`,
       name: `Patient`,
       metadata: JSON.stringify({ 
         userId: patientId, 
         role: "patient",
         language 
       })
     }
   )

   const grant = new VideoGrant({
     roomJoin: true,
     room: roomName,
     canPublish: true,
     canSubscribe: true,
     canPublishData: true,
   })

   accessToken.addGrant(grant)
   const token = accessToken.toJwt()

   // Add initial AI message to database
   await prisma.message.create({
     data: {
       consultationId: consultation.id,
       senderId: patientId,
       content: language === "fr" 
         ? "Bonjour! Je suis votre assistant santé IA. Je suis là pour comprendre vos symptômes et vous connecter avec le bon médecin. Qu'est-ce qui vous amène ici aujourd'hui?"
         : "Hello! I'm your AI health assistant. I'm here to understand your symptoms and connect you with the right doctor. What brings you here today?",
       messageType: "AI_TRIAGE",
     },
   })

   return NextResponse.json({
     consultation,
     roomName,
     accessToken: token,
     livekitUrl: process.env.LIVEKIT_URL!,
     language,
     connectionConfig: {
       iceServers: [
         { urls: "stun:eu-turn1.xirsys.com" },
         { 
           username: process.env.LIVEKIT_TURN_USERNAME,
           credential: process.env.LIVEKIT_TURN_PASSWORD,
           urls: [
             "turn:eu-turn1.xirsys.com:80?transport=udp",
             "turn:eu-turn1.xirsys.com:3478?transport=udp", 
             "turn:eu-turn1.xirsys.com:80?transport=tcp",
             "turn:eu-turn1.xirsys.com:3478?transport=tcp",
             "turns:eu-turn1.xirsys.com:443?transport=tcp",
             "turns:eu-turn1.xirsys.com:5349?transport=tcp"
           ]
         }
       ]
     }
   })
 } catch (error) {
   console.error("Database/LiveKit error:", error)
   return NextResponse.json({ error: "Internal server error" }, { status: 500 })
 }
}

// Get active voice triage session
export async function GET(request: NextRequest) {
 const { searchParams } = new URL(request.url)
 const patientId = searchParams.get("patientId")

 if (!patientId) {
   return NextResponse.json({ error: "Missing patientId" }, { status: 400 })
 }

 try {
   // Find active voice triage consultation
   const consultation = await prisma.consultation.findFirst({
     where: {
       patientId,
       consultationType: ConsultationType.AI_TRIAGE,
       aiTriageStatus: AITriageStatus.IN_PROGRESS,
       status: ConsultationStatus.ACTIVE
     },
     orderBy: { createdAt: 'desc' }
   })

   if (!consultation) {
     return NextResponse.json({ session: null })
   }

   const roomName = `voice-triage-${consultation.id}`

   // Check if room still exists
   try {
     const roomInfo = await roomService.listRooms([roomName])
     const room = roomInfo.find(r => r.name === roomName)

     if (!room) {
       // Room doesn't exist, mark consultation as completed
       await prisma.consultation.update({
         where: { id: consultation.id },
         data: { status: ConsultationStatus.COMPLETED }
       })
       return NextResponse.json({ session: null })
     }
   } catch (error) {
     console.error("Error checking room:", error)
     return NextResponse.json({ session: null })
   }

   // Generate new access token
   const accessToken = new AccessToken(
     process.env.LIVEKIT_API_KEY!,
     process.env.LIVEKIT_API_SECRET!,
     {
       identity: `patient-${patientId}`,
       name: `Patient`,
     }
   )

   const grant = new VideoGrant({
     roomJoin: true,
     room: roomName,
     canPublish: true,
     canSubscribe: true,
     canPublishData: true,
   })

   accessToken.addGrant(grant)
   const token = accessToken.toJwt()

   return NextResponse.json({
     session: {
       consultation,
       roomName,
       accessToken: token,
       livekitUrl: process.env.LIVEKIT_URL!,
       connectionConfig: {
         iceServers: [
           { urls: "stun:eu-turn1.xirsys.com" },
           { 
             username: process.env.LIVEKIT_TURN_USERNAME,
             credential: process.env.LIVEKIT_TURN_PASSWORD,
             urls: [
               "turn:eu-turn1.xirsys.com:80?transport=udp",
               "turn:eu-turn1.xirsys.com:3478?transport=udp", 
               "turn:eu-turn1.xirsys.com:80?transport=tcp",
               "turn:eu-turn1.xirsys.com:3478?transport=tcp",
               "turns:eu-turn1.xirsys.com:443?transport=tcp",
               "turns:eu-turn1.xirsys.com:5349?transport=tcp"
             ]
           }
         ]
       }
     }
   })
 } catch (error) {
   console.error("Database error:", error)
   return NextResponse.json({ error: "Internal server error" }, { status: 500 })
 }
}
