import { PrismaClient, Gender, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Creăm un dentist dacă nu există
  const dentist = await prisma.user.upsert({
    where: { email: "dentist@example.com" },
    update: {},
    create: {
      email: "dentist@example.com",
      password: null,
      name: "Dr. John Dentist",
      role: UserRole.DENTIST,
      phone: "+15551234567",
      isActive: true
    }
  });

  console.log("👨‍⚕️ Dentist ID:", dentist.id);

  // 2. Seed Pacienți
  const patientsData = [
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      phone: "+1555000123",
      dateOfBirth: new Date("1990-03-12"),
      gender: Gender.FEMALE,
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      allergies: ["Penicillin"],
      medications: ["Ibuprofen"],
      bloodType: "A+",
      insuranceProvider: "Blue Cross",
      insurancePolicyNumber: "BC123456",
      emergencyContactName: "Michael Johnson",
      emergencyContactPhone: "+1555000456",
      notes: "Patient experiences occasional headaches.",
      createdById: dentist.id
    },
    {
      firstName: "Robert",
      lastName: "Smith",
      email: "robert.smith@example.com",
      phone: "+1555000789",
      dateOfBirth: new Date("1985-07-21"),
      gender: Gender.MALE,
      address: "45 Sunset Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
      allergies: [],
      medications: [],
      bloodType: "O-",
      insuranceProvider: "United Health",
      insurancePolicyNumber: "UH987654",
      emergencyContactName: "Laura Smith",
      emergencyContactPhone: "+1555000678",
      notes: "Smoker. Recommended yearly dental cleaning.",
      createdById: dentist.id
    },
    {
      firstName: "Maria",
      lastName: "Lopez",
      email: "maria.lopez@example.com",
      phone: "+1555000999",
      dateOfBirth: new Date("1992-11-04"),
      gender: Gender.FEMALE,
      address: "88 Palm Drive",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "USA",
      allergies: ["Aspirin"],
      medications: ["Vitamin D"],
      bloodType: "B+",
      insuranceProvider: "Aetna",
      insurancePolicyNumber: "AE654321",
      emergencyContactName: "Carlos Lopez",
      emergencyContactPhone: "+1555000111",
      notes: "Patient reports gum sensitivity.",
      createdById: dentist.id
    }
  ];

  for (const data of patientsData) {
    const patient = await prisma.patient.upsert({
      where: { email: data.email },
      update: {},
      create: data
    });

    console.log(`🧑‍⚕️ Added patient: ${patient.firstName} ${patient.lastName}`);
  }

  console.log("🌱 Seed completed!");
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
