import {
  PrismaClient,
  UserRole,
  Gender,
  ProcedureCategory,
  AppointmentType,
  AppointmentStatus,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.treatmentItem.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinicSettings.deleteMany();

  // Create Clinic Settings
  const clinicSettings = await prisma.clinicSettings.create({
    data: {
      clinicName: "SmileTrace Dental Clinic",
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA",
      phone: "(555) 123-4567",
      email: "info@smiletrace.com",
      website: "https://smiletrace.com",
      taxId: "TAX123456",
      licenseNumber: "LIC789012",
      workingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { open: "09:00", close: "14:00" },
        sunday: { closed: true },
      },
      appointmentDuration: 30,
      appointmentBuffer: 5,
      reminderEnabled: true,
      reminderAdvanceHours: 24,
      receiptPrefix: "RCP",
      receiptFooter:
        "Thank you for choosing SmileTrace Dental Clinic. We appreciate your trust in our services.",
    },
  });

  console.log("✅ Clinic settings created");

  // Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@smiletrace.com",
      password: hashedPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      phone: "(555) 100-0001",
    },
  });

  const dentist1 = await prisma.user.create({
    data: {
      email: "dr.smith@smiletrace.com",
      password: hashedPassword,
      name: "Dr. John Smith",
      role: UserRole.DENTIST,
      licenseNumber: "DDS-12345",
      specialization: "General Dentistry",
      phone: "(555) 100-0002",
    },
  });

  const dentist2 = await prisma.user.create({
    data: {
      email: "dr.johnson@smiletrace.com",
      password: hashedPassword,
      name: "Dr. Sarah Johnson",
      role: UserRole.DENTIST,
      licenseNumber: "DDS-67890",
      specialization: "Orthodontics",
      phone: "(555) 100-0003",
    },
  });

  const assistant = await prisma.user.create({
    data: {
      email: "assistant@smiletrace.com",
      password: hashedPassword,
      name: "Emily Brown",
      role: UserRole.ASSISTANT,
      phone: "(555) 100-0004",
    },
  });

  console.log("✅ Users created");

  // Create Procedures
  const procedures = await Promise.all([
    // Diagnostic
    prisma.procedure.create({
      data: {
        code: "D0150",
        name: "Comprehensive Oral Evaluation",
        category: ProcedureCategory.DIAGNOSTIC,
        description: "New or established patient comprehensive evaluation",
        defaultCost: 150.0,
        insuranceCost: 100.0,
        estimatedDurationMinutes: 30,
      },
    }),
    prisma.procedure.create({
      data: {
        code: "D0210",
        name: "Intraoral X-Ray",
        category: ProcedureCategory.DIAGNOSTIC,
        description: "Complete series including bitewing x-rays",
        defaultCost: 120.0,
        insuranceCost: 80.0,
        estimatedDurationMinutes: 15,
      },
    }),

    // Preventive
    prisma.procedure.create({
      data: {
        code: "D1110",
        name: "Prophylaxis (Cleaning)",
        category: ProcedureCategory.PREVENTIVE,
        description: "Adult teeth cleaning",
        defaultCost: 100.0,
        insuranceCost: 70.0,
        estimatedDurationMinutes: 45,
      },
    }),
    prisma.procedure.create({
      data: {
        code: "D1208",
        name: "Topical Fluoride Treatment",
        category: ProcedureCategory.PREVENTIVE,
        description: "Fluoride varnish application",
        defaultCost: 40.0,
        insuranceCost: 25.0,
        estimatedDurationMinutes: 10,
      },
    }),

    // Restorative
    prisma.procedure.create({
      data: {
        code: "D2330",
        name: "Composite Filling - 1 Surface",
        category: ProcedureCategory.RESTORATIVE,
        description: "Resin-based composite filling, one surface",
        defaultCost: 150.0,
        insuranceCost: 100.0,
        estimatedDurationMinutes: 30,
      },
    }),
    prisma.procedure.create({
      data: {
        code: "D2331",
        name: "Composite Filling - 2 Surfaces",
        category: ProcedureCategory.RESTORATIVE,
        description: "Resin-based composite filling, two surfaces",
        defaultCost: 200.0,
        insuranceCost: 140.0,
        estimatedDurationMinutes: 40,
      },
    }),
    prisma.procedure.create({
      data: {
        code: "D2740",
        name: "Crown - Porcelain/Ceramic",
        category: ProcedureCategory.RESTORATIVE,
        description: "Porcelain or ceramic crown",
        defaultCost: 1200.0,
        insuranceCost: 800.0,
        estimatedDurationMinutes: 60,
      },
    }),

    // Endodontics
    prisma.procedure.create({
      data: {
        code: "D3310",
        name: "Root Canal - Anterior",
        category: ProcedureCategory.ENDODONTICS,
        description: "Endodontic therapy, anterior tooth",
        defaultCost: 800.0,
        insuranceCost: 600.0,
        estimatedDurationMinutes: 90,
      },
    }),

    // Oral Surgery
    prisma.procedure.create({
      data: {
        code: "D7210",
        name: "Extraction - Erupted Tooth",
        category: ProcedureCategory.ORAL_SURGERY,
        description: "Surgical removal of erupted tooth",
        defaultCost: 200.0,
        insuranceCost: 150.0,
        estimatedDurationMinutes: 30,
      },
    }),
    prisma.procedure.create({
      data: {
        code: "D7240",
        name: "Extraction - Impacted Tooth",
        category: ProcedureCategory.ORAL_SURGERY,
        description: "Removal of impacted tooth - completely bony",
        defaultCost: 500.0,
        insuranceCost: 350.0,
        estimatedDurationMinutes: 60,
      },
    }),
  ]);

  console.log("✅ Procedures created");

  // Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      firstName: "Michael",
      lastName: "Anderson",
      email: "michael.anderson@email.com",
      phone: "(555) 234-5678",
      dateOfBirth: new Date("1985-03-15"),
      gender: Gender.MALE,
      address: "456 Oak Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      bloodType: "O+",
      allergies: ["Penicillin"],
      medications: ["Lisinopril"],
      medicalHistory: "Hypertension, controlled with medication",
      insuranceProvider: "Delta Dental",
      insurancePolicyNumber: "DD123456789",
      emergencyContactName: "Jennifer Anderson",
      emergencyContactPhone: "(555) 234-5679",
      emergencyContactRelation: "Spouse",
      createdById: dentist1.id,
      lastVisitAt: new Date(),
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      firstName: "Emma",
      lastName: "Wilson",
      email: "emma.wilson@email.com",
      phone: "(555) 345-6789",
      dateOfBirth: new Date("1992-07-22"),
      gender: Gender.FEMALE,
      address: "789 Pine Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94104",
      bloodType: "A+",
      allergies: [],
      medications: [],
      medicalHistory: "No significant medical history",
      insuranceProvider: "MetLife",
      insurancePolicyNumber: "ML987654321",
      emergencyContactName: "David Wilson",
      emergencyContactPhone: "(555) 345-6790",
      emergencyContactRelation: "Father",
      createdById: dentist1.id,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      firstName: "James",
      lastName: "Martinez",
      email: "james.martinez@email.com",
      phone: "(555) 456-7890",
      dateOfBirth: new Date("1978-11-30"),
      gender: Gender.MALE,
      address: "321 Elm Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      bloodType: "B+",
      allergies: ["Latex", "Iodine"],
      medications: ["Metformin", "Atorvastatin"],
      medicalHistory: "Type 2 Diabetes, High Cholesterol",
      insuranceProvider: "Cigna",
      insurancePolicyNumber: "CG456789123",
      emergencyContactName: "Maria Martinez",
      emergencyContactPhone: "(555) 456-7891",
      emergencyContactRelation: "Wife",
      createdById: dentist2.id,
    },
  });

  console.log("✅ Patients created");

  // Create Treatments with TreatmentItems
  const treatment1 = await prisma.treatment.create({
    data: {
      patientId: patient1.id,
      dentistId: dentist1.id,
      chiefComplaint: "Pain in upper right molar",
      diagnosis: "Cavity in tooth #3",
      treatmentPlan: "Composite filling recommended",
      notes: "Patient reported sensitivity to cold",
      totalCost: 200.0,
      paidAmount: 200.0,
      discount: 0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      treatmentDate: new Date("2024-01-15"),
      items: {
        create: [
          {
            procedureId: procedures[4].id, // Composite Filling - 1 Surface
            toothNumbers: [3],
            toothSurfaces: ["O"], // Occlusal surface
            quantity: 1,
            unitCost: 150.0,
            totalCost: 150.0,
            status: "COMPLETED",
          },
          {
            procedureId: procedures[1].id, // X-Ray
            toothNumbers: [3],
            quantity: 1,
            unitCost: 50.0,
            totalCost: 50.0,
            status: "COMPLETED",
          },
        ],
      },
    },
  });

  const treatment2 = await prisma.treatment.create({
    data: {
      patientId: patient2.id,
      dentistId: dentist1.id,
      chiefComplaint: "Routine checkup and cleaning",
      diagnosis: "Healthy oral condition, mild plaque buildup",
      treatmentPlan: "Continue regular 6-month checkups",
      totalCost: 250.0,
      paidAmount: 150.0,
      discount: 0,
      paymentStatus: PaymentStatus.PARTIAL,
      paymentMethod: PaymentMethod.INSURANCE,
      treatmentDate: new Date("2024-02-01"),
      items: {
        create: [
          {
            procedureId: procedures[0].id, // Comprehensive Oral Evaluation
            toothNumbers: [],
            quantity: 1,
            unitCost: 150.0,
            totalCost: 150.0,
            status: "COMPLETED",
          },
          {
            procedureId: procedures[2].id, // Cleaning
            toothNumbers: [],
            quantity: 1,
            unitCost: 100.0,
            totalCost: 100.0,
            status: "COMPLETED",
          },
        ],
      },
    },
  });

  console.log("✅ Treatments created");

  // Create Appointments
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient1.id,
        dentistId: dentist1.id,
        appointmentDate: tomorrow,
        durationMinutes: 60,
        type: AppointmentType.FOLLOW_UP,
        reason: "Follow-up after filling",
        status: AppointmentStatus.SCHEDULED,
        reminderSent: false,
      },
      {
        patientId: patient2.id,
        dentistId: dentist1.id,
        appointmentDate: nextWeek,
        durationMinutes: 45,
        type: AppointmentType.CLEANING,
        reason: "Regular cleaning",
        status: AppointmentStatus.CONFIRMED,
        reminderSent: false,
      },
      {
        patientId: patient3.id,
        dentistId: dentist2.id,
        appointmentDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        durationMinutes: 30,
        type: AppointmentType.CONSULTATION,
        reason: "Consultation for orthodontic treatment",
        status: AppointmentStatus.SCHEDULED,
        reminderSent: true,
        reminderSentAt: new Date(),
      },
    ],
  });

  console.log("✅ Appointments created");

  // Create Receipt for completed treatment
  await prisma.receipt.create({
    data: {
      treatmentId: treatment1.id,
      issuedById: dentist1.id,
      receiptNumber: "RCP-2024-001",
      subtotal: 200.0,
      discount: 0,
      tax: 16.0,
      totalAmount: 216.0,
      paidAmount: 216.0,
      balanceDue: 0,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentDate: new Date("2024-01-15"),
      transactionId: "TXN123456",
      qrCode: "https://smiletrace.com/verify/RCP-2024-001",
      emailSent: true,
      emailSentAt: new Date("2024-01-15"),
      emailAddress: patient1.email,
      status: "PAID",
    },
  });

  console.log("✅ Receipt created");

  // Create some audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: dentist1.id,
        userEmail: dentist1.email,
        userName: dentist1.name,
        action: "CREATE",
        entityType: "Patient",
        entityId: patient1.id,
        newData: {
          name: "Michael Anderson",
          email: "michael.anderson@email.com",
        },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        newValue: ""
      },
      {
        userId: dentist1.id,
        userEmail: dentist1.email,
        userName: dentist1.name,
        action: "CREATE",
        entityType: "Treatment",
        entityId: treatment1.id,
        newData: { patientId: patient1.id, totalCost: 200 },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        newValue: ""
      },
    ],
  });

  console.log("✅ Audit logs created");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
