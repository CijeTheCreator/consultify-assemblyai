import { Html, Body, Container, Heading, Text, Section } from "@react-email/components"

interface Medication {
  drug_name: string
  amount: string
  frequency: string
}

interface PrescriptionEmailProps {
  medications: Medication[]
  doctorName: string
  patientName: string
  timestamp: string
}

export default function PrescriptionEmail({
  medications,
  doctorName,
  patientName,
  timestamp,
}: PrescriptionEmailProps) {
  const date = new Date(timestamp)

  return (
    <Html>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading as="h2" style={styles.title}>
            🧾 Prescription
          </Heading>

          <Section style={styles.section}>
            <Text>
              <strong>Doctor:</strong> Dr. {doctorName}
            </Text>
            <Text>
              <strong>Patient:</strong> {patientName}
            </Text>
          </Section>

          {medications.map((med, index) => (
            <Section key={index} style={styles.medicationCard}>
              <Text style={styles.medicationTitle}>{med.drug_name}</Text>
              <Text>
                <strong>Amount:</strong> {med.amount}
              </Text>
              <Text>
                <strong>Frequency:</strong> {med.frequency}
              </Text>
            </Section>
          ))}

          <Text style={styles.footer}>
            Prescribed on {date.toLocaleDateString()} at{" "}
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: "#f6fdf7",
    fontFamily: "Helvetica, Arial, sans-serif",
    color: "#1f2937",
    padding: "20px",
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #d1fae5",
    borderRadius: "8px",
    padding: "24px",
    maxWidth: "480px",
    margin: "0 auto",
  },
  title: {
    color: "#047857",
    fontSize: "20px",
    marginBottom: "8px",
  },
  section: {
    marginBottom: "16px",
  },
  medicationCard: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #d1fae5",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "12px",
  },
  medicationTitle: {
    fontSize: "16px",
    fontWeight: "bold" as const,
    marginBottom: "4px",
  },
  footer: {
    fontSize: "12px",
    color: "#6b7280",
    borderTop: "1px solid #d1fae5",
    paddingTop: "12px",
    marginTop: "16px",
    textAlign: "right" as const,
  },
}
