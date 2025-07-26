import { PrismaClient, Role } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const doctor1 = await prisma.user.upsert({
    where: { email: "dr.smith@hospital.com" },
    update: {},
    create: {
      email: "dr.smith@hospital.com",
      name: "Dr. Sarah Smith",
      role: Role.DOCTOR,
      specialization: "Cardiology",
    },
  })

  const doctor2 = await prisma.user.upsert({
    where: { email: "dr.johnson@clinic.com" },
    update: {},
    create: {
      email: "dr.johnson@clinic.com",
      name: "Dr. Michael Johnson",
      role: Role.DOCTOR,
      specialization: "General Medicine",
    },
  })

  const patient1 = await prisma.user.upsert({
    where: { email: "patient1@email.com" },
    update: {},
    create: {
      email: "patient1@email.com",
      name: "John Doe",
      role: Role.PATIENT,
    },
  })

  const patient2 = await prisma.user.upsert({
    where: { email: "patient2@email.com" },
    update: {},
    create: {
      email: "patient2@email.com",
      name: "Jane Wilson",
      role: Role.PATIENT,
    },
  })

  // Create sample consultations
  const consultation1 = await prisma.consultation.upsert({
    where: { id: "sample-consultation-1" },
    update: {},
    create: {
      id: "sample-consultation-1",
      patientId: patient1.id,
      doctorId: doctor1.id,
      title: "General Health Checkup",
      status: "ACTIVE",
    },
  })

  const consultation2 = await prisma.consultation.upsert({
    where: { id: "sample-consultation-2" },
    update: {},
    create: {
      id: "sample-consultation-2",
      patientId: patient2.id,
      doctorId: doctor2.id,
      title: "Follow-up Consultation",
      status: "COMPLETED",
    },
  })

  console.log("Database seeded successfully!")
  console.log({ doctor1, doctor2, patient1, patient2, consultation1, consultation2 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
