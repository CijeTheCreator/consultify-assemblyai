// app/api/send-prescription/route.ts
import PrescriptionEmail from "@/emails/prescription";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Medication {
  drug_name: string
  amount: string
  frequency: string
}

interface SendPrescriptionRequest {
  email: string
  medications: Medication[]
  doctorName: string
  patientName: string
  timestamp: string
}

export async function POST(req: Request) {
  const { email, medications, doctorName, patientName, timestamp }: SendPrescriptionRequest = await req.json();

  const { error } = await resend.emails.send({
    from: "Consultify <prescriptions@resend.dev>",
    to: email,
    subject: "Your Prescription",
    react: PrescriptionEmail({
      medications,
      doctorName,
      patientName,
      timestamp
    }),
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ message: "Prescription email sent successfully" });
}
